import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export interface QualityOption {
  value: 'auto' | '720p' | '480p' | '360p';
  label: string;
  description: string;
}

export const QUALITY_OPTIONS: QualityOption[] = [
  {
    value: 'auto',
    label: 'Automatique',
    description: 'Meilleure qualité disponible selon la connexion',
  },
  {
    value: '720p',
    label: '720p HD',
    description: 'Haute définition, plus de données utilisées',
  },
  {
    value: '480p',
    label: '480p',
    description: 'Qualité standard, équilibré',
  },
  {
    value: '360p',
    label: '360p',
    description: 'Qualité réduite, moins de données utilisées',
  },
];

interface QualityPickerProps {
  selectedQuality: 'auto' | '720p' | '480p' | '360p';
  onSelect: (quality: 'auto' | '720p' | '480p' | '360p') => void;
  visible: boolean;
  onClose: () => void;
}

export const QualityPicker: React.FC<QualityPickerProps> = ({
  selectedQuality,
  onSelect,
  visible,
  onClose,
}) => {
  const handleSelect = (quality: 'auto' | '720p' | '480p' | '360p') => {
    onSelect(quality);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Qualité vidéo</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>
            Choisissez la qualité par défaut pour les vidéos YouTube
          </Text>

          <View style={styles.optionsContainer}>
            {QUALITY_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[styles.option, selectedQuality === option.value && styles.optionSelected]}
                onPress={() => handleSelect(option.value)}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionText,
                      selectedQuality === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      selectedQuality === option.value && styles.optionDescriptionSelected,
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
                {selectedQuality === option.value && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.light,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  optionDescriptionSelected: {
    color: Colors.primary,
  },
});
