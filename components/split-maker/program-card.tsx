import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProgramOverview } from '@/types/workout';
import { palette } from './palette';

type Props = {
  program: ProgramOverview;
  onEdit: () => void;
  onStartDay: (dayId: number) => void;
};

// Read-only summary of one Split Program: its days, each with its workouts.
export function ProgramCard({ program, onEdit, onStartDay }: Props) {
  const dayCount = program.days.length;
  const exerciseCount = program.days.reduce((total, day) => total + day.exercises.length, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{program.name}</Text>
          <Text style={styles.meta}>
            {dayCount} {dayCount === 1 ? 'day' : 'days'} · {exerciseCount}{' '}
            {exerciseCount === 1 ? 'workout' : 'workouts'}
          </Text>
        </View>
        <Pressable
          onPress={onEdit}
          hitSlop={8}
          style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
          <Ionicons name="create-outline" size={16} color={palette.primary} />
          <Text style={styles.editLabel}>Edit</Text>
        </Pressable>
      </View>

      {dayCount === 0 ? (
        <Text style={styles.empty}>No training days yet.</Text>
      ) : (
        program.days.map((day) => (
          <View key={day.id} style={styles.day}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{day.name}</Text>
              {day.exercises.length > 0 ? (
                <Pressable
                  onPress={() => onStartDay(day.id)}
                  hitSlop={8}
                  style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
                  <Ionicons name="play" size={13} color="#ffffff" />
                  <Text style={styles.startLabel}>Start</Text>
                </Pressable>
              ) : null}
            </View>
            {day.exercises.length === 0 ? (
              <Text style={styles.empty}>No workouts.</Text>
            ) : (
              day.exercises.map((exercise) => (
                <View key={exercise.id} style={styles.exerciseRow}>
                  <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.sets} x {exercise.reps}
                    {exercise.weight !== null ? ` · ${exercise.weight} kg` : ''}
                  </Text>
                </View>
              ))
            )}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.text,
  },
  meta: {
    fontSize: 13,
    color: palette.textMuted,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.primary,
    backgroundColor: palette.primarySoft,
  },
  editLabel: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.7,
  },
  day: {
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayName: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.primary,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: palette.primary,
  },
  startLabel: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  exerciseName: {
    flex: 1,
    fontSize: 14,
    color: palette.text,
  },
  exerciseMeta: {
    fontSize: 13,
    color: palette.textMuted,
  },
  empty: {
    fontSize: 13,
    fontStyle: 'italic',
    color: palette.textSubtle,
  },
});
