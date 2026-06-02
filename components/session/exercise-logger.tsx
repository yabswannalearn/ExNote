import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { palette } from '@/components/split-maker/palette';
import type { ExercisePrescription, SetEntry } from '@/types/workout';

type Props = {
  prescription: ExercisePrescription;
  loggedSets: SetEntry[];
  lastEntry: SetEntry | null;
  onLog: (reps: string, weight: number | null) => void;
};

// One exercise within the session: target, last-time hint, the sets already
// logged this session, and inputs to log the next set. Owns its own draft
// inputs so the screen doesn't track state per exercise.
export function ExerciseLogger({ prescription, loggedSets, lastEntry, onLog }: Props) {
  const [reps, setReps] = useState(prescription.reps);
  const [weight, setWeight] = useState(prescription.weight === null ? '' : String(prescription.weight));

  function log() {
    const trimmedReps = reps.trim();
    const trimmedWeight = weight.trim();
    const parsedWeight = trimmedWeight === '' ? null : Number.parseFloat(trimmedWeight);

    if (!trimmedReps) {
      Alert.alert('Missing reps', 'Enter the reps you actually did.');
      return;
    }
    if (parsedWeight !== null && Number.isNaN(parsedWeight)) {
      Alert.alert('Check the weight', 'Weight should be a number, or left blank.');
      return;
    }

    onLog(trimmedReps, parsedWeight);
  }

  const target = `${prescription.sets} x ${prescription.reps}`;
  const done = loggedSets.length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{prescription.exercise_name}</Text>
        <Text style={styles.progress}>
          {done}/{prescription.sets}
        </Text>
      </View>

      <Text style={styles.meta}>
        Target {target} · {prescription.rest_seconds}s rest
      </Text>
      {lastEntry ? (
        <Text style={styles.lastTime}>
          Last time: {lastEntry.weight !== null ? `${lastEntry.weight} kg × ` : ''}
          {lastEntry.reps} reps
        </Text>
      ) : null}

      {loggedSets.map((set) => (
        <View key={set.id} style={styles.loggedRow}>
          <Ionicons name="checkmark-circle" size={18} color={palette.primary} />
          <Text style={styles.loggedText}>
            Set {set.set_number}: {set.reps} reps
            {set.weight !== null ? ` × ${set.weight} kg` : ''}
          </Text>
        </View>
      ))}

      <View style={styles.inputRow}>
        <Field label="Reps">
          <TextInput
            value={reps}
            onChangeText={setReps}
            placeholder="8"
            placeholderTextColor={palette.textSubtle}
            style={styles.input}
          />
        </Field>
        <Field label="Weight (kg)">
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="optional"
            placeholderTextColor={palette.textSubtle}
            style={styles.input}
          />
        </Field>
        <Pressable
          onPress={log}
          style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}>
          <Ionicons name="checkmark" size={22} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: palette.text,
  },
  progress: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.primary,
  },
  meta: {
    fontSize: 13,
    color: palette.textMuted,
  },
  lastTime: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textSubtle,
  },
  loggedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  loggedText: {
    fontSize: 14,
    color: palette.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textMuted,
    marginBottom: 4,
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    fontSize: 15,
    color: palette.text,
  },
  doneButton: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
