import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { palette } from './palette';
import { PrimaryButton } from './primary-button';

type Props = {
  placeholder: string;
  onAdd: (value: string) => void;
};

// Self-contained "type a name + Add" row. Owns its own draft text so the
// parent screen doesn't need a state field per form.
export function InlineAddRow({ placeholder, onAdd }: Props) {
  const [value, setValue] = useState('');

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  }

  return (
    <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={palette.textSubtle}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <PrimaryButton label="Add" icon="add" onPress={submit} disabled={!value.trim()} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    fontSize: 15,
    color: palette.text,
  },
});
