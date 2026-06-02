import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  ExerciseInput,
  ExercisePrescription,
  PersonalRecord,
  SessionHistoryItem,
  SetEntry,
  SetEntryInput,
  SplitProgram,
  TrainingDay,
} from '@/types/workout';

// Data access layer: pure SQLite reads/writes. No UI, no state.

export function getSplitPrograms(db: SQLiteDatabase) {
  return db.getAllAsync<SplitProgram>(
    'SELECT id, name FROM split_programs ORDER BY created_at DESC'
  );
}

export async function createSplitProgram(db: SQLiteDatabase, name: string) {
  const result = await db.runAsync('INSERT INTO split_programs (name) VALUES (?)', [name]);
  return result.lastInsertRowId;
}

export function renameSplitProgram(db: SQLiteDatabase, id: number, name: string) {
  return db.runAsync('UPDATE split_programs SET name = ? WHERE id = ?', [name, id]);
}

export function deleteSplitProgram(db: SQLiteDatabase, id: number) {
  return db.runAsync('DELETE FROM split_programs WHERE id = ?', [id]);
}

export function getAllTrainingDays(db: SQLiteDatabase) {
  return db.getAllAsync<TrainingDay>(
    'SELECT id, split_program_id, name FROM training_days ORDER BY position ASC, created_at ASC'
  );
}

export function getAllExercises(db: SQLiteDatabase) {
  return db.getAllAsync<ExercisePrescription>(
    `SELECT id, training_day_id, exercise_name, sets, reps, rest_seconds, weight
     FROM exercise_prescriptions
     ORDER BY position ASC, created_at ASC`
  );
}

export function getTrainingDays(db: SQLiteDatabase, splitProgramId: number) {
  return db.getAllAsync<TrainingDay>(
    'SELECT id, split_program_id, name FROM training_days WHERE split_program_id = ? ORDER BY position ASC, created_at ASC',
    [splitProgramId]
  );
}

export async function createTrainingDay(
  db: SQLiteDatabase,
  splitProgramId: number,
  name: string
) {
  // Append to the end of the split by taking the next free position.
  const result = await db.runAsync(
    `INSERT INTO training_days (split_program_id, name, position)
     VALUES (?, ?, (SELECT COALESCE(MAX(position) + 1, 0) FROM training_days WHERE split_program_id = ?))`,
    [splitProgramId, name, splitProgramId]
  );
  return result.lastInsertRowId;
}

// Persists a new ordering for the days in one split. Positions are reassigned
// from the given id order in a single transaction so a partial write can't
// leave the list half-reordered.
export async function reorderTrainingDays(
  db: SQLiteDatabase,
  splitProgramId: number,
  orderedIds: number[]
) {
  await db.withTransactionAsync(async () => {
    for (let position = 0; position < orderedIds.length; position++) {
      await db.runAsync(
        'UPDATE training_days SET position = ? WHERE id = ? AND split_program_id = ?',
        [position, orderedIds[position], splitProgramId]
      );
    }
  });
}

export function renameTrainingDay(db: SQLiteDatabase, id: number, name: string) {
  return db.runAsync('UPDATE training_days SET name = ? WHERE id = ?', [name, id]);
}

export function deleteTrainingDay(db: SQLiteDatabase, id: number) {
  return db.runAsync('DELETE FROM training_days WHERE id = ?', [id]);
}

export function getExercisePrescriptions(db: SQLiteDatabase, trainingDayId: number) {
  return db.getAllAsync<ExercisePrescription>(
    `SELECT id, training_day_id, exercise_name, sets, reps, rest_seconds, weight
     FROM exercise_prescriptions
     WHERE training_day_id = ?
     ORDER BY position ASC, created_at ASC`,
    [trainingDayId]
  );
}

export function createExercisePrescription(
  db: SQLiteDatabase,
  trainingDayId: number,
  input: ExerciseInput
) {
  // Append to the end of the day by taking the next free position.
  return db.runAsync(
    `INSERT INTO exercise_prescriptions
     (training_day_id, exercise_name, sets, reps, rest_seconds, weight, position)
     VALUES (?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(position) + 1, 0) FROM exercise_prescriptions WHERE training_day_id = ?))`,
    [
      trainingDayId,
      input.exercise_name,
      input.sets,
      input.reps,
      input.rest_seconds,
      input.weight,
      trainingDayId,
    ]
  );
}

// Persists a new ordering for the exercises in one training day. See
// reorderTrainingDays for the transaction rationale.
export async function reorderExercises(
  db: SQLiteDatabase,
  trainingDayId: number,
  orderedIds: number[]
) {
  await db.withTransactionAsync(async () => {
    for (let position = 0; position < orderedIds.length; position++) {
      await db.runAsync(
        'UPDATE exercise_prescriptions SET position = ? WHERE id = ? AND training_day_id = ?',
        [position, orderedIds[position], trainingDayId]
      );
    }
  });
}

export function updateExercisePrescription(
  db: SQLiteDatabase,
  id: number,
  input: ExerciseInput
) {
  return db.runAsync(
    `UPDATE exercise_prescriptions
     SET exercise_name = ?, sets = ?, reps = ?, rest_seconds = ?, weight = ?
     WHERE id = ?`,
    [input.exercise_name, input.sets, input.reps, input.rest_seconds, input.weight, id]
  );
}

export function deleteExercisePrescription(db: SQLiteDatabase, id: number) {
  return db.runAsync('DELETE FROM exercise_prescriptions WHERE id = ?', [id]);
}

// Session logging

export async function startSession(db: SQLiteDatabase, trainingDayId: number) {
  const result = await db.runAsync('INSERT INTO workout_sessions (training_day_id) VALUES (?)', [
    trainingDayId,
  ]);
  return result.lastInsertRowId;
}

