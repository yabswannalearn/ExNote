import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { palette } from './palette';

type Item = { id: number; label: string };

type Props = {
  items: Item[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
  addLabel?: string;
};

// Horizontal scrollable row of selectable chips with a trailing "+ Add" chip.
// Reused for both Split Programs and Training Days.
export function ChipTabs({ items, selectedId, onSelect, onAdd, addLabel = 'Add' }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {items.map((item) => {
        const active = item.id === selectedId;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
      <Pressable onPress={onAdd} style={[styles.chip, styles.addChip]}>
        <Ionicons name="add" size={16} color={palette.primary} />
        <Text style={[styles.label, styles.addLabel]}>{addLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 8,
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
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  addChip: {
    borderStyle: 'dashed',
    borderColor: palette.primary,
    backgroundColor: palette.surface,
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
