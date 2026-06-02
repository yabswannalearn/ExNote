import { View, StyleSheet } from 'react-native';
import {
  NestedReorderableList,
  reorderItems,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';

import { EntityRow } from './entity-row';
import type { ExercisePrescription } from '@/types/workout';

type Props = {
  exercises: ExercisePrescription[];
  onReorder: (orderedIds: number[]) => void;
  onEdit: (exercise: ExercisePrescription) => void;
  onDelete: (exercise: ExercisePrescription) => void;
};

function buildSubtitle(exercise: ExercisePrescription) {
  return (
    `${exercise.sets} sets x ${exercise.reps} reps · ${exercise.rest_seconds}s rest` +
    (exercise.weight !== null ? ` · ${exercise.weight} kg` : '')
  );
}

// Single row; calls useReorderableDrag so its drag handle can start a drag.
function ExerciseRow({ exercise, onEdit, onDelete }: Omit<Props, 'exercises' | 'onReorder'> & {
  exercise: ExercisePrescription;
}) {
  const drag = useReorderableDrag();
  return (
    <EntityRow
      title={exercise.exercise_name}
      subtitle={buildSubtitle(exercise)}
      onEdit={() => onEdit(exercise)}
      onDelete={() => onDelete(exercise)}
      onDragStart={drag}
    />
  );
}

// Vertical, non-scrollable reorderable list. Non-scrollable because it lives
// inside the screen's ScrollViewContainer, which owns the scrolling.
export function ReorderableExerciseList({ exercises, onReorder, onEdit, onDelete }: Props) {
  return (
    <NestedReorderableList
      data={exercises}
      scrollable={false}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <ExerciseRow exercise={item} onEdit={onEdit} onDelete={onDelete} />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      onReorder={({ from, to }: ReorderableListReorderEvent) => {
        const ordered = reorderItems(exercises, from, to).map((exercise) => exercise.id);
        onReorder(ordered);
      }}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 10,
  },
});
