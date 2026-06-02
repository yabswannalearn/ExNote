import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/split-maker/empty-state';
import { palette } from '@/components/split-maker/palette';
import { useSessionDetail } from '@/hooks/use-session-detail';
import { formatSessionDate, formatSessionTime } from '@/lib/format-date';

export default function SessionDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId = Number(params.sessionId);

  const { detail } = useSessionDetail(sessionId);

  if (!detail) {
    return (
      <View style={[styles.flex, styles.centered]}>
        <EmptyState icon="document-outline" text="This session could not be found." />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.heading}>
        <Text style={styles.title}>{detail.training_day_name}</Text>
        <Text style={styles.subtitle}>
          {detail.split_program_name}
          {detail.finished_at
            ? ` · ${formatSessionDate(detail.finished_at)} · ${formatSessionTime(detail.finished_at)}`
            : ''}
        </Text>
      </View>

      {detail.groups.length === 0 ? (
        <EmptyState icon="barbell-outline" text="No sets were logged in this session." />
      ) : (
        detail.groups.map((group) => (
          <View key={group.exercise_name} style={styles.card}>
            <Text style={styles.exerciseName}>{group.exercise_name}</Text>
            {group.sets.map((set) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setNumber}>Set {set.set_number}</Text>
                <Text style={styles.setValue}>
                  {set.reps} reps{set.weight !== null ? ` × ${set.weight} kg` : ''}
                </Text>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: palette.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    padding: 16,
    gap: 14,
  },
  heading: {
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: palette.text,
  },
  subtitle: {
    fontSize: 14,
    color: palette.textMuted,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 8,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.text,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textMuted,
  },
  setValue: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
  },
});
