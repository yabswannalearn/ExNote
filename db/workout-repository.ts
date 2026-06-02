import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  ExerciseInput,
  ExercisePrescription,
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
    `SELECT id, training_day_id, exercise_name, sets, reps, rest_seconds
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
     (training_day_id, exercise_name, sets, reps, rest_seconds)
     VALUES (?, ?, ?, ?, ?)`,
    [trainingDayId, input.exercise_name, input.sets, input.reps, input.rest_seconds]
  );
}

export function updateExercisePrescription(
  db: SQLiteDatabase,
  id: number,
  input: ExerciseInput
) {
  return db.runAsync(
    `UPDATE exercise_prescriptions
     SET exercise_name = ?, sets = ?, reps = ?, rest_seconds = ?
     WHERE id = ?`,
    [input.exercise_name, input.sets, input.reps, input.rest_seconds, id]
  );
}

export function deleteExercisePrescription(db: SQLiteDatabase, id: number) {
  return db.runAsync('DELETE FROM exercise_prescriptions WHERE id = ?', [id]);
}
