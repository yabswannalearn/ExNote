import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import * as repo from '@/db/workout-repository';
import type { SessionHistoryItem } from '@/types/workout';

// Lists finished Logged Sessions, newest first. Refetches on focus so a
// just-finished session shows up on return.
export function useSessionHistory() {
  const db = useSQLiteContext();
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);

  const load = useCallback(async () => {
    setSessions(await repo.getSessionHistory(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { sessions };
}
