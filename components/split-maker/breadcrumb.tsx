import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

type Props = {
  split?: string | null;
  day?: string | null;
};

// Shows the current split > day context so the user always knows what the
// exercise list belongs to.
export function Breadcrumb({ split, day }: Props) {
  if (!split) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="layers-outline" size={14} color={palette.primary} />
      <Text style={styles.text}>{split}</Text>
      {day ? (
        <>
          <Ionicons name="chevron-forward" size={13} color={palette.textSubtle} />
          <Text style={styles.text}>{day}</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: palette.primarySoft,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.primary,
  },
});
