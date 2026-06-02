import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  NestedReorderableList,
  reorderItems,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';

import { palette } from './palette';
import type { TrainingDay } from '@/types/workout';

type Props = {
  days: TrainingDay[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onReorder: (orderedIds: number[]) => void;
  onAdd: () => void;
  addLabel?: string;
};

// One chip: tap to select, long-press to start a reorder drag.
function DayChip({
  day,
  active,
  onSelect,
}: {
  day: TrainingDay;
  active: boolean;
  onSelect: (id: number) => void;
}) {
  const drag = useReorderableDrag();
  return (
    <Pressable
      onPress={() => onSelect(day.id)}
      onLongPress={drag}
      delayLongPress={200}
      style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.label, active && styles.labelActive]}>{day.name}</Text>
    </Pressable>
  );
}

// Horizontal reorderable row of day chips with a trailing "+ Add" chip.
// The list is scrollable on its own axis; the Add chip sits outside it so it
// never participates in dragging.
export function ReorderableDayChips({
  days,
  selectedId,
  onSelect,
  onReorder,
  onAdd,
  addLabel = 'New Day',
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.listWrap}>
        <NestedReorderableList
          horizontal
          scrollable
          showsHorizontalScrollIndicator={false}
          data={days}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <DayChip day={item} active={item.id === selectedId} onSelect={onSelect} />
          )}
          onReorder={({ from, to }: ReorderableListReorderEvent) => {
            const ordered = reorderItems(days, from, to).map((day) => day.id);
            onReorder(ordered);
          }}
        />
      </View>
      <Pressable onPress={onAdd} style={[styles.chip, styles.addChip]}>
        <Ionicons name="add" size={16} color={palette.primary} />
        <Text style={[styles.label, styles.addLabel]}>{addLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  addChip: {
    borderStyle: 'dashed',
    borderColor: palette.primary,
    backgroundColor: palette.surface,
    marginRight: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.text,
  },
  labelActive: {
    color: '#ffffff',
  },
  addLabel: {
    color: palette.primary,
  },
});
