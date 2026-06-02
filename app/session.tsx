import { useLocalSearchParams } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/split-maker/empty-state';
import { palette } from '@/components/split-maker/palette';
import { PrimaryButton } from '@/components/split-maker/primary-button';
import { ExerciseLogger } from '@/components/session/exercise-logger';
import { RestTimerBar } from '@/components/session/rest-timer-bar';
import { useWorkoutSession } from '@/hooks/use-workout-session';

export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ dayId?: string }>();
  const dayId = Number(params.dayId);

  const { ready, prescriptions, entries, lastEntries, timer, logSet, finish } =
    useWorkoutSession(dayId);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        {prescriptions.length === 0 ? (
          <EmptyState
            icon="barbell-outline"
            text={ready ? 'This day has no exercises to log.' : 'Starting your session...'}
          />
        ) : (
          prescriptions.map((prescription) => (
            <ExerciseLogger
              key={prescription.id}
              prescription={prescription}
              loggedSets={entries.filter(
                (entry) => entry.exercise_prescription_id === prescription.id
              )}
              lastEntry={lastEntries.get(prescription.id) ?? null}
              onLog={(reps, weight) => logSet(prescription, reps, weight)}
            />
          ))
        )}
      </ScrollView>

      {timer.isRunning ? (
        <RestTimerBar
          secondsLeft={timer.secondsLeft}
          onAddTime={() => timer.addTime(15)}
          onSkip={timer.skip}
        />
      ) : null}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.footerHint}>
          {entries.length} {entries.length === 1 ? 'set' : 'sets'} logged
        </Text>
        <PrimaryButton label="Finish Workout" icon="flag" onPress={finish} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    padding: 16,
    gap: 14,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.surface,
  },
  footerHint: {
    fontSize: 13,
    color: palette.textMuted,
    textAlign: 'center',
  },
});
