import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={destructive ? 'warning' : 'help-circle'}
                size={32}
                color={destructive ? Colors.error : Colors.primary}
              />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  destructive && styles.destructiveButton,
                ]}
                onPress={onConfirm}
              >
                <Text
                  style={[
                    styles.confirmButtonText,
                    destructive && styles.destructiveButtonText,
                  ]}
                >
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 24,
    maxWidth: 340,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  destructiveButton: {
    backgroundColor: Colors.error,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.white,
  },
  destructiveButtonText: {
    color: Colors.text.white,
  },
});