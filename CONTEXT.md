# Workout Planning

This context describes how the app names and organizes reusable workout plans.

## Language

**Split Program**:
A reusable workout plan made of one or more **Training Days**. Examples include Push Pull Legs and Upper Lower.
_Avoid_: Split, program, routine

**Training Day**:
A named day inside a **Split Program** that groups one or more **Exercise Prescriptions**. Examples include Push Day, Pull Day, and Legs Day.
_Avoid_: Workout, workout name, day

**Exercise Prescription**:
An exercise entry inside a **Training Day** that defines the intended exercise name, sets, reps, and rest time.
_Avoid_: Exercise, workout item, set

## Example Dialogue

Developer: "Does Push Pull Legs have three Training Days?"

Domain Expert: "Yes. Push Day, Pull Day, and Legs Day are Training Days inside the Split Program."

Developer: "Where do sets, reps, and rest time belong?"

Domain Expert: "They belong to each Exercise Prescription, such as Bench Press for 3 sets of 8-10 reps with 120 seconds rest."
