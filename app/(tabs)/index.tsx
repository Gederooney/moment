import React, { useState, useCallback, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getColors } from '../../constants/Colors';
import { useTopBarContext } from '../../contexts/TopBarContext';
import { extractVideoId, isValidYouTubeUrl } from '../../utils/youtube';
import { fetchYouTubeMetadataWithFallback } from '../../services/youtubeMetadata';
import { useDebounce } from '../../hooks/useDebounce';
import { HomeInitialState } from './_HomeInitialState';
import { HomeLoadingState } from './_HomeLoadingState';
import { styles } from './_index.styles';

export default function HomeScreen() {
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isDark, setIsDark] = useState(false);
  // Simplifié - seulement YouTube pour l'instant
  const activeSource = 'youtube';

  const colors = getColors(isDark);

  // Contexte TopBar pour le titre
  const { setTitle, clearVideoState } = useTopBarContext();

  // Debounce de l'URL pour éviter les appels multiples
  const debouncedUrl = useDebounce(youtubeUrl, 500);

  // États de l'interface
  const interfaceState = isLoadingVideo ? 'loading' : 'initial';

  // Mise à jour du titre dans la TopBar à chaque focus
  useFocusEffect(
    useCallback(() => {
      clearVideoState();
      setTitle('Moments');
    }, [setTitle, clearVideoState])
  );

  const navigateWithMetadata = useCallback(
    async (extractedVideoId: string, url: string, metadata: any) => {
      router.push({
        pathname: '/player',
        params: {
          source: activeSource,
          videoId: extractedVideoId,
          title: metadata.title,
          artist: metadata.author_name,
          thumbnail: metadata.thumbnail_url,
          url: url,
          isFromApi: metadata.isFromApi.toString(),
        },
      });
    },
    [router, activeSource]
  );

  const handleNavigateToPlayer = useCallback(
    async (url: string) => {
      setIsLoadingVideo(true);
      setError('');

      try {
        const extractedVideoId = extractVideoId(url);
        if (extractedVideoId) {
          const metadata = await fetchYouTubeMetadataWithFallback(url, extractedVideoId);
          await navigateWithMetadata(extractedVideoId, url, metadata);
        }
      } catch (error) {
        setError('Impossible de charger la vidéo');
      } finally {
        setIsLoadingVideo(false);
      }
    },
    [navigateWithMetadata]
  );

  const handleChangeUrl = (text: string) => {
    setYoutubeUrl(text);
    if (error) setError('');
  };

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
          {interfaceState === 'initial' && (
            <HomeInitialState
              youtubeUrl={youtubeUrl}
              onChangeUrl={handleChangeUrl}
              error={error}
              colors={colors}
            />
          )}

          {interfaceState === 'loading' && <HomeLoadingState colors={colors} />}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
