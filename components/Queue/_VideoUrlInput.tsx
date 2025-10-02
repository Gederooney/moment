import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AddVideoModal.styles';

interface VideoUrlInputProps {
  url: string;
  onChangeText: (text: string) => void;
  error: string;
  isLoading: boolean;
  colors: any;
  onSubmitEditing: () => void;
}

export const VideoUrlInput: React.FC<VideoUrlInputProps> = ({
  url,
  onChangeText,
  error,
  isLoading,
  colors,
  onSubmitEditing,
}) => {
  return (
    <>
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
          onChangeText={onChangeText}
          placeholder="https://www.youtube.com/watch?v=..."
          placeholderTextColor={colors.text.tertiary}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onSubmitEditing}
          editable={!isLoading}
          multiline={false}
          accessibilityLabel="URL de la vidéo YouTube"
        />
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : null}
    </>
  );
};
