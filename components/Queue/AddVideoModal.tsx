/**
 * AddVideoModal Component
 * Bottom sheet modal for adding YouTube video URLs to the queue
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/Colors';
import { useAddVideoModal } from './useAddVideoModal';
import { VideoUrlInput } from './_VideoUrlInput';
import { styles } from './AddVideoModal.styles';

interface AddVideoModalProps {
  visible: boolean;
  onClose: () => void;
  onAddVideo: (url: string) => Promise<void> | void;
  isDark?: boolean;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({
  visible,
  onClose,
  onAddVideo,
  isDark = true,
}) => {
  const colors = getColors(isDark);
  const {
    url,
    isLoading,
    error,
    slideAnim,
    overlayOpacity,
    handleAddVideo,
    handleClose,
    handleOverlayPress,
    handleUrlChange,
  } = useAddVideoModal(visible, onClose, onAddVideo);

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
            <VideoUrlInput
              url={url}
              onChangeText={handleUrlChange}
              error={error}
              isLoading={isLoading}
              colors={colors}
              onSubmitEditing={handleAddVideo}
            />

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
