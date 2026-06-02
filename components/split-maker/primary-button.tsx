import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { palette } from './palette';

type Variant = 'primary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, variant = 'primary', icon, disabled }: Props) {
  const tone = TONES[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: tone.bg, borderColor: tone.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {icon ? <Ionicons name={icon} size={15} color={tone.fg} /> : null}
      <Text style={[styles.label, { color: tone.fg }]}>{label}</Text>
    </Pressable>
  );
}

const TONES: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: palette.primary, fg: '#ffffff', border: palette.primary },
  ghost: { bg: palette.surface, fg: palette.text, border: palette.borderStrong },
  danger: { bg: palette.dangerSoft, fg: palette.danger, border: '#fecaca' },
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
});
