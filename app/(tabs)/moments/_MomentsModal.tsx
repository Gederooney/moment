import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { styles } from './_MomentsModal.styles';

interface MomentsModalProps {
  visible: boolean;
  videoUrl: string;
  isUrlValid: boolean;
  isLoading: boolean;
  modalAnimation: Animated.Value;
  onChangeUrl: (url: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>Ajouter une vidéo</Text>
    </View>
  );
}

function URLInputField({
  videoUrl,
  isUrlValid,
  isLoading,
  onChangeUrl,
  onSubmit,
}: {
  videoUrl: string;
  isUrlValid: boolean;
  isLoading: boolean;
  onChangeUrl: (url: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.inputWrapper}>
      <Ionicons
        name="logo-youtube"
        size={20}
        color={Colors.primary}
        style={styles.inputIcon}
      />
      <TextInput
        style={[
          styles.input,
          isUrlValid && styles.inputValid,
          videoUrl.length > 0 && !isUrlValid && styles.inputInvalid,
        ]}
        value={videoUrl}
        onChangeText={onChangeUrl}
        placeholder="https://www.youtube.com/watch?v=..."
        placeholderTextColor={Colors.text.tertiary}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        editable={!isLoading}
        multiline={false}
      />
    </View>
  );
}

function URLInput({
  videoUrl,
  isUrlValid,
  isLoading,
  onChangeUrl,
  onSubmit,
}: {
  videoUrl: string;
  isUrlValid: boolean;
  isLoading: boolean;
  onChangeUrl: (url: string) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <Text style={styles.label}>URL YouTube</Text>
      <URLInputField
        videoUrl={videoUrl}
        isUrlValid={isUrlValid}
        isLoading={isLoading}
        onChangeUrl={onChangeUrl}
        onSubmit={onSubmit}
      />
      {videoUrl.length > 0 && !isUrlValid && (
        <Text style={styles.errorText}>URL YouTube invalide</Text>
      )}
    </>
  );
}

function ModalButtons({
  isUrlValid,
  isLoading,
  onClose,
  onSubmit,
}: {
  isUrlValid: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        style={[
          styles.cancelButton,
          isLoading && styles.buttonDisabled,
        ]}
        onPress={onClose}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.cancelButtonText}>Annuler</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!isUrlValid || isLoading) && styles.buttonDisabled,
        ]}
        onPress={onSubmit}
        disabled={!isUrlValid || isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Ajout...' : 'Ajouter'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ModalOverlay({
  modalAnimation,
  onClose,
}: {
  modalAnimation: Animated.Value;
  onClose: () => void;
}) {
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          opacity: modalAnimation,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      />
    </Animated.View>
  );
}

function ModalContent({
  videoUrl,
  isUrlValid,
  isLoading,
  onChangeUrl,
  onClose,
  onSubmit,
}: {
  videoUrl: string;
  isUrlValid: boolean;
  isLoading: boolean;
  onChangeUrl: (url: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <View style={styles.handle} />
      <ModalHeader onClose={onClose} />

      <View style={styles.content}>
        <URLInput
          videoUrl={videoUrl}
          isUrlValid={isUrlValid}
          isLoading={isLoading}
          onChangeUrl={onChangeUrl}
          onSubmit={onSubmit}
        />
        <ModalButtons
          isUrlValid={isUrlValid}
          isLoading={isLoading}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </View>
    </>
  );
}

export function MomentsModal({
  visible,
  videoUrl,
  isUrlValid,
  isLoading,
  modalAnimation,
  onChangeUrl,
  onClose,
  onSubmit,
}: MomentsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ModalOverlay
          modalAnimation={modalAnimation}
          onClose={onClose}
        />

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [
                {
                  translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [320, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ModalContent
            videoUrl={videoUrl}
            isUrlValid={isUrlValid}
            isLoading={isLoading}
            onChangeUrl={onChangeUrl}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
