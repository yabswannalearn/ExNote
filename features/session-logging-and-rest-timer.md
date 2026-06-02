# Feature: Workout Session Logging + Rest Timer

## Goal
The app is currently a **planner only** (Split Program → Training Day → Exercise Prescription). It stores intended sets/reps/rest/weight but nothing actual. Despite the name "workout-logger," there is no logging. This feature adds:

1. **Session logging** — perform a Training Day and record real sets/reps/weight.
2. **Rest timer** — a between-set countdown seeded from the prescription's existing `rest_seconds`.

## Domain language (extends CONTEXT.md — planning-only today)
Add these two terms. Keep them distinct from the prescription terms.

- **Logged Session**: one actual performance of a **Training Day** on a date. Belongs to exactly one Training Day.
  - _Avoid_: workout, log, session record.
- **Set Entry**: one actual set inside a **Logged Session** — actual reps, actual weight, and a done flag. Linked to the **Exercise Prescription** it was performed against.
  - _Avoid_: set, rep, entry.

CONTEXT.md must be updated with these terms when this is built.

## Existing patterns to follow (do not deviate)
- `db/workout-repository.ts` — **pure SQLite only**. No UI, no React state. Exported plain functions taking `db: SQLiteDatabase`.
- `hooks/use-*.ts` — business logic / state orchestration. UI stays free of DB concerns.
- `app/*.tsx` screens — render + interaction only. New non-tab screens are registered as `<Stack.Screen>` in `app/_layout.tsx`.
- DB migration lives in `migrateDb()` in `app/_layout.tsx`. Migrations are **additive and idempotent** (`CREATE TABLE IF NOT EXISTS`, guarded `ALTER TABLE`). Foreign keys are ON; use `ON DELETE CASCADE`.
- Styling via `components/split-maker/palette.ts`. Reuse `PrimaryButton`, `EmptyState`, etc.
- Reads refetch on focus via `useFocusEffect` (see `hooks/use-program-overview.ts`).
- Expo SDK 54 — **read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing code** (per AGENTS.md).

## 1. Schema (additive migration in `app/_layout.tsx`)
```sql
CREATE TABLE IF NOT EXISTS workout_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  training_day_id INTEGER NOT NULL,
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TEXT,
  FOREIGN KEY (training_day_id) REFERENCES training_days(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS set_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  exercise_prescription_id INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  reps TEXT NOT NULL,
  weight REAL,
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_prescription_id) REFERENCES exercise_prescriptions(id) ON DELETE CASCADE
);
```
Note: if a prescription is deleted mid-session its set entries cascade away; acceptable for now.

## 2. Types (`types/workout.ts`)
```ts
export type WorkoutSession = {
  id: number;
  training_day_id: number;
  started_at: string;
  finished_at: string | null;
};

export type SetEntry = {
  id: number;
  session_id: number;
  exercise_prescription_id: number;
  set_number: number;
  reps: string;
  weight: number | null;
  completed_at: string;
};

export type SetEntryInput = {
  exercise_prescription_id: number;
  set_number: number;
  reps: string;
  weight: number | null;
};
```

## 3. Data layer (`db/workout-repository.ts`)
- `startSession(db, trainingDayId): Promise<number>` — insert, return new id.
- `finishSession(db, sessionId)` — set `finished_at = CURRENT_TIMESTAMP`.
- `addSetEntry(db, sessionId, input: SetEntryInput)`
- `getSetEntries(db, sessionId): Promise<SetEntry[]>`
- `getLastEntryForExercise(db, exercisePrescriptionId): Promise<SetEntry | null>` — most recent entry across finished sessions, for the "last time: 80kg × 8" hint. Excludes the current session.

## 4. Session logic hook (`hooks/use-workout-session.ts`)
- Input: `trainingDayId`.
- On mount: `startSession`, load the day's `ExercisePrescription[]` (reuse `repo.getExercisePrescriptions`).
- State: current session id, logged `SetEntry[]`, per-exercise "last time" hints.
- Actions: `logSet(prescriptionId, reps, weight)` → next `set_number` for that exercise, persists, triggers rest timer. `finish()` → `finishSession`, navigate back.
- Keep UI free of DB calls.

## 5. Rest timer hook (`hooks/use-rest-timer.ts`)
- Plain JS countdown (`setInterval`), seeded from the just-logged exercise's `rest_seconds`. **No new native deps** (KISS).
- API: `{ secondsLeft, isRunning, start(seconds), skip(), addTime(15) }`.
- Auto-starts when a set is marked done. Clean up interval on unmount.

## 6. UI
- New screen `app/session.tsx` opened via `/session?dayId=…`.
  - Lists the day's exercises with their prescription (target sets × reps, rest).
  - Each set: inputs for actual reps + weight, a "done" check that logs it and starts the rest timer.
  - Shows "last time" hint per exercise when available.
  - Sticky rest-timer bar (countdown + skip / +15s) when running.
  - "Finish workout" button → `finish()`.
- Register `<Stack.Screen name="session" options={{ title: 'Workout' }} />` in `app/_layout.tsx`.
- Entry point: add a **Start** action per Training Day on `components/split-maker/program-card.tsx` → `router.push('/session?dayId=' + day.id)`. (Currently the card only has Edit.)

## Scope boundaries (explicitly OUT for this pass)
- No editing/deleting of past Logged Sessions — only log + finish.
- No history browse screen, no charts/PR tracking (that is a separate later feature, depends on this).
- Rest timer is **visual only** — no background notification or sound (would require `expo-notifications` setup; can be added later).
- No reorder/duplicate features.

## Acceptance
- Start a session from a Training Day, log actual sets per exercise, see rest countdown after each set, finish the session, and have it persisted in SQLite. Existing planning data and DB remain intact after migration.
