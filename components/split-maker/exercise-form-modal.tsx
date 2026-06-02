import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import type { ExerciseInput } from '@/types/workout';
import { ModalSheet } from './modal-sheet';
import { palette } from './palette';
import { PrimaryButton } from './primary-button';

type Props = {
  visible: boolean;
  // Present = editing an existing exercise; absent = adding a new one.
  initial?: ExerciseInput;
  onSubmit: (input: ExerciseInput) => void;
  onClose: () => void;
};

const DEFAULTS: ExerciseInput = { exercise_name: '', sets: 3, reps: '8-10', rest_seconds: 120 };

export function ExerciseFormModal({ visible, initial, onSubmit, onClose }: Props) {
  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [rest, setRest] = useState('');

  useEffect(() => {
    if (!visible) return;
    const seed = initial ?? DEFAULTS;
    setName(seed.exercise_name);
    setSets(String(seed.sets));
    setReps(seed.reps);
    setRest(String(seed.rest_seconds));
  }, [visible, initial]);

  function save() {
    const trimmedName = name.trim();
    const trimmedReps = reps.trim();
    const parsedSets = Number.parseInt(sets, 10);
    const parsedRest = Number.parseInt(rest, 10);

    if (!trimmedName || !trimmedReps) {
      Alert.alert('Missing details', 'Enter an exercise name and rep target.');
      return;
    }
    if (Number.isNaN(parsedSets) || Number.isNaN(parsedRest)) {
      Alert.alert('Check your numbers', 'Sets and rest time should be numbers.');
      return;
    }

    onSubmit({
      exercise_name: trimmedName,
      sets: parsedSets,
      reps: trimmedReps,
      rest_seconds: parsedRest,
    });
    onClose();
  }

  return (
    <ModalSheet
      visible={visible}
      title={initial ? 'Edit Exercise' : 'Add Exercise'}
      onClose={onClose}>
      <TextInput
        value={name}
        onChangeText={setName}
        autoFocus={!initial}
        placeholder="Bench Press"
        placeholderTextColor={palette.textSubtle}
        style={styles.input}
      />
      <View style={styles.numberRow}>
        <Field label="Sets">
          <TextInput
            value={sets}
            onChangeText={setSets}
            keyboardType="number-pad"
            placeholder="3"
            placeholderTextColor={palette.textSubtle}
            style={styles.input}
          />
        </Field>
        <Field label="Reps">
          <TextInput
            value={reps}
            onChangeText={setReps}
            placeholder="8-10"
            placeholderTextColor={palette.textSubtle}
            style={styles.input}
          />
        </Field>
        <Field label="Rest (s)">
          <TextInput
            value={rest}
            onChangeText={setRest}
            keyboardType="number-pad"
            placeholder="120"
            placeholderTextColor={palette.textSubtle}
            style={styles.input}
          />
        </Field>
      </View>
      <View style={styles.actions}>
        <View style={styles.flex}>
          <PrimaryButton label="Cancel" variant="ghost" onPress={onClose} />
        </View>
        <View style={styles.flex}>
          <PrimaryButton label="Save" icon="checkmark" onPress={save} />
        </View>
      </View>
    </ModalSheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.flex}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
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
  numberRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textMuted,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
