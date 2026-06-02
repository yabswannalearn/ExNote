# Feature: Session History + Personal Records (PRs)

## Goal
Logging now exists (`workout_sessions` + `set_entries`). This feature surfaces that data:
1. **Session History** — browse past Logged Sessions (per Training Day and overall), seeing what was actually performed and when.
2. **Personal Records (PRs)** — detect and display best performances per exercise.

## Prerequisite (already built)
Tables in `app/_layout.tsx` migration:
```sql
workout_sessions (id, training_day_id, started_at, finished_at)
set_entries (id, session_id, exercise_prescription_id, set_number, reps, weight, completed_at)
```
Repo already has: `startSession`, `finishSession`, `addSetEntry`, `getSetEntries`, `getLastEntryForExercise`.

Existing types (`types/workout.ts`): `WorkoutSession`, `SetEntry`, `SetEntryInput`.

## Existing patterns to follow (do not deviate)
- `db/workout-repository.ts` — **pure SQLite only**, plain functions taking `db: SQLiteDatabase`. No N+1: load each level once and nest in JS (see `hooks/use-program-overview.ts`).
- `hooks/use-*.ts` — state/logic; refetch on focus via `useFocusEffect`.
- Screens render only; non-tab screens registered as `<Stack.Screen>` in `app/_layout.tsx`.
- Styling via `components/split-maker/palette.ts`; reuse `EmptyState`, `PrimaryButton`.
- Expo SDK 54 — read https://docs.expo.dev/versions/v54.0.0/ before coding (per AGENTS.md).

## Domain language (extend CONTEXT.md)
- **Personal Record (PR)**: the best performance recorded for an exercise name across all finished **Logged Sessions** — heaviest **Set Entry** weight, and the estimated 1-rep-max derived from it.
  - _Avoid_: max, best, record.

PRs are keyed by **exercise name** (text), not prescription id — the same exercise across different Split Programs / Training Days should share one PR history.

## 1. Data layer additions (`db/workout-repository.ts`)
Only count **finished** sessions (`finished_at IS NOT NULL`).

- `getSessionHistory(db, limit?)` — finished sessions newest first, joined to Training Day + Split Program names. Shape:
  `{ id, started_at, finished_at, training_day_name, split_program_name, set_count }`.
- `getSessionDetail(db, sessionId)` — the session plus its `set_entries` joined to `exercise_name` (from `exercise_prescriptions`), grouped per exercise in JS.
- `getPersonalRecords(db)` — per `exercise_name`: heaviest `weight`, the reps at that weight, and `started_at` of that session. One query grouped by exercise name.
- `getExerciseHistory(db, exerciseName)` — all finished `set_entries` for that name over time (for a per-exercise trend / sparkline).

Estimated 1RM: use Epley `weight * (1 + reps/30)` in a **pure helper** (e.g. `lib/one-rep-max.ts`), not in SQL. `reps` is stored as TEXT (e.g. "8-10"); parse the first integer, ignore entries that don't parse.

## 2. Hooks
- `hooks/use-session-history.ts` — loads `getSessionHistory`, refetch on focus.
- `hooks/use-session-detail.ts` — input `sessionId`, loads `getSessionDetail`.
- `hooks/use-personal-records.ts` — loads `getPersonalRecords`, computes e1RM via the helper.

## 3. UI
- **History list**: new tab or screen `app/history.tsx` — list of past sessions (date, day name, set count). Empty state when none. Tap a row →
- **Session detail**: `app/session-detail.tsx` opened via `/session-detail?sessionId=…` — per-exercise breakdown of logged sets (set #, reps, weight).
- **PRs**: `app/prs.tsx` (or a section on history) — one row per exercise: best weight × reps, e1RM, date. Optionally a small trend per exercise from `getExerciseHistory`.
- Register new non-tab screens in `app/_layout.tsx`. If adding a tab, update `app/(tabs)/_layout.tsx`.

## Scope boundaries (OUT for this pass)
- No editing/deleting past sessions.
- No charts library — keep to simple text rows; a lightweight sparkline is optional, not required.
- No bodyweight/measurement PRs — exercise PRs only.

## Acceptance
- After finishing real sessions, the History screen lists them newest-first; tapping one shows the logged sets per exercise; the PRs screen shows the heaviest set and estimated 1RM per exercise name. Unfinished sessions are excluded.
