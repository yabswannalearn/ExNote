import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { palette } from './palette';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  // Centered cards float in the middle of the screen (clear of the keyboard);
  // otherwise the content anchors to the bottom as a sheet.
  centered?: boolean;
};

// Shared modal shell: dim backdrop + rounded card. Tapping the backdrop
// dismisses. Lifts above the keyboard so inputs stay visible.
export function ModalSheet({ visible, title, onClose, children, centered = false }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={centered ? 'fade' : 'slide'}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable
          style={[styles.backdrop, centered ? styles.backdropCentered : styles.backdropBottom]}
          onPress={onClose}>
          <Pressable
            style={[styles.card, centered ? styles.cardCentered : styles.cardSheet]}
            onPress={() => {}}>
            {!centered ? <View style={styles.handle} /> : null}
            <Text style={styles.title}>{title}</Text>
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
  },
  backdropBottom: {
    justifyContent: 'flex-end',
  },
  backdropCentered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: palette.surface,
    padding: 20,
    gap: 14,
  },
  cardSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  cardCentered: {
    width: '100%',
    borderRadius: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.text,
  },
});