export function finishSession(db: SQLiteDatabase, sessionId: number) {
  return db.runAsync(
    'UPDATE workout_sessions SET finished_at = CURRENT_TIMESTAMP WHERE id = ?',
    [sessionId]
  );
}

export function addSetEntry(db: SQLiteDatabase, sessionId: number, input: SetEntryInput) {
  return db.runAsync(
    `INSERT INTO set_entries
     (session_id, exercise_prescription_id, set_number, reps, weight)
     VALUES (?, ?, ?, ?, ?)`,
    [sessionId, input.exercise_prescription_id, input.set_number, input.reps, input.weight]
  );
}

export function getSetEntries(db: SQLiteDatabase, sessionId: number) {
  return db.getAllAsync<SetEntry>(
    `SELECT id, session_id, exercise_prescription_id, set_number, reps, weight, completed_at
     FROM set_entries
     WHERE session_id = ?
     ORDER BY completed_at ASC`,
    [sessionId]
  );
}

// Most recent set logged against this prescription in a finished session.
// In-progress sessions have finished_at = NULL, so the current one is excluded.
export function getLastEntryForExercise(db: SQLiteDatabase, exercisePrescriptionId: number) {
  return db.getFirstAsync<SetEntry>(
    `SELECT se.id, se.session_id, se.exercise_prescription_id, se.set_number,
            se.reps, se.weight, se.completed_at
     FROM set_entries se
     JOIN workout_sessions ws ON ws.id = se.session_id
     WHERE se.exercise_prescription_id = ? AND ws.finished_at IS NOT NULL
     ORDER BY se.completed_at DESC
     LIMIT 1`,
    [exercisePrescriptionId]
  );
}

// History + personal records. All read only finished sessions.

// Set entry row joined to the exercise name it was performed against — used to
// group a session's sets per exercise in JS.
type SetEntryWithExercise = SetEntry & { exercise_name: string };

export function getSessionHistory(db: SQLiteDatabase, limit?: number) {
  const limitClause = limit !== undefined ? 'LIMIT ?' : '';
  const params = limit !== undefined ? [limit] : [];
  return db.getAllAsync<SessionHistoryItem>(
    `SELECT ws.id,
            ws.started_at,
            ws.finished_at,
            td.name AS training_day_name,
            sp.name AS split_program_name,
            COUNT(se.id) AS set_count
     FROM workout_sessions ws
     JOIN training_days td ON td.id = ws.training_day_id
     JOIN split_programs sp ON sp.id = td.split_program_id
     LEFT JOIN set_entries se ON se.session_id = ws.id
     WHERE ws.finished_at IS NOT NULL
     GROUP BY ws.id
     ORDER BY ws.finished_at DESC
     ${limitClause}`,
    params
  );
}

// Session meta + its set entries with exercise names. Returns null if the
// session doesn't exist or isn't finished. Caller groups sets per exercise.
export async function getSessionDetail(db: SQLiteDatabase, sessionId: number) {
  const session = await db.getFirstAsync<{
    id: number;
    started_at: string;
    finished_at: string | null;
    training_day_name: string;
    split_program_name: string;
  }>(
    `SELECT ws.id, ws.started_at, ws.finished_at,
            td.name AS training_day_name,
            sp.name AS split_program_name
     FROM workout_sessions ws
     JOIN training_days td ON td.id = ws.training_day_id
     JOIN split_programs sp ON sp.id = td.split_program_id
     WHERE ws.id = ? AND ws.finished_at IS NOT NULL`,
    [sessionId]
  );

  if (!session) return null;

  const sets = await db.getAllAsync<SetEntryWithExercise>(
    `SELECT se.id, se.session_id, se.exercise_prescription_id, se.set_number,
            se.reps, se.weight, se.completed_at,
            ep.exercise_name AS exercise_name
     FROM set_entries se
     JOIN exercise_prescriptions ep ON ep.id = se.exercise_prescription_id
     WHERE se.session_id = ?
     ORDER BY se.completed_at ASC`,
    [sessionId]
  );

  return { session, sets };
}

// Heaviest set per exercise name. Relies on SQLite's documented behaviour:
// when MAX() is used, bare columns (reps, started_at) come from the same row
// where the max occurred. Only finished sessions, weighted sets.
export function getPersonalRecords(db: SQLiteDatabase) {
  return db.getAllAsync<PersonalRecord>(
    `SELECT ep.exercise_name AS exercise_name,
            MAX(se.weight) AS best_weight,
            se.reps AS reps_at_best,
            ws.started_at AS achieved_at
     FROM set_entries se
     JOIN exercise_prescriptions ep ON ep.id = se.exercise_prescription_id
     JOIN workout_sessions ws ON ws.id = se.session_id
     WHERE ws.finished_at IS NOT NULL AND se.weight IS NOT NULL
     GROUP BY ep.exercise_name
     ORDER BY ep.exercise_name ASC`
  );
}

// All finished set entries for one exercise name over time (for trends).
export function getExerciseHistory(db: SQLiteDatabase, exerciseName: string) {
  return db.getAllAsync<SetEntry>(
    `SELECT se.id, se.session_id, se.exercise_prescription_id, se.set_number,
            se.reps, se.weight, se.completed_at
     FROM set_entries se
     JOIN exercise_prescriptions ep ON ep.id = se.exercise_prescription_id
     JOIN workout_sessions ws ON ws.id = se.session_id
     WHERE ws.finished_at IS NOT NULL AND ep.exercise_name = ?
     ORDER BY se.completed_at ASC`,
    [exerciseName]
  );
}
