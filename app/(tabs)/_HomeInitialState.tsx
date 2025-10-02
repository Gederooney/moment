import React from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { isValidYouTubeUrl } from '../../utils/youtube';
import { styles } from './_index.styles';
import { RecentMoments } from './_RecentMoments';
import { SpotifyIcon } from '../../components/icons/SpotifyIcon';

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
      {/* Section Titre principal */}
      <View style={styles.ctaContainer}>
        <Text style={[styles.wireframeTitle, { color: colors.text.primary }]}>
          Capturez et revivez vos moments préférés
        </Text>
      </View>

      {/* Input pour ajouter une vidéo/audio */}
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
          placeholder="Collez l'URL de votre vidéo/audio..."
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

      {/* 3 icônes musicales - Wireframe exact */}
      <View style={styles.musicIconsContainer}>
        <View style={[styles.musicIcon, { backgroundColor: '#1DB954' }]}>
          <SpotifyIcon size={28} color="#FFFFFF" />
        </View>
        <View style={[styles.musicIcon, { backgroundColor: '#000000' }]}>
          <Ionicons name="logo-youtube" size={28} color="#FFFFFF" />
        </View>
        <View style={[styles.musicIcon, { backgroundColor: '#FC3C44' }]}>
          <Ionicons name="musical-notes" size={28} color="#FFFFFF" />
        </View>
      </View>

      {/* Section Moments récents - Données réelles */}
      <RecentMoments colors={colors} />
    </ScrollView>
  );
};
