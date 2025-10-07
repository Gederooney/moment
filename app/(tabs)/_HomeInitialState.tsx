import React from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { isValidYouTubeUrl } from '../../utils/youtube';
import { styles } from './_index.styles';
import { RecentMoments } from './_RecentMoments';

interface HomeInitialStateProps {
  youtubeUrl: string;
  onChangeUrl: (text: string) => void;
  error: string;
  colors: any;
}

export const HomeInitialState: React.FC<HomeInitialStateProps> = ({
  youtubeUrl,
  onChangeUrl,
  error,
  colors,
}) => {
  return (
    <ScrollView
      style={styles.initialState}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Titre simple - YouTube seulement */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Ajouter une vidéo YouTube
        </Text>
      </View>

      {/* Input pour ajouter une vidéo YouTube */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.modernInput,
            {
              backgroundColor: colors.background.tertiary,
              borderColor: isValidYouTubeUrl(youtubeUrl)
                ? Colors.primary
                : error
                  ? Colors.error
                  : colors.border.light,
              color: colors.text.primary,
            },
            isValidYouTubeUrl(youtubeUrl) && styles.inputValid,
          ]}
          placeholder="Collez l'URL YouTube..."
          placeholderTextColor={colors.text.tertiary}
          value={youtubeUrl}
          onChangeText={onChangeUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="done"
          multiline={false}
          textAlignVertical="center"
          editable={true}
          autoFocus={false}
        />

        {isValidYouTubeUrl(youtubeUrl) && (
          <View style={styles.validIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
          </View>
        )}
      </View>

      {error && <Text style={[styles.errorText, { color: Colors.error }]}>{error}</Text>}

      {/* Moments récents - Toujours visibles */}
      <RecentMoments colors={colors} />
    </ScrollView>
  );
};
