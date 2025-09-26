import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, getColors } from '../../constants/Colors';
import { useTopBarContext } from '../../contexts/TopBarContext';
import { extractVideoId, isValidYouTubeUrl } from '../../utils/youtube';
import { fetchYouTubeMetadataWithFallback } from '../../services/youtubeMetadata';
import AntDesign from '@expo/vector-icons/AntDesign';

// Hook personnalisé pour le debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function HomeScreen() {
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const colors = getColors(isDark);

  // Contexte TopBar pour le titre
  const { setTitle } = useTopBarContext();

  // Debounce de l'URL pour éviter les appels multiples
  const debouncedUrl = useDebounce(youtubeUrl, 500);

  // États de l'interface
  const interfaceState = isLoadingVideo ? 'loading' : 'initial';

  // Mise à jour du titre dans la TopBar
  useEffect(() => {
    setTitle('Moments');
  }, [setTitle]);

  const handleNavigateToPlayer = useCallback(
    async (url: string) => {
      setIsLoadingVideo(true);
      setError('');

      try {
        const extractedVideoId = extractVideoId(url);
        if (extractedVideoId) {
          // Récupérer les métadonnées YouTube
          const metadata = await fetchYouTubeMetadataWithFallback(url, extractedVideoId);

          // Navigate to player page with enriched metadata
          router.push({
            pathname: '/player',
            params: {
              videoId: extractedVideoId,
              title: metadata.title,
              author: metadata.author_name,
              thumbnail: metadata.thumbnail_url,
              url: url,
              isFromApi: metadata.isFromApi.toString(),
            },
          });
        }
      } catch (error) {
        setError('Impossible de charger la vidéo');
      } finally {
        setIsLoadingVideo(false);
      }
    },
    [router]
  );

  // Navigation automatique quand l'URL est valide (avec debounce)
  useEffect(() => {
    if (debouncedUrl && isValidYouTubeUrl(debouncedUrl)) {
      handleNavigateToPlayer(debouncedUrl);
    }
  }, [debouncedUrl, handleNavigateToPlayer]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* État Initial - Input URL uniquement */}
          {interfaceState === 'initial' && (
            <View style={styles.initialState}>
              <View style={styles.logoContainer}>
                <Text style={[styles.appTitle, { color: colors.text.primary }]}>Moments</Text>
              </View>

              {/* Section CTA */}
              <View style={styles.ctaContainer}>
                <Text style={[styles.ctaSubtitle, { color: colors.text.secondary }]}>
                  Capturez les meilleurs passages de vos vidéos et podcasts
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.modernInput,
                    {
                      backgroundColor: colors.background.white,
                      borderColor: isValidYouTubeUrl(youtubeUrl)
                        ? Colors.primary
                        : error
                          ? Colors.error
                          : colors.border.medium,
                      color: colors.text.primary,
                    },
                    isValidYouTubeUrl(youtubeUrl) && styles.inputValid,
                  ]}
                  placeholder="Coller l'URL YouTube"
                  placeholderTextColor={colors.text.tertiary}
                  value={youtubeUrl}
                  onChangeText={text => {
                    setYoutubeUrl(text);
                    if (error) setError('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="done"
                  multiline={false}
                  textAlignVertical="center"
                />

                {isValidYouTubeUrl(youtubeUrl) && (
                  <View style={styles.validIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                  </View>
                )}
              </View>

              {error && <Text style={[styles.errorText, { color: Colors.error }]}>{error}</Text>}

              {/* Section Sources supportées */}
              <View style={styles.supportedSourcesContainer}>
                <Text style={[styles.supportedSourcesTitle, { color: colors.text.secondary }]}>
                  Sources supportées
                </Text>
                <View style={styles.sourcesIconsContainer}>
                  <View style={styles.sourceIcon}>
                    <AntDesign name="youtube" size={20} color="#FF0000" />
                  </View>
                  <View style={styles.sourceIcon}>
                    <AntDesign name="spotify" size={20} color="#1DB954" />
                  </View>
                  <View style={styles.sourceIcon}>
                    <AntDesign name="apple" size={20} color={colors.text.primary} />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* État Chargement */}
          {interfaceState === 'loading' && (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                Ouverture du lecteur...
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },

  // État Initial
  initialState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
    letterSpacing: -0.5,
  },

  // Section CTA
  ctaContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  ctaSubtitle: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.8,
  },
  inputContainer: {
    position: 'relative',
  },
  modernInput: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 56,
  },
  inputValid: {
    borderWidth: 2,
  },
  validIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Section Sources supportées
  supportedSourcesContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  supportedSourcesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  sourcesIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sourceIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.025)',
  },

  // État Chargement
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
