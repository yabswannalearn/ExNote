import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/split-maker/empty-state';
import { palette } from '@/components/split-maker/palette';
import { useSessionHistory } from '@/hooks/use-session-history';
import { formatSessionDate, formatSessionTime } from '@/lib/format-date';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessions } = useSessionHistory();

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}>
      <View style={styles.heading}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Your finished workouts, newest first.</Text>
      </View>

      <Pressable
        onPress={() => router.push('/prs')}
        style={({ pressed }) => [styles.prsButton, pressed && styles.pressed]}>
        <Ionicons name="trophy-outline" size={18} color={palette.primary} />
        <Text style={styles.prsLabel}>Personal Records</Text>
        <Ionicons name="chevron-forward" size={18} color={palette.primary} />
      </Pressable>

      {sessions.length === 0 ? (
        <EmptyState icon="time-outline" text="No finished workouts yet. Start a session to log one." />
      ) : (
        sessions.map((session) => (
          <Pressable
            key={session.id}
            onPress={() => router.push(`/session-detail?sessionId=${session.id}`)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{session.training_day_name}</Text>
              <Text style={styles.rowMeta}>
                {session.split_program_name} · {formatSessionDate(session.finished_at)} ·{' '}
                {formatSessionTime(session.finished_at)}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.setCount}>
                {session.set_count} {session.set_count === 1 ? 'set' : 'sets'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={palette.textSubtle} />
            </View>
          </Pressable>
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
  container: {
    padding: 16,
    gap: 12,
  },
  heading: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
  },
  subtitle: {
    fontSize: 15,
    color: palette.textMuted,
  },
  prsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.primary,
    backgroundColor: palette.primarySoft,
  },
  prsLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: palette.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  rowMeta: {
    fontSize: 13,
    color: palette.textMuted,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  setCount: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textMuted,
  },
  pressed: {
    opacity: 0.7,
  },
});
