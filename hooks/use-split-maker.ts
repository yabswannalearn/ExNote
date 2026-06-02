import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import * as repo from '@/db/workout-repository';
import type {
  ExerciseInput,
  ExercisePrescription,
  SplitProgram,
  TrainingDay,
} from '@/types/workout';

// Returns `items` rearranged to match `orderedIds`. Ids not present in the list
// are ignored; items missing from `orderedIds` are appended in their original
// order so a stale id list can never drop rows.
function reorderByIds<T extends { id: number }>(items: T[], orderedIds: number[]): T[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = orderedIds
    .map((id) => byId.get(id))
    .filter((item): item is T => item !== undefined);
  const orderedSet = new Set(ordered.map((item) => item.id));
  const leftovers = items.filter((item) => !orderedSet.has(item.id));
  return [...ordered, ...leftovers];
}

// Business logic / state orchestration for the Split Maker screen.
// Holds the selection hierarchy (split -> day -> exercises) and keeps each
// level loaded in sync with the one above it. UI stays free of DB concerns.
export function useSplitMaker(initialSplitId?: number) {
  const db = useSQLiteContext();

  const [splitPrograms, setSplitPrograms] = useState<SplitProgram[]>([]);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [exercises, setExercises] = useState<ExercisePrescription[]>([]);

  const [selectedSplitId, setSelectedSplitId] = useState<number | null>(initialSplitId ?? null);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);

  const selectedSplit = splitPrograms.find((program) => program.id === selectedSplitId) ?? null;
  const selectedDay = trainingDays.find((day) => day.id === selectedDayId) ?? null;

  const loadSplitPrograms = useCallback(async () => {
    const rows = await repo.getSplitPrograms(db);
    setSplitPrograms(rows);

    if (rows.length === 0) {
      setSelectedSplitId(null);
      return;
    }

    setSelectedSplitId((currentId) =>
      currentId && rows.some((program) => program.id === currentId) ? currentId : rows[0].id
    );
  }, [db]);

  const loadTrainingDays = useCallback(async () => {
    if (!selectedSplitId) {
      setTrainingDays([]);
      setSelectedDayId(null);
      return;
    }

    const rows = await repo.getTrainingDays(db, selectedSplitId);
    setTrainingDays(rows);

    if (rows.length === 0) {
      setSelectedDayId(null);
      return;
    }

    setSelectedDayId((currentId) =>
      currentId && rows.some((day) => day.id === currentId) ? currentId : rows[0].id
    );
  }, [db, selectedSplitId]);

  const loadExercises = useCallback(async () => {
    if (!selectedDayId) {
      setExercises([]);
      return;
    }

    setExercises(await repo.getExercisePrescriptions(db, selectedDayId));
  }, [db, selectedDayId]);

  useEffect(() => {
    loadSplitPrograms();
  }, [loadSplitPrograms]);

  useEffect(() => {
    loadTrainingDays();
  }, [loadTrainingDays]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const addSplit = useCallback(
    async (name: string) => {
      const id = await repo.createSplitProgram(db, name);
      await loadSplitPrograms();
      setSelectedSplitId(id);
    },
    [db, loadSplitPrograms]
  );

  const renameSplit = useCallback(
    async (id: number, name: string) => {
      await repo.renameSplitProgram(db, id, name);
      await loadSplitPrograms();
    },
    [db, loadSplitPrograms]
  );

  const removeSplit = useCallback(
    async (id: number) => {
      await repo.deleteSplitProgram(db, id);
      await loadSplitPrograms();
    },
    [db, loadSplitPrograms]
  );

  const addDay = useCallback(
    async (name: string) => {
      if (!selectedSplitId) return;
      const id = await repo.createTrainingDay(db, selectedSplitId, name);
      await loadTrainingDays();
      setSelectedDayId(id);
    },
    [db, loadTrainingDays, selectedSplitId]
  );

  const renameDay = useCallback(
    async (id: number, name: string) => {
      await repo.renameTrainingDay(db, id, name);
      await loadTrainingDays();
    },
    [db, loadTrainingDays]
  );

  const removeDay = useCallback(
    async (id: number) => {
      await repo.deleteTrainingDay(db, id);
      await loadTrainingDays();
    },
    [db, loadTrainingDays]
  );

  const reorderDays = useCallback(
    async (orderedIds: number[]) => {
      if (!selectedSplitId) return;
      // Optimistically apply the new order so dragging feels instant, then
      // persist and reload to re-sync with the DB.
      setTrainingDays((current) => reorderByIds(current, orderedIds));
      await repo.reorderTrainingDays(db, selectedSplitId, orderedIds);
      await loadTrainingDays();
    },
    [db, loadTrainingDays, selectedSplitId]
  );

  const addExercise = useCallback(
    async (input: ExerciseInput) => {
      if (!selectedDayId) return;
      await repo.createExercisePrescription(db, selectedDayId, input);
      await loadExercises();
    },
    [db, loadExercises, selectedDayId]
  );

  const updateExercise = useCallback(
    async (id: number, input: ExerciseInput) => {
      await repo.updateExercisePrescription(db, id, input);
      await loadExercises();
    },
    [db, loadExercises]
  );

  const removeExercise = useCallback(
    async (id: number) => {
      await repo.deleteExercisePrescription(db, id);
      await loadExercises();
    },
    [db, loadExercises]
  );

  const reorderExercises = useCallback(
    async (orderedIds: number[]) => {
      if (!selectedDayId) return;
      setExercises((current) => reorderByIds(current, orderedIds));
      await repo.reorderExercises(db, selectedDayId, orderedIds);
      await loadExercises();
    },
    [db, loadExercises, selectedDayId]
  );

  return {
    splitPrograms,
    trainingDays,
    exercises,
    selectedSplitId,
    selectedDayId,
    selectedSplit,
    selectedDay,
    setSelectedSplitId,
    setSelectedDayId,
    addSplit,
    renameSplit,
    removeSplit,
    addDay,
    renameDay,
    removeDay,
    reorderDays,
    addExercise,
    updateExercise,
    removeExercise,
    reorderExercises,
  };
}
