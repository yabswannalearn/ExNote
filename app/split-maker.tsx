import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChipTabs } from '@/components/split-maker/chip-tabs';
import { ContextHeader } from '@/components/split-maker/context-header';
import { EmptyState } from '@/components/split-maker/empty-state';
import { EntityRow } from '@/components/split-maker/entity-row';
import { ExerciseFormModal } from '@/components/split-maker/exercise-form-modal';
import { palette } from '@/components/split-maker/palette';
import { PrimaryButton } from '@/components/split-maker/primary-button';
import { RenameModal } from '@/components/split-maker/rename-modal';
import { useSplitMaker } from '@/hooks/use-split-maker';
import type { ExerciseInput, ExercisePrescription } from '@/types/workout';

type Prompt =
  | { kind: 'add-split' }
  | { kind: 'rename-split'; id: number; name: string }
  | { kind: 'add-day' }
  | { kind: 'rename-day'; id: number; name: string }
  | null;

const PROMPT_TITLES: Record<NonNullable<Prompt>['kind'], string> = {
  'add-split': 'New Split Program',
  'rename-split': 'Rename Split Program',
  'add-day': 'New Training Day',
  'rename-day': 'Rename Training Day',
};

function confirmDelete(message: string, onConfirm: () => void) {
  Alert.alert('Delete', message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function SplitMakerScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ splitId?: string }>();
  const initialSplitId = params.splitId ? Number(params.splitId) : undefined;
  const sm = useSplitMaker(initialSplitId);

  const [prompt, setPrompt] = useState<Prompt>(null);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExercisePrescription | null>(null);

  function openAddExercise() {
    setEditingExercise(null);
    setExerciseModalOpen(true);
  }

  function openEditExercise(exercise: ExercisePrescription) {
    setEditingExercise(exercise);
    setExerciseModalOpen(true);
  }

  function submitExercise(input: ExerciseInput) {
    if (editingExercise) sm.updateExercise(editingExercise.id, input);
    else sm.addExercise(input);
  }

  function submitPrompt(value: string) {
    if (!prompt) return;
    switch (prompt.kind) {
      case 'add-split':
        return sm.addSplit(value);
      case 'rename-split':
        return sm.renameSplit(prompt.id, value);
      case 'add-day':
        return sm.addDay(value);
      case 'rename-day':
        return sm.renameDay(prompt.id, value);
    }
  }

  const promptInitial = prompt && 'name' in prompt ? prompt.name : '';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.heading}>
          <Text style={styles.title}>Split Program Maker</Text>
          <Text style={styles.subtitle}>Pick a split to see its days and workouts.</Text>
        </View>

        <ChipTabs
          items={sm.splitPrograms.map((s) => ({ id: s.id, label: s.name }))}
          selectedId={sm.selectedSplitId}
          onSelect={sm.setSelectedSplitId}
          onAdd={() => setPrompt({ kind: 'add-split' })}
          addLabel="New Split"
        />

        {!sm.selectedSplit ? (
          <EmptyState icon="albums-outline" text="Create your first split program to begin." />
        ) : (
          <>
            {/* Training Days within the active split */}
            <View style={styles.card}>
              <ContextHeader
                label="Training Days in"
                title={sm.selectedSplit.name}
                onEdit={() =>
                  setPrompt({
                    kind: 'rename-split',
                    id: sm.selectedSplit!.id,
                    name: sm.selectedSplit!.name,
                  })
                }
                onDelete={() =>
                  confirmDelete(`Delete "${sm.selectedSplit!.name}" and all its days?`, () =>
                    sm.removeSplit(sm.selectedSplit!.id)
                  )
                }
              />
              <ChipTabs
                items={sm.trainingDays.map((d) => ({ id: d.id, label: d.name }))}
                selectedId={sm.selectedDayId}
                onSelect={sm.setSelectedDayId}
                onAdd={() => setPrompt({ kind: 'add-day' })}
                addLabel="New Day"
              />
              {sm.trainingDays.length === 0 ? (
                <EmptyState icon="calendar-outline" text="Add a training day to this split." />
              ) : null}
            </View>

            {/* Exercises within the active day */}
            {sm.selectedDay ? (
              <View style={styles.card}>
                <ContextHeader
                  label="Workouts in"
                  title={sm.selectedDay.name}
                  onEdit={() =>
                    setPrompt({
                      kind: 'rename-day',
                      id: sm.selectedDay!.id,
                      name: sm.selectedDay!.name,
                    })
                  }
                  onDelete={() =>
                    confirmDelete(`Delete "${sm.selectedDay!.name}" and its exercises?`, () =>
                      sm.removeDay(sm.selectedDay!.id)
                    )
                  }
                />
                <PrimaryButton label="Add Exercise" icon="add" onPress={openAddExercise} />
                {sm.exercises.length === 0 ? (
                  <EmptyState icon="barbell-outline" text="No workouts in this day yet." />
                ) : (
                  sm.exercises.map((exercise) => (
                    <EntityRow
                      key={exercise.id}
                      title={exercise.exercise_name}
                      subtitle={
                        `${exercise.sets} sets x ${exercise.reps} reps · ${exercise.rest_seconds}s rest` +
                        (exercise.weight !== null ? ` · ${exercise.weight} kg` : '')
                      }
                      onEdit={() => openEditExercise(exercise)}
                      onDelete={() =>
                        confirmDelete(`Delete "${exercise.exercise_name}"?`, () =>
                          sm.removeExercise(exercise.id)
                        )
                      }
                    />
                  ))
                )}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <RenameModal
        visible={prompt !== null}
        title={prompt ? PROMPT_TITLES[prompt.kind] : ''}
        initialValue={promptInitial}
        onSubmit={submitPrompt}
        onClose={() => setPrompt(null)}
      />

      <ExerciseFormModal
        visible={exerciseModalOpen}
        initial={
          editingExercise
            ? {
                exercise_name: editingExercise.exercise_name,
                sets: editingExercise.sets,
                reps: editingExercise.reps,
                rest_seconds: editingExercise.rest_seconds,
                weight: editingExercise.weight,
              }
            : undefined
        }
        onSubmit={submitExercise}
        onClose={() => setExerciseModalOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    padding: 16,
    gap: 14,
  },
  heading: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
  },
  subtitle: {
    fontSize: 15,
    color: palette.textMuted,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 14,
  },
});
