import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Accelerometer } from 'expo-sensors';

type SensorData = { x: number; y: number; z: number };

function AxisBar({ label, value }: { label: string; value: number }) {
  // Clamp value to [-1, 1] for display
  const clamped = Math.max(-1, Math.min(1, value));
  const barWidth = Math.abs(clamped) * 120;
  const isNegative = clamped < 0;

  return (
    <View style={styles.axisRow}>
      <Text style={styles.axisLabel}>{label}</Text>
      <Text style={styles.axisValue}>{value.toFixed(3)}</Text>
      <View style={styles.barContainer}>
        {/* Left (negative) side */}
        <View style={styles.barHalf}>
          {isNegative && (
            <View
              style={[
                styles.bar,
                styles.barNegative,
                { width: barWidth, alignSelf: 'flex-end' },
              ]}
            />
          )}
        </View>
        {/* Center divider */}
        <View style={styles.barCenter} />
        {/* Right (positive) side */}
        <View style={styles.barHalf}>
          {!isNegative && (
            <View
              style={[styles.bar, styles.barPositive, { width: barWidth }]}
            />
          )}
        </View>
      </View>
    </View>
  );
}

export default function SensorDebug() {
  const [data, setData] = useState<SensorData>({ x: 0, y: 0, z: 0 });
  const [running, setRunning] = useState(true);
  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);

  const startListening = () => {
    Accelerometer.setUpdateInterval(100);
    subscriptionRef.current = Accelerometer.addListener((sensorData) => {
      setData(sensorData);
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
    return () => {
      stopListening();
    };
  }, [running]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accelerometer</Text>

      <View style={styles.valuesCard}>
        <AxisBar label="X" value={data.x} />
        <AxisBar label="Y" value={data.y} />
        <AxisBar label="Z" value={data.z} />
      </View>

      <Pressable
        style={[styles.button, running ? styles.buttonStop : styles.buttonResume]}
        onPress={() => setRunning((prev) => !prev)}
      >
        <Text style={styles.buttonText}>{running ? 'Pause' : 'Resume'}</Text>
      </Pressable>

      <Text style={styles.hint}>Update-Rate: 100ms (10/s)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a7a4a',
    marginBottom: 24,
  },
  valuesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    gap: 20,
    marginBottom: 32,
  },
  axisRow: {
    gap: 6,
  },
  axisLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  axisValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    fontVariant: ['tabular-nums'],
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
  barHalf: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  barCenter: {
    width: 2,
    height: '100%',
    backgroundColor: '#999',
  },
  bar: {
    height: 12,
    borderRadius: 4,
  },
  barNegative: {
    backgroundColor: '#e05a5a',
  },
  barPositive: {
    backgroundColor: '#1a7a4a',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 10,
    marginBottom: 16,
  },
  buttonStop: {
    backgroundColor: '#e05a5a',
  },
  buttonResume: {
    backgroundColor: '#1a7a4a',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#999',
  },
});
