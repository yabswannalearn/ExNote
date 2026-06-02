# Workout Planning

This context describes how the app names and organizes reusable workout plans.

## Language

**Split Program**:
The root of a reusable workout plan. Everything else — its **Training Days** and **Exercise Prescriptions** — belongs to exactly one Split Program. Examples include Push Pull Legs and Upper Lower.
_Avoid_: Split, program, routine

**Training Day**:
A named day that belongs to a **Split Program** and groups one or more **Exercise Prescriptions**. Examples include Push Day, Pull Day, and Legs Day.
_Avoid_: Workout, workout name, day

**Exercise Prescription**:
An exercise entry that belongs to a **Training Day** and, through it, to the same **Split Program**. It defines the intended exercise name, sets, reps, rest time, and optional weight.
_Avoid_: Exercise, workout item, set

## Example Dialogue

Developer: "Does Push Pull Legs have three Training Days?"

Domain Expert: "Yes. Push Day, Pull Day, and Legs Day are Training Days inside the Split Program."

Developer: "Where do sets, reps, and rest time belong?"

Domain Expert: "They belong to each Exercise Prescription, such as Bench Press for 3 sets of 8-10 reps with 120 seconds rest."
