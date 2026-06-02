import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  ExerciseInput,
  ExercisePrescription,
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
    'SELECT id, split_program_id, name FROM training_days ORDER BY created_at ASC'
  );
}

export function getAllExercises(db: SQLiteDatabase) {
  return db.getAllAsync<ExercisePrescription>(
    `SELECT id, training_day_id, exercise_name, sets, reps, rest_seconds, weight
     FROM exercise_prescriptions
     ORDER BY created_at ASC`
  );
}

export function getTrainingDays(db: SQLiteDatabase, splitProgramId: number) {
  return db.getAllAsync<TrainingDay>(
    'SELECT id, split_program_id, name FROM training_days WHERE split_program_id = ? ORDER BY created_at ASC',
    [splitProgramId]
  );
}

export async function createTrainingDay(
  db: SQLiteDatabase,
  splitProgramId: number,
  name: string
) {
  const result = await db.runAsync(
    'INSERT INTO training_days (split_program_id, name) VALUES (?, ?)',
    [splitProgramId, name]
  );
  return result.lastInsertRowId;
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
     ORDER BY created_at ASC`,
    [trainingDayId]
  );
}

export function createExercisePrescription(
  db: SQLiteDatabase,
  trainingDayId: number,
  input: ExerciseInput
) {
  return db.runAsync(
    `INSERT INTO exercise_prescriptions
     (training_day_id, exercise_name, sets, reps, rest_seconds, weight)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [trainingDayId, input.exercise_name, input.sets, input.reps, input.rest_seconds, input.weight]
  );
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
