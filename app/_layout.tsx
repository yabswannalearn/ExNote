import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

async function migrateDb(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS split_programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS training_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      split_program_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (split_program_id) REFERENCES split_programs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exercise_prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      training_day_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      sets INTEGER NOT NULL,
      reps TEXT NOT NULL,
      rest_seconds INTEGER NOT NULL,
      weight REAL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (training_day_id) REFERENCES training_days(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      training_day_id INTEGER NOT NULL,
      started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      finished_at TEXT,
      FOREIGN KEY (training_day_id) REFERENCES training_days(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS set_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      exercise_prescription_id INTEGER NOT NULL,
      set_number INTEGER NOT NULL,
      reps TEXT NOT NULL,
      weight REAL,
      completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_prescription_id) REFERENCES exercise_prescriptions(id) ON DELETE CASCADE
    );
  `);

  // Add the optional weight column to databases created before it existed.
  const exerciseColumns = await db.getAllAsync<{ name: string }>(
    'PRAGMA table_info(exercise_prescriptions)'
  );
  if (!exerciseColumns.some((column) => column.name === 'weight')) {
    await db.execAsync('ALTER TABLE exercise_prescriptions ADD COLUMN weight REAL;');
  }

  // Add explicit ordering columns so users can drag-to-reorder. Backfill once,
  // when the column is first created, so the current created_at order is kept
  // and re-running the migration never clobbers user-set positions.
  await addPositionColumn(db, 'training_days', 'split_program_id');
  await addPositionColumn(db, 'exercise_prescriptions', 'training_day_id');
}

// Adds a guarded `position` column to `table` and seeds it (0-based) by ranking
// existing rows within each `parentColumn` group by created_at, with id as a
// stable tiebreaker. Idempotent: the backfill only runs the first time.
async function addPositionColumn(
  db: SQLiteDatabase,
  table: string,
  parentColumn: string
) {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  if (columns.some((column) => column.name === 'position')) return;

  await db.execAsync(`ALTER TABLE ${table} ADD COLUMN position INTEGER NOT NULL DEFAULT 0;`);
  await db.execAsync(`
    UPDATE ${table} SET position = (
      SELECT COUNT(*) FROM ${table} AS sibling
      WHERE sibling.${parentColumn} = ${table}.${parentColumn}
        AND (
          sibling.created_at < ${table}.created_at
          OR (sibling.created_at = ${table}.created_at AND sibling.id < ${table}.id)
        )
    );
  `);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="workout-planning.db" onInit={migrateDb}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="split-maker" options={{ title: 'Split Program Maker' }} />
            <Stack.Screen name="session" options={{ title: 'Workout' }} />
            <Stack.Screen name="session-detail" options={{ title: 'Session' }} />
            <Stack.Screen name="prs" options={{ title: 'Personal Records' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
