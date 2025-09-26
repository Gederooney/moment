/**
 * AddVideoModal Component
 * Bottom sheet modal for adding YouTube video URLs to the queue
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

interface AddVideoModalProps {
  visible: boolean;
  onClose: () => void;
  onAddVideo: (url: string) => Promise<void> | void;
  isDark?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = 320;

export const AddVideoModal: React.FC<AddVideoModalProps> = ({
  visible,
  onClose,
  onAddVideo,
  isDark = true,
}) => {
  const colors = getColors(isDark);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset state when modal opens
      setUrl('');
      setError('');
      setIsLoading(false);

      // Animate in
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: MODAL_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const validateYouTubeUrl = (inputUrl: string): boolean => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}(&.*)?$/;
    return youtubeRegex.test(inputUrl.trim());
  };

  const handleAddVideo = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError('Veuillez entrer une URL');
      return;
    }

    if (!validateYouTubeUrl(trimmedUrl)) {
      setError('URL YouTube invalide');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onAddVideo(trimmedUrl);
      onClose();
    } catch (err) {
      setError("Erreur lors de l'ajout de la vidéo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleOverlayPress = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={handleClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Overlay */}
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={handleOverlayPress}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: colors.background.secondary,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border.medium }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>Ajouter une vidéo</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isLoading}
              style={styles.closeButton}
              accessibilityLabel="Fermer"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>URL YouTube</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="logo-youtube"
                size={20}
                color={colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text.primary,
                    backgroundColor: colors.background.tertiary,
                    borderColor: error ? colors.error : colors.border.light,
                  },
                ]}
                value={url}
                onChangeText={text => {
                  setUrl(text);
                  if (error) setError('');
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                placeholderTextColor={colors.text.tertiary}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleAddVideo}
                editable={!isLoading}
                multiline={false}
                accessibilityLabel="URL de la vidéo YouTube"
              />
            </View>

            {error ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            ) : null}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  { backgroundColor: '#333333' },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleClose}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.addButton,
                  { backgroundColor: colors.primary },
                  (!url.trim() || isLoading) && styles.buttonDisabled,
                ]}
                onPress={handleAddVideo}
                disabled={!url.trim() || isLoading}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                  {isLoading ? 'Ajout...' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    height: MODAL_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Safe area padding
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: Spacing.sm,
    marginRight: -Spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  label: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  input: {
    ...Typography.body,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 44,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  errorText: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 'auto',
    paddingTop: Spacing.md,
    gap: Spacing.sm2,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
});
