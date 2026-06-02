import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ModalSheet } from './modal-sheet';
import { palette } from './palette';
import { PrimaryButton } from './primary-button';

type Props = {
  visible: boolean;
  title: string;
  initialValue: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
};

// Single-field rename sheet used for both split programs and training days.
export function RenameModal({ visible, title, initialValue, onSubmit, onClose }: Props) {
  const [value, setValue] = useState(initialValue);

  // Re-seed the field whenever a new entity opens the sheet.
  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  function save() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    onClose();
  }

  return (
    <ModalSheet visible={visible} title={title} onClose={onClose} centered>
      <TextInput
        value={value}
        onChangeText={setValue}
        autoFocus
        placeholder="Name"
        placeholderTextColor={palette.textSubtle}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={save}
      />
      <View style={styles.actions}>
        <View style={styles.flex}>
          <PrimaryButton label="Cancel" variant="ghost" onPress={onClose} />
        </View>
        <View style={styles.flex}>
          <PrimaryButton label="Save" icon="checkmark" onPress={save} disabled={!value.trim()} />
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    fontSize: 16,
    color: palette.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
