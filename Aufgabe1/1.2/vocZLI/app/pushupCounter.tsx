/**
 * Liegestützenzähler
 *
 * Erkennungslogik (State-Machine):
 *
 *   Das Handy liegt flach auf dem Boden (Display nach oben).
 *   In Ruhe zeigt die Z-Achse ≈ +1 g (Schwerkraft).
 *   Beim Absenken sinkt Z unter LOW_THRESHOLD  → Phase "DOWN" erkannt.
 *   Beim Hochdrücken steigt Z über HIGH_THRESHOLD → Phase "UP" erkannt.
 *   Ein vollständiger Zyklus  UP → DOWN → UP  zählt als 1 Liegestütze.
 *
 *   Cooldown (COOLDOWN_MS) verhindert Mehrfachzählung innerhalb einer Bewegung.
 *
 *   Für die Erkennung wird ein gleitender Mittelwert (SMOOTH_WINDOW) verwendet,
 *   um Rauschen zu dämpfen.
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Accelerometer } from 'expo-sensors';

// ─── Konfiguration (hier anpassen falls nötig) ────────────────────────────────

// Handy liegt flach auf dem Rücken / der Brust.
// In Ruhe: Z ≈ 1.0 g.
// Beim Hochdrücken beschleunigt der Körper nach oben  → Z steigt kurz über 1 g.
// Beim Absenken beschleunigt der Körper nach unten   → Z fällt kurz unter 1 g.
// Die Schwellen liegen deshalb SYMMETRisch um 1 g.
const HIGH_THRESHOLD = 1.20;   // Z-Wert: Aufwärtsbeschleunigung (Körper drückt hoch)
const LOW_THRESHOLD  = 0.75;   // Z-Wert: Abwärtsbeschleunigung (Körper senkt sich)
const COOLDOWN_MS    = 600;    // ms Mindestabstand zwischen zwei Zählungen
const SMOOTH_WINDOW  = 5;      // Anzahl Werte für gleitenden Mittelwert

type Phase = 'up' | 'down' | 'neutral';
type HistoryEntry = { count: number; ts: number };

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function PushupCounter() {
  const [counting, setCounting]   = useState(false);
  const [count, setCount]         = useState(0);
  const [phase, setPhase]         = useState<Phase>('neutral');
  const [zSmoothed, setZSmoothed] = useState(0);
  const [zRaw, setZRaw]           = useState(0);
  const [history, setHistory]     = useState<HistoryEntry[]>([]);

  // Refs: kein Re-Render nötig, aber im Listener abrufbar
  const bufferRef      = useRef<number[]>([]);
  const phaseRef       = useRef<Phase>('neutral');
  const countRef       = useRef(0);
  const lastCountTs    = useRef(0);
  const subRef         = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
  const countingRef    = useRef(false);
  countingRef.current  = counting;

  // ── Sensor starten / stoppen ──────────────────────────────────────────────

  useEffect(() => {
    if (counting) {
      phaseRef.current = 'neutral';
      Accelerometer.setUpdateInterval(50); // 20 Hz für flüssigere Erkennung
      subRef.current = Accelerometer.addListener(({ z }) => {
        if (!countingRef.current) return;

        // Glättung
        bufferRef.current = [...bufferRef.current.slice(-(SMOOTH_WINDOW - 1)), z];
        const smoothZ = mean(bufferRef.current);

        setZRaw(z);
        setZSmoothed(smoothZ);

        // State-Machine
        // phaseRef ist "klebrig": wechselt nur zwischen 'up' und 'down'.
        // Die neutrale Zone setzt phaseRef NICHT zurück, damit der DOWN→UP-
        // Übergang auch dann erkannt wird, wenn Z die Schwellenwerte nicht
        // direkt, sondern über die neutrale Zone passiert.
        const now = Date.now();

        if (smoothZ > HIGH_THRESHOLD) {
          if (phaseRef.current === 'down' && now - lastCountTs.current > COOLDOWN_MS) {
            // DOWN → UP: vollständiger Zyklus
            countRef.current += 1;
            lastCountTs.current = now;
            const snap = countRef.current;
            setCount(snap);
            setHistory((h) => [{ count: snap, ts: now }, ...h].slice(0, 20));
          }
          phaseRef.current = 'up';
        } else if (smoothZ < LOW_THRESHOLD) {
          phaseRef.current = 'down';
        }
        // In der neutralen Zone: phaseRef unverändert lassen

        // Anzeige-Phase separat berechnen (darf neutral zeigen)
        const displayPhase: Phase =
          smoothZ > HIGH_THRESHOLD ? 'up'
          : smoothZ < LOW_THRESHOLD ? 'down'
          : 'neutral';
        setPhase(displayPhase);
      });
    } else {
      subRef.current?.remove();
      subRef.current = null;
    }
    return () => {
      subRef.current?.remove();
      subRef.current = null;
    };
  }, [counting]);

  // ── UI-Hilfswerte ─────────────────────────────────────────────────────────

  const phaseLabel: Record<Phase, string> = {
    up:      'Oben ▲',
    down:    'Unten ▼',
    neutral: '—',
  };
  const phaseColor: Record<Phase, string> = {
    up:      '#22c55e',
    down:    '#ef4444',
    neutral: '#94a3b8',
  };

  // Z-Balken: 0 (= z ≤ 0) … 100% (= z ≥ 2), Mittelpunkt bei 1 g = 50%
  const zBarPct = Math.max(0, Math.min(2, zSmoothed)) / 2 * 100;

  const handleToggle = () => {
    if (!counting) {
      // Reset beim Start
      setCount(0);
      countRef.current = 0;
      setPhase('neutral');
      phaseRef.current = 'neutral';
      bufferRef.current = [];
      lastCountTs.current = 0;
    }
    setCounting((p) => !p);
  };

  const handleReset = () => {
    setCounting(false);
    setCount(0);
    countRef.current = 0;
    setPhase('neutral');
    phaseRef.current = 'neutral';
    bufferRef.current = [];
    lastCountTs.current = 0;
    setHistory([]);
    setZRaw(0);
    setZSmoothed(0);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Liegestützen</Text>
        <View style={[styles.statusBadge, counting ? styles.statusLive : styles.statusIdle]}>
          <View style={[styles.statusDot, counting ? styles.dotLive : styles.dotIdle]} />
          <Text style={[styles.statusText, counting ? styles.textLive : styles.textIdle]}>
            {counting ? 'Aktiv' : 'Gestoppt'}
          </Text>
        </View>
      </View>

      {/* Zähler */}
      <View style={styles.counterCard}>
        <Text style={styles.counterNum}>{count}</Text>
        <Text style={styles.counterLabel}>Liegestützen</Text>
      </View>

      {/* Phase-Anzeige */}
      <View style={styles.phaseCard}>
        <Text style={styles.phaseTitle}>Aktuelle Phase</Text>
        <Text style={[styles.phaseValue, { color: phaseColor[phase] }]}>
          {phaseLabel[phase]}
        </Text>
      </View>

      {/* Debug: Z-Achse live */}
      <View style={styles.debugCard}>
        <View style={styles.debugHeader}>
          <Text style={styles.debugTitle}>Z-Achse (Debug)</Text>
          <Text style={styles.debugRaw}>roh: {zRaw.toFixed(3)} g</Text>
        </View>

        <Text style={styles.debugSmoothed}>geglättet: {zSmoothed.toFixed(3)} g</Text>

        {/* Z-Balken */}
        <View style={styles.zTrack}>
          <View style={[styles.zFill, { width: `${zBarPct}%` }]} />
          {/* Schwellenwert-Markierungen */}
          <View style={[styles.threshold, { left: `${LOW_THRESHOLD / 2 * 100}%` }]}>
            <View style={styles.thresholdLine} />
            <Text style={styles.thresholdLabel}>{LOW_THRESHOLD}</Text>
          </View>
          <View style={[styles.threshold, { left: `${HIGH_THRESHOLD / 2 * 100}%` }]}>
            <View style={styles.thresholdLine} />
            <Text style={styles.thresholdLabel}>{HIGH_THRESHOLD}</Text>
          </View>
        </View>
        <View style={styles.zAxisLabels}>
          <Text style={styles.zAxisLabel}>0 g</Text>
          <Text style={styles.zAxisLabel}>+1 g</Text>
          <Text style={styles.zAxisLabel}>+2 g</Text>
        </View>

        {/* Legende */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Unten &lt; {LOW_THRESHOLD}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.legendText}>Oben &gt; {HIGH_THRESHOLD}</Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [
            styles.btnMain,
            counting ? styles.btnStop : styles.btnStart,
            pressed && styles.btnPressed,
          ]}
          onPress={handleToggle}
        >
          <Text style={styles.btnMainText}>
            {counting ? '⏹  Stop' : '▶  Start'}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btnReset, pressed && styles.btnPressed]}
          onPress={handleReset}
        >
          <Text style={styles.btnResetText}>↺</Text>
        </Pressable>
      </View>

      {/* Hinweis zur Handy-Position */}
      <View style={styles.hintCard}>
        <Text style={styles.hintIcon}>📱</Text>
        <Text style={styles.hintText}>
          Handy flach auf Rücken oder Brust legen (Display nach oben). In Ruhe
          zeigt Z ≈ 1 g. Beim Hochdrücken steigt Z kurz über {HIGH_THRESHOLD} g,
          beim Absenken fällt Z unter {LOW_THRESHOLD} g.
        </Text>
      </View>

      {/* Verlauf */}
      {history.length > 0 && (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Verlauf</Text>
          {history.map((e, i) => (
            <View
              key={e.ts}
              style={[styles.historyRow, i % 2 === 0 ? styles.historyEven : styles.historyOdd]}
            >
              <Text style={styles.historyCount}>#{e.count}</Text>
              <Text style={styles.historyTime}>{formatTime(e.ts)}</Text>
            </View>
          ))}
        </View>
      )}

    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f0f4f8' },
  container: { padding: 20, paddingBottom: 48 },

  /* Header */
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 8 },
  title:        { fontSize: 26, fontWeight: '800', color: '#111', letterSpacing: -0.5 },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
  statusLive:   { backgroundColor: '#dcfce7' },
  statusIdle:   { backgroundColor: '#f1f5f9' },
  statusDot:    { width: 8, height: 8, borderRadius: 4 },
  dotLive:      { backgroundColor: '#22c55e' },
  dotIdle:      { backgroundColor: '#94a3b8' },
  statusText:   { fontSize: 13, fontWeight: '600' },
  textLive:     { color: '#16a34a' },
  textIdle:     { color: '#64748b' },

  /* Zähler */
  counterCard:  { backgroundColor: '#1e293b', borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 16 },
  counterNum:   { fontSize: 88, fontWeight: '900', color: '#f8fafc', lineHeight: 96, fontVariant: ['tabular-nums'] },
  counterLabel: { fontSize: 16, color: '#64748b', fontWeight: '600', marginTop: 4 },

  /* Phase */
  phaseCard:    { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  phaseTitle:   { fontSize: 13, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.8 },
  phaseValue:   { fontSize: 20, fontWeight: '800' },

  /* Debug Z */
  debugCard:    { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  debugHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  debugTitle:   { fontSize: 13, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.8 },
  debugRaw:     { fontSize: 12, color: '#94a3b8', fontVariant: ['tabular-nums'] },
  debugSmoothed:{ fontSize: 13, color: '#475569', fontVariant: ['tabular-nums'], marginBottom: 12 },

  zTrack:       { height: 20, backgroundColor: '#f1f5f9', borderRadius: 10, overflow: 'visible', marginBottom: 4, position: 'relative' },
  zFill:        { height: '100%', backgroundColor: '#4f9cf9', borderRadius: 10 },
  threshold:    { position: 'absolute', top: -4, alignItems: 'center' },
  thresholdLine:{ width: 2, height: 28, backgroundColor: '#475569', borderRadius: 1 },
  thresholdLabel:{ fontSize: 9, color: '#475569', marginTop: 2, fontWeight: '700' },
  zAxisLabels:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  zAxisLabel:   { fontSize: 10, color: '#94a3b8' },
  legendRow:    { flexDirection: 'row', gap: 16 },
  legendItem:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:    { width: 8, height: 8, borderRadius: 4 },
  legendText:   { fontSize: 11, color: '#64748b' },

  /* Buttons */
  buttonRow:    { flexDirection: 'row', gap: 12, marginBottom: 16 },
  btnMain:      { flex: 1, paddingVertical: 18, borderRadius: 14, alignItems: 'center' },
  btnStart:     { backgroundColor: '#22c55e' },
  btnStop:      { backgroundColor: '#ef4444' },
  btnPressed:   { opacity: 0.8, transform: [{ scale: 0.97 }] },
  btnMainText:  { color: '#fff', fontSize: 17, fontWeight: '700' },
  btnReset:     { width: 58, height: 58, borderRadius: 14, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  btnResetText: { fontSize: 26, color: '#475569' },

  /* Hinweis */
  hintCard:     { backgroundColor: '#fffbeb', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, marginBottom: 20, borderWidth: 1, borderColor: '#fde68a' },
  hintIcon:     { fontSize: 20 },
  hintText:     { flex: 1, fontSize: 12, color: '#92600a', lineHeight: 18 },

  /* Verlauf */
  historyCard:  { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  historyTitle: { fontSize: 13, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  historyRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6 },
  historyEven:  { backgroundColor: '#f8fafc' },
  historyOdd:   { backgroundColor: '#fff' },
  historyCount: { fontSize: 14, fontWeight: '700', color: '#1e293b', fontVariant: ['tabular-nums'] },
  historyTime:  { fontSize: 13, color: '#64748b', fontVariant: ['tabular-nums'] },
});
