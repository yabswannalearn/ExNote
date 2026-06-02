import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

type Props = {
  title: string;
  subtitle: string;
  selected?: boolean;
  // When provided, the whole row becomes tappable to select this entity.
  onSelect?: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function EntityRow({ title, subtitle, selected = false, onSelect, onEdit, onDelete }: Props) {
  return (
    <Pressable
      onPress={onSelect}
      disabled={!onSelect}
      style={({ pressed }) => [
        styles.row,
        selected && styles.selectedRow,
        pressed && onSelect && styles.pressed,
      ]}>
      {onSelect ? (
        <Ionicons
          name={selected ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={selected ? palette.primary : palette.textSubtle}
        />
      ) : null}

      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.actions}>
        <IconAction icon="create-outline" color={palette.textMuted} onPress={onEdit} />
        <IconAction icon="trash-outline" color={palette.danger} onPress={onDelete} />
      </View>
    </Pressable>
  );
}

function IconAction({
  icon,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={19} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
  },
  selectedRow: {
    borderColor: palette.primary,
    backgroundColor: palette.primarySoft,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    fontSize: 13,
    color: palette.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    padding: 6,
  },
});
