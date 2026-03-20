import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Accelerometer } from 'expo-sensors';

// ─── Types ────────────────────────────────────────────────────────────────────

type SensorData = { x: number; y: number; z: number };
type FilterMode = 'none' | 'mean' | 'median';

const FILTER_WINDOW = 8;   // Anzahl Werte für Glättung
const HISTORY_MAX  = 20;   // Anzahl Einträge in der Historie

// ─── Filter-Hilfsfunktionen ───────────────────────────────────────────────────

/** Arithmetisches Mittel der letzten n Werte */
function applyMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Median: Sortierung + mittlerer Wert (resistent gegen Ausreisser) */
function applyMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function applyFilter(buffer: SensorData[], mode: FilterMode): SensorData {
  if (mode === 'none' || buffer.length === 0) return buffer[buffer.length - 1] ?? { x: 0, y: 0, z: 0 };
  const fn = mode === 'mean' ? applyMean : applyMedian;
  return {
    x: fn(buffer.map((d) => d.x)),
    y: fn(buffer.map((d) => d.y)),
    z: fn(buffer.map((d) => d.z)),
  };
}

// ─── Konstanten ───────────────────────────────────────────────────────────────

const AXIS_COLORS: Record<string, { bar: string; dim: string; label: string }> = {
  X: { bar: '#4f9cf9', dim: '#d0e6ff', label: '#1a5fa8' },
  Y: { bar: '#34c47c', dim: '#c5f0db', label: '#1a7a4a' },
  Z: { bar: '#f59e0b', dim: '#fde9b3', label: '#92600a' },
};

const FILTER_OPTIONS: { mode: FilterMode; label: string; description: string }[] = [
  { mode: 'none',   label: 'Roh',    description: 'Keine Glättung' },
  { mode: 'mean',   label: 'Mittel', description: 'Ø letzte 8 Werte' },
  { mode: 'median', label: 'Median', description: 'Mittl. v. 8 Werten' },
];

// ─── AxisBar ─────────────────────────────────────────────────────────────────

