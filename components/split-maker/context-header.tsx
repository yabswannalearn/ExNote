import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

type Props = {
  label: string;
  title: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

// Small header that names the currently active entity (a Split or a Day) and
// exposes rename/delete for it, since selection now happens via chip tabs.
export function ContextHeader({ label, title, onEdit, onDelete }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.actions}>
        {onEdit ? <Action icon="create-outline" color={palette.textMuted} onPress={onEdit} /> : null}
        {onDelete ? (
          <Action icon="trash-outline" color={palette.danger} onPress={onDelete} />
        ) : null}
      </View>
    </View>
  );
}

function Action({
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    padding: 6,
  },
  pressed: {
    opacity: 0.7,
  },
});
