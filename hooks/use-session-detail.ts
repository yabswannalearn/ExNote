import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import * as repo from '@/db/workout-repository';
import type { SessionDetail, SessionExerciseGroup, SetEntry } from '@/types/workout';

// Loads one finished session and groups its set entries per exercise name.
export function useSessionDetail(sessionId: number) {
  const db = useSQLiteContext();
  const [detail, setDetail] = useState<SessionDetail | null>(null);

  const load = useCallback(async () => {
    const result = await repo.getSessionDetail(db, sessionId);
    if (!result) {
      setDetail(null);
      return;
    }

    setDetail({
      ...result.session,
      groups: groupByExercise(result.sets),
    });
  }, [db, sessionId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { detail };
}

function groupByExercise(sets: (SetEntry & { exercise_name: string })[]): SessionExerciseGroup[] {
  const groups: SessionExerciseGroup[] = [];
  const indexByName = new Map<string, number>();

  for (const set of sets) {
    const existing = indexByName.get(set.exercise_name);
    if (existing === undefined) {
      indexByName.set(set.exercise_name, groups.length);
      groups.push({ exercise_name: set.exercise_name, sets: [set] });
    } else {
      groups[existing].sets.push(set);
    }
  }

  return groups;
}
