// Pure helpers for estimating a one-rep-max. Kept out of SQL so the formula
// stays testable and reps (stored as free text like "8-10") can be parsed in JS.

// Reps are stored as TEXT (e.g. "8", "8-10", "AMRAP 12"). Take the first
// integer; return null when there's no parseable number.
export function parseLeadingReps(reps: string): number | null {
  const match = reps.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : null;
}

// Epley formula: weight * (1 + reps / 30). Returns null when reps don't parse.
export function estimateOneRepMax(weight: number, reps: string): number | null {
  const parsedReps = parseLeadingReps(reps);
  if (parsedReps === null) return null;
  return weight * (1 + parsedReps / 30);
}
