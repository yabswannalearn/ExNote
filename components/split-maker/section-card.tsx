import { StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

type Props = {
  step: number;
  title: string;
  count?: number;
  children: React.ReactNode;
};

export function SectionCard({ step, title, count, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>{step}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        {count !== undefined ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: palette.text,
  },
  countBadge: {
    minWidth: 26,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  body: {
    gap: 12,
  },
});