function AxisBar({ label, value }: { label: string; value: number }) {
  const clamped  = Math.max(-1, Math.min(1, value));
  const fillWidth = Math.abs(clamped) * 100;
  const isNeg    = clamped < 0;
  const colors   = AXIS_COLORS[label];

  return (
    <View style={styles.axisRow}>
      <View style={styles.axisHeader}>
        <View style={[styles.axisLabelBadge, { backgroundColor: colors.dim }]}>
          <Text style={[styles.axisLabel, { color: colors.label }]}>{label}</Text>
        </View>
        <Text style={styles.axisValue}>{value.toFixed(4)}</Text>
        <Text style={styles.axisUnit}>g</Text>
      </View>

      <View style={styles.barTrack}>
        <View style={styles.barHalfNeg}>
          <View
            style={[
              styles.barFill,
              {
                backgroundColor: isNeg ? colors.bar : 'transparent',
                width: `${isNeg ? fillWidth : 0}%`,
                alignSelf: 'flex-end',
                borderTopLeftRadius: 4,
                borderBottomLeftRadius: 4,
              },
            ]}
          />
        </View>
        <View style={styles.barCenterLine} />
        <View style={styles.barHalfPos}>
          <View
            style={[
              styles.barFill,
              {
                backgroundColor: !isNeg ? colors.bar : 'transparent',
                width: `${!isNeg ? fillWidth : 0}%`,
                borderTopRightRadius: 4,
                borderBottomRightRadius: 4,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.barLabels}>
        <Text style={styles.barLabelEdge}>−1</Text>
        <Text style={styles.barLabelEdge}>0</Text>
        <Text style={styles.barLabelEdge}>+1</Text>
      </View>
    </View>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function SensorDebug() {
  const [filterMode, setFilterMode] = useState<FilterMode>('none');
  const [smoothed, setSmoothed]     = useState<SensorData>({ x: 0, y: 0, z: 0 });
  const [history, setHistory]       = useState<(SensorData & { ts: number })[]>([]);
  const [running, setRunning]       = useState(true);

  // Ring-Buffer für Glättungs-Fenster (wird NICHT gerendert, daher useRef)
  const bufferRef        = useRef<SensorData[]>([]);
  const subscriptionRef  = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
  // filterMode als Ref damit der Listener immer den aktuellen Wert sieht
  const filterModeRef    = useRef<FilterMode>(filterMode);
  filterModeRef.current  = filterMode;

  const startListening = () => {
    Accelerometer.setUpdateInterval(100);
    subscriptionRef.current = Accelerometer.addListener((raw) => {
      // Buffer aktualisieren (FIFO, max FILTER_WINDOW Einträge)
      bufferRef.current = [...bufferRef.current.slice(-(FILTER_WINDOW - 1)), raw];

      const filtered = applyFilter(bufferRef.current, filterModeRef.current);

      setSmoothed(filtered);
      setHistory((prev) => {
        const next = [{ ...raw, ts: Date.now() }, ...prev];
        return next.slice(0, HISTORY_MAX);
      });
    });
  };

  const stopListening = () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  };

  useEffect(() => {
    if (running) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [running]);

  const magnitude = Math.sqrt(smoothed.x ** 2 + smoothed.y ** 2 + smoothed.z ** 2);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Accelerometer</Text>
        <View style={[styles.statusBadge, running ? styles.statusLive : styles.statusPaused]}>
          <View style={[styles.statusDot, running ? styles.statusDotLive : styles.statusDotPaused]} />
          <Text style={[styles.statusText, running ? styles.statusTextLive : styles.statusTextPaused]}>
            {running ? 'Live' : 'Paused'}
          </Text>
        </View>
      </View>

      {/* ── Filter-Auswahl ── */}
      <View style={styles.filterCard}>
        <Text style={styles.sectionTitle}>Low-Pass Filter</Text>
        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map(({ mode, label, description }) => {
            const active = filterMode === mode;
            return (
              <Pressable
                key={mode}
                style={[styles.filterBtn, active && styles.filterBtnActive]}
                onPress={() => setFilterMode(mode)}
              >
                <Text style={[styles.filterBtnLabel, active && styles.filterBtnLabelActive]}>{label}</Text>
                <Text style={[styles.filterBtnDesc,  active && styles.filterBtnDescActive]}>{description}</Text>
              </Pressable>
            );
          })}
        </View>
        {filterMode !== 'none' && (
          <Text style={styles.filterHint}>
            {filterMode === 'mean'
              ? 'Arithmetisches Mittel – stabil, aber etwas träge bei schnellen Bewegungen.'
              : 'Median – entfernt Ausreisser (Spikes) ohne das Signal zu verzerren.'}
          </Text>
        )}
      </View>

      {/* ── Magnitude ── */}
      <View style={styles.magnitudeCard}>
        <Text style={styles.magnitudeLabel}>Gesamtbeschleunigung</Text>
        <Text style={styles.magnitudeValue}>{magnitude.toFixed(4)}</Text>
        <Text style={styles.magnitudeUnit}>g</Text>
      </View>

      {/* ── Achsen ── */}
      <View style={styles.axisCard}>
        <AxisBar label="X" value={smoothed.x} />
        <View style={styles.divider} />
        <AxisBar label="Y" value={smoothed.y} />
        <View style={styles.divider} />
        <AxisBar label="Z" value={smoothed.z} />
      </View>

      {/* ── Steuerung ── */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          running ? styles.buttonStop : styles.buttonResume,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => setRunning((prev) => !prev)}
      >
        <Text style={styles.buttonText}>{running ? '⏸  Pause' : '▶  Resume'}</Text>
      </Pressable>

      {/* ── Historie ── */}
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Historie</Text>
          <Text style={styles.historyCount}>{history.length} / {HISTORY_MAX}</Text>
        </View>

        {/* Spalten-Header */}
        <View style={styles.historyRow}>
          <Text style={[styles.historyCell, styles.historyCellHeader, styles.colTime]}>#</Text>
          <Text style={[styles.historyCell, styles.historyCellHeader, styles.colAxis, { color: AXIS_COLORS.X.label }]}>X</Text>
          <Text style={[styles.historyCell, styles.historyCellHeader, styles.colAxis, { color: AXIS_COLORS.Y.label }]}>Y</Text>
          <Text style={[styles.historyCell, styles.historyCellHeader, styles.colAxis, { color: AXIS_COLORS.Z.label }]}>Z</Text>
        </View>

        {history.map((entry, i) => (
          <View
            key={entry.ts}
            style={[styles.historyRow, i % 2 === 0 ? styles.historyRowEven : styles.historyRowOdd]}
          >
            <Text style={[styles.historyCell, styles.colTime, styles.historyIndex]}>{i + 1}</Text>
            <Text style={[styles.historyCell, styles.colAxis]}>{entry.x.toFixed(3)}</Text>
            <Text style={[styles.historyCell, styles.colAxis]}>{entry.y.toFixed(3)}</Text>
            <Text style={[styles.historyCell, styles.colAxis]}>{entry.z.toFixed(3)}</Text>
          </View>
        ))}

        {history.length === 0 && (
          <Text style={styles.historyEmpty}>Noch keine Daten…</Text>
        )}
      </View>

      <Text style={styles.hint}>Update-Rate: 100 ms · 10 Hz · Fenster: {FILTER_WINDOW} Werte</Text>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f0f4f8' },
  container: { padding: 20, paddingBottom: 40 },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 8 },
  title:  { fontSize: 26, fontWeight: '800', color: '#111', letterSpacing: -0.5 },
  statusBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
  statusLive:      { backgroundColor: '#dcfce7' },
  statusPaused:    { backgroundColor: '#f1f5f9' },
  statusDot:       { width: 8, height: 8, borderRadius: 4 },
  statusDotLive:   { backgroundColor: '#22c55e' },
  statusDotPaused: { backgroundColor: '#94a3b8' },
  statusText:      { fontSize: 13, fontWeight: '600' },
  statusTextLive:  { color: '#16a34a' },
  statusTextPaused:{ color: '#64748b' },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },

  /* Filter */
  filterCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  filterRow:  { flexDirection: 'row', gap: 8 },
  filterBtn:  { flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0', paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', backgroundColor: '#f8fafc' },
  filterBtnActive: { borderColor: '#4f9cf9', backgroundColor: '#eff6ff' },
  filterBtnLabel:      { fontSize: 14, fontWeight: '700', color: '#64748b' },
  filterBtnLabelActive:{ color: '#1a5fa8' },
  filterBtnDesc:      { fontSize: 10, color: '#94a3b8', marginTop: 2, textAlign: 'center' },
  filterBtnDescActive:{ color: '#4f9cf9' },
  filterHint: { marginTop: 10, fontSize: 12, color: '#64748b', lineHeight: 17, borderLeftWidth: 3, borderLeftColor: '#4f9cf9', paddingLeft: 8 },

  /* Magnitude */
  magnitudeCard:  { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 16, flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  magnitudeLabel: { fontSize: 13, color: '#94a3b8', flex: 1 },
  magnitudeValue: { fontSize: 28, fontWeight: '800', color: '#f8fafc', fontVariant: ['tabular-nums'] },
  magnitudeUnit:  { fontSize: 14, color: '#64748b', fontWeight: '600' },

  /* Axis card */
  axisCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  divider:  { height: 1, backgroundColor: '#f1f5f9', marginVertical: 16 },

  axisRow:    { gap: 8 },
  axisHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  axisLabelBadge: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  axisLabel:  { fontSize: 13, fontWeight: '700' },
  axisValue:  { fontSize: 22, fontWeight: '700', color: '#111', fontVariant: ['tabular-nums'], flex: 1 },
  axisUnit:   { fontSize: 13, color: '#94a3b8', fontWeight: '500' },

  barTrack:     { flexDirection: 'row', alignItems: 'center', height: 18, backgroundColor: '#f1f5f9', borderRadius: 9, overflow: 'hidden' },
  barHalfNeg:   { flex: 1, height: '100%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  barHalfPos:   { flex: 1, height: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  barFill:      { height: '100%' },
  barCenterLine:{ width: 2, height: '80%', backgroundColor: '#cbd5e1', borderRadius: 1 },
  barLabels:    { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  barLabelEdge: { fontSize: 10, color: '#94a3b8' },

  /* Button */
  button:        { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  buttonStop:    { backgroundColor: '#ef4444' },
  buttonResume:  { backgroundColor: '#22c55e' },
  buttonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  buttonText:    { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  /* Historie */
  historyCard:  { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  historyHeader:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  historyCount: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  historyRow:   { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 4, borderRadius: 6 },
  historyRowEven:{ backgroundColor: '#f8fafc' },
  historyRowOdd: { backgroundColor: '#fff' },
  historyCell:  { fontVariant: ['tabular-nums'], fontSize: 12, color: '#374151' },
  historyCellHeader: { fontWeight: '700', color: '#6b7280', fontSize: 11 },
  historyIndex: { color: '#94a3b8' },
  colTime:      { width: 28 },
  colAxis:      { flex: 1, textAlign: 'right' },
  historyEmpty: { textAlign: 'center', color: '#94a3b8', fontSize: 13, paddingVertical: 12 },

  hint: { textAlign: 'center', fontSize: 12, color: '#94a3b8' },
});
