import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

export function EmptyState({ icon, text }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={22} color={palette.textSubtle} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
  },
  text: {
    color: palette.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
