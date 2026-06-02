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
};

export type ExerciseInput = {
  exercise_name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
};
