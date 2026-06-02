import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/split-maker/empty-state';
import { palette } from '@/components/split-maker/palette';
import { PrimaryButton } from '@/components/split-maker/primary-button';
import { ProgramCard } from '@/components/split-maker/program-card';
import { useProgramOverview } from '@/hooks/use-program-overview';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { programs } = useProgramOverview();

  function openEditor(splitId?: number) {
    router.push(splitId ? `/split-maker?splitId=${splitId}` : '/split-maker');
  }

  function startSession(dayId: number) {
    router.push(`/session?dayId=${dayId}`);
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}>
      <View style={styles.hero}>
        <Image
          source={require('@/assets/images/pangit.png')}
          style={styles.logo}
          contentFit="cover"
        />
        <View style={styles.heroText}>
          <Text style={styles.title}>My Programs</Text>
          <Text style={styles.subtitle}>Your split programs, days, and workouts.</Text>
        </View>
      </View>

      {programs.length === 0 ? (
        <>
          <EmptyState icon="albums-outline" text="You haven't made a split program yet." />
          <PrimaryButton label="Create a Program" icon="add" onPress={() => openEditor()} />
        </>
      ) : (
        <>
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onEdit={() => openEditor(program.id)}
              onStartDay={startSession}
            />
          ))}
          <PrimaryButton label="New Program" icon="add" onPress={() => openEditor()} />
        </>
      )}
    </ScrollView>
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
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: palette.surface,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
  },
  subtitle: {
    fontSize: 15,
    color: palette.textMuted,
  },
});
