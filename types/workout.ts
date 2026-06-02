export type SplitProgram = {
  id: number;
  name: string;
};

export type TrainingDay = {
  id: number;
  split_program_id: number;
  name: string;
};

export type ExercisePrescription = {
  id: number;
  training_day_id: number;
  exercise_name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  weight: number | null;
};

export type TrainingDayWithExercises = TrainingDay & {
  exercises: ExercisePrescription[];
};

export type ProgramOverview = SplitProgram & {
  days: TrainingDayWithExercises[];
};

export type ExerciseInput = {
  exercise_name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  weight: number | null;
};

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

export type SessionHistoryItem = {
  id: number;
  started_at: string;
  finished_at: string;
  training_day_name: string;
  split_program_name: string;
  set_count: number;
};

export type SessionExerciseGroup = {
  exercise_name: string;
  sets: SetEntry[];
};

export type SessionDetail = {
  id: number;
  started_at: string;
  finished_at: string | null;
  training_day_name: string;
  split_program_name: string;
  groups: SessionExerciseGroup[];
};

export type PersonalRecord = {
  exercise_name: string;
  best_weight: number;
  reps_at_best: string;
  achieved_at: string;
};
