import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/split-maker/empty-state';
import { palette } from '@/components/split-maker/palette';
import { usePersonalRecords } from '@/hooks/use-personal-records';
import { formatSessionDate } from '@/lib/format-date';

export default function PersonalRecordsScreen() {
  const insets = useSafeAreaInsets();
  const { records } = usePersonalRecords();

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.heading}>
        <Text style={styles.title}>Personal Records</Text>
        <Text style={styles.subtitle}>Heaviest set and estimated 1RM per exercise.</Text>
      </View>

      {records.length === 0 ? (
        <EmptyState
          icon="trophy-outline"
          text="No records yet. Log some weighted sets to set a PR."
        />
      ) : (
        records.map((record) => (
          <View key={record.exercise_name} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy" size={18} color={palette.primary} />
              <Text style={styles.exerciseName}>{record.exercise_name}</Text>
            </View>
            <View style={styles.statsRow}>
              <Stat label="Best set" value={`${record.best_weight} kg × ${record.reps_at_best}`} />
              <Stat
                label="Est. 1RM"
                value={
                  record.estimatedOneRepMax !== null
                    ? `${Math.round(record.estimatedOneRepMax)} kg`
                    : '—'
                }
              />
            </View>
            <Text style={styles.achievedAt}>Set on {formatSessionDate(record.achieved_at)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    padding: 16,
    gap: 12,
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
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: palette.surfaceMuted,
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textMuted,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.text,
  },
  achievedAt: {
    fontSize: 12,
    color: palette.textSubtle,
  },
});
