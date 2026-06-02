import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import * as repo from '@/db/workout-repository';
import { estimateOneRepMax } from '@/lib/one-rep-max';
import type { PersonalRecord } from '@/types/workout';

export type PersonalRecordView = PersonalRecord & {
  estimatedOneRepMax: number | null;
};

// Loads the heaviest set per exercise and derives the estimated 1RM in JS.
export function usePersonalRecords() {
  const db = useSQLiteContext();
  const [records, setRecords] = useState<PersonalRecordView[]>([]);

  const load = useCallback(async () => {
    const rows = await repo.getPersonalRecords(db);
    setRecords(
      rows.map((record) => ({
        ...record,
        estimatedOneRepMax: estimateOneRepMax(record.best_weight, record.reps_at_best),
      }))
    );
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { records };
}
