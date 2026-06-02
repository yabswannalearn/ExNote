import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import * as repo from '@/db/workout-repository';
import type { ExercisePrescription, SetEntry } from '@/types/workout';
import { useRestTimer } from './use-rest-timer';

// Orchestrates one Logged Session: starts it on mount, loads the day's
// prescriptions and "last time" hints, persists Set Entries, and drives the
// rest timer. UI stays free of DB calls.
export function useWorkoutSession(trainingDayId: number) {
  const db = useSQLiteContext();
  const router = useRouter();
  const timer = useRestTimer();

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [prescriptions, setPrescriptions] = useState<ExercisePrescription[]>([]);
  const [entries, setEntries] = useState<SetEntry[]>([]);
  const [lastEntries, setLastEntries] = useState<Map<number, SetEntry>>(new Map());

  // Guard against double-start (e.g. React strict re-mount).
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      const id = await repo.startSession(db, trainingDayId);
      const rx = await repo.getExercisePrescriptions(db, trainingDayId);
      const lasts = await Promise.all(
        rx.map((prescription) => repo.getLastEntryForExercise(db, prescription.id))
      );

      const hints = new Map<number, SetEntry>();
      rx.forEach((prescription, index) => {
        const entry = lasts[index];
        if (entry) hints.set(prescription.id, entry);
      });

      setSessionId(id);
      setPrescriptions(rx);
      setLastEntries(hints);
    })();
  }, [db, trainingDayId]);

  const logSet = useCallback(
    async (prescription: ExercisePrescription, reps: string, weight: number | null) => {
      if (!sessionId) return;

      const setNumber =
        entries.filter((entry) => entry.exercise_prescription_id === prescription.id).length + 1;

      await repo.addSetEntry(db, sessionId, {
        exercise_prescription_id: prescription.id,
        set_number: setNumber,
        reps,
        weight,
      });

      setEntries(await repo.getSetEntries(db, sessionId));
      timer.start(prescription.rest_seconds);
    },
    [db, sessionId, entries, timer]
  );

  const finish = useCallback(async () => {
    if (sessionId) await repo.finishSession(db, sessionId);
    timer.skip();
    router.back();
  }, [db, sessionId, timer, router]);

  return {
    ready: sessionId !== null,
    prescriptions,
    entries,
    lastEntries,
    timer,
    logSet,
    finish,
  };
}
