import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import * as repo from '@/db/workout-repository';
import type { ProgramOverview } from '@/types/workout';

// Read-only assembly of the full Split Program -> Training Day -> Exercise tree
// for the browse/list view. Loads each level once (no N+1) and nests in JS.
// Refetches whenever the screen regains focus, so edits show up on return.
export function useProgramOverview() {
  const db = useSQLiteContext();
  const [programs, setPrograms] = useState<ProgramOverview[]>([]);

  const load = useCallback(async () => {
    const [splits, days, exercises] = await Promise.all([
      repo.getSplitPrograms(db),
      repo.getAllTrainingDays(db),
      repo.getAllExercises(db),
    ]);

    const exercisesByDay = groupBy(exercises, (exercise) => exercise.training_day_id);
    const daysBySplit = groupBy(days, (day) => day.split_program_id);

    setPrograms(
      splits.map((split) => ({
        ...split,
        days: (daysBySplit.get(split.id) ?? []).map((day) => ({
          ...day,
          exercises: exercisesByDay.get(day.id) ?? [],
        })),
      }))
    );
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { programs };
}

function groupBy<T>(items: T[], keyOf: (item: T) => number): Map<number, T[]> {
  const map = new Map<number, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }
  return map;
}
