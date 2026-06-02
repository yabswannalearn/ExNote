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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Breadcrumb } from '@/components/split-maker/breadcrumb';
import { EmptyState } from '@/components/split-maker/empty-state';
import { EntityRow } from '@/components/split-maker/entity-row';
import { ExerciseFormModal } from '@/components/split-maker/exercise-form-modal';
import { InlineAddRow } from '@/components/split-maker/inline-add-row';
import { palette } from '@/components/split-maker/palette';
import { PrimaryButton } from '@/components/split-maker/primary-button';
import { RenameModal } from '@/components/split-maker/rename-modal';
import { SectionCard } from '@/components/split-maker/section-card';
import { useSplitMaker } from '@/hooks/use-split-maker';
import type { ExerciseInput, ExercisePrescription } from '@/types/workout';

type RenameTarget = { kind: 'split' | 'day'; id: number; name: string } | null;

function confirmDelete(message: string, onConfirm: () => void) {
  Alert.alert('Delete', message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function SplitMakerScreen() {
  const insets = useSafeAreaInsets();
  const sm = useSplitMaker();

  const [renameTarget, setRenameTarget] = useState<RenameTarget>(null);
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
    if (editingExercise) {
      sm.updateExercise(editingExercise.id, input);
    } else {
      sm.addExercise(input);
    }
  }

  function submitRename(name: string) {
    if (!renameTarget) return;
    if (renameTarget.kind === 'split') sm.renameSplit(renameTarget.id, name);
    else sm.renameDay(renameTarget.id, name);
  }

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
          <Text style={styles.subtitle}>
            Build reusable programs like PPL or Upper/Lower, one layer at a time.
          </Text>
        </View>

        <Breadcrumb split={sm.selectedSplit?.name} day={sm.selectedDay?.name} />

        <SectionCard step={1} title="Split Programs" count={sm.splitPrograms.length}>
          <InlineAddRow placeholder="PPL, Upper/Lower..." onAdd={sm.addSplit} />
          {sm.splitPrograms.length === 0 ? (
            <EmptyState icon="albums-outline" text="Create your first split program to begin." />
          ) : (
            sm.splitPrograms.map((program) => (
              <EntityRow
                key={program.id}
                title={program.name}
                subtitle={
                  program.id === sm.selectedSplitId ? 'Selected' : 'Tap to edit its days'
                }
                selected={program.id === sm.selectedSplitId}
                onSelect={() => sm.setSelectedSplitId(program.id)}
                onEdit={() =>
                  setRenameTarget({ kind: 'split', id: program.id, name: program.name })
                }
                onDelete={() =>
                  confirmDelete(`Delete "${program.name}" and all its days?`, () =>
                    sm.removeSplit(program.id)
                  )
                }
              />
            ))
          )}
        </SectionCard>

        <SectionCard step={2} title="Training Days" count={sm.trainingDays.length}>
          {!sm.selectedSplit ? (
            <EmptyState icon="lock-closed-outline" text="Select a split program first." />
          ) : (
            <>
              <InlineAddRow placeholder="Push Day, Pull Day..." onAdd={sm.addDay} />
              {sm.trainingDays.length === 0 ? (
                <EmptyState icon="calendar-outline" text="Add a training day to this split." />
              ) : (
                sm.trainingDays.map((day) => (
                  <EntityRow
                    key={day.id}
                    title={day.name}
                    subtitle={
                      day.id === sm.selectedDayId ? 'Selected' : 'Tap to edit its exercises'
                    }
                    selected={day.id === sm.selectedDayId}
                    onSelect={() => sm.setSelectedDayId(day.id)}
                    onEdit={() => setRenameTarget({ kind: 'day', id: day.id, name: day.name })}
                    onDelete={() =>
                      confirmDelete(`Delete "${day.name}" and its exercises?`, () =>
                        sm.removeDay(day.id)
                      )
                    }
                  />
                ))
              )}
            </>
          )}
        </SectionCard>

        <SectionCard step={3} title="Exercises" count={sm.exercises.length}>
          {!sm.selectedDay ? (
            <EmptyState icon="lock-closed-outline" text="Select a training day first." />
          ) : (
            <>
              <PrimaryButton label="Add Exercise" icon="add" onPress={openAddExercise} />
              {sm.exercises.length === 0 ? (
                <EmptyState icon="barbell-outline" text="No exercises prescribed yet." />
              ) : (
                sm.exercises.map((exercise) => (
                  <EntityRow
                    key={exercise.id}
                    title={exercise.exercise_name}
                    subtitle={`${exercise.sets} sets x ${exercise.reps} reps · ${exercise.rest_seconds}s rest`}
                    onEdit={() => openEditExercise(exercise)}
                    onDelete={() =>
                      confirmDelete(`Delete "${exercise.exercise_name}"?`, () =>
                        sm.removeExercise(exercise.id)
                      )
                    }
                  />
                ))
              )}
            </>
          )}
        </SectionCard>
      </ScrollView>

      <RenameModal
        visible={renameTarget !== null}
        title={renameTarget?.kind === 'day' ? 'Rename Training Day' : 'Rename Split Program'}
        initialValue={renameTarget?.name ?? ''}
        onSubmit={submitRename}
        onClose={() => setRenameTarget(null)}
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
});
