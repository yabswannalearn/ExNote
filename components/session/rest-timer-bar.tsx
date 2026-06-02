import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/components/split-maker/palette';

type Props = {
  secondsLeft: number;
  onAddTime: () => void;
  onSkip: () => void;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// Sticky bar shown while resting between sets.
export function RestTimerBar({ secondsLeft, onAddTime, onSkip }: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <Ionicons name="timer-outline" size={20} color="#ffffff" />
        <Text style={styles.label}>Rest</Text>
        <Text style={styles.time}>{formatTime(secondsLeft)}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onAddTime} style={styles.action} hitSlop={6}>
          <Text style={styles.actionText}>+15s</Text>
        </Pressable>
        <Pressable onPress={onSkip} style={[styles.action, styles.skip]} hitSlop={6}>
          <Text style={styles.actionText}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.primary,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#dbeafe',
    fontSize: 15,
    fontWeight: '600',
  },
  time: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  action: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  skip: {
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
