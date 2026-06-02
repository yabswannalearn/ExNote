# Feature: Drag-to-Reorder (Training Days & Exercise Prescriptions)

## Goal
Let users reorder **Training Days** within a Split Program and **Exercise Prescriptions** within a Training Day by dragging. Today ordering relies on `created_at ASC`, which is fragile and gives no user control.

## Root problem to fix first
Ordering is implicit (`ORDER BY created_at ASC` in `db/workout-repository.ts`). Reordering requires an **explicit `position` column** on both `training_days` and `exercise_prescriptions`.

## Existing patterns to follow (do not deviate)
- `db/workout-repository.ts` — **pure SQLite only**, plain functions taking `db: SQLiteDatabase`.
- DB migration lives in `migrateDb()` in `app/_layout.tsx` — **additive + idempotent**. Use a guarded `ALTER TABLE` like the existing `weight` column backfill (check `PRAGMA table_info(...)` before adding).
- `hooks/use-split-maker.ts` holds the split→day→exercise selection + CRUD; reorder actions belong here.
- The split editor UI is `app/split-maker.tsx` with `components/split-maker/*`.
- Expo SDK 54 — read https://docs.expo.dev/versions/v54.0.0/ before coding (per AGENTS.md).

## 1. Migration (`app/_layout.tsx`)
Add a guarded `position INTEGER` to both tables (default 0), then **backfill** existing rows so current `created_at` order becomes the initial positions:
```sql
ALTER TABLE training_days ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
ALTER TABLE exercise_prescriptions ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
```
Backfill per parent group using a window/rownumber approach (or read rows ordered by `created_at` and `UPDATE ... SET position = ?` in a loop inside a transaction). Guard each `ALTER` behind a `PRAGMA table_info` check so re-running the migration is safe.

## 2. Data layer changes (`db/workout-repository.ts`)
- Change `getAllTrainingDays`, `getTrainingDays`, `getAllExercises`, `getExercisePrescriptions` to `ORDER BY position ASC, created_at ASC`.
- New `createTrainingDay` / `createExercisePrescription`: set `position` to `MAX(position)+1` within the parent (append to end). Do this in one statement or a transaction.
- `reorderTrainingDays(db, splitProgramId, orderedIds: number[])` — persist new positions in a single transaction (`UPDATE training_days SET position = ? WHERE id = ? AND split_program_id = ?`).
- `reorderExercises(db, trainingDayId, orderedIds: number[])` — same pattern.

## 3. Hook (`hooks/use-split-maker.ts`)
- Add `reorderDays(orderedIds)` and `reorderExercises(orderedIds)` that call the repo then reload the affected level.
- Optimistically update local state before the DB write resolves for smooth dragging (re-sync on reload).

## 4. UI
- Use a drag-reorder list. **Check SDK 54 docs / installed deps first** — likely `react-native-draggable-flatlist` (uses `react-native-reanimated` + `react-native-gesture-handler`, both already in the project). Confirm versions are SDK-54 compatible before installing; **get approval before adding any dependency** (per global rules).
- Apply to the Training Day list and the Exercise Prescription list in `app/split-maker.tsx`.
- On drag end, call the corresponding hook reorder action with the new id order.

## Scope boundaries (OUT for this pass)
- No reordering of Split Programs themselves.
- No cross-day moving of an exercise (reorder within its current parent only).
- No manual up/down buttons fallback unless drag proves unavailable.

## Acceptance
- Existing data keeps its current order after migration. User can drag to reorder Training Days and Exercise Prescriptions; the new order persists across app restarts. New items append to the end.
