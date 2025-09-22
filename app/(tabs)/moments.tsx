import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { VideoAccordion } from '../../components/VideoAccordion';
import { useMomentsContext } from '../../contexts/MomentsContext';
import { useTopBarContext } from '../../contexts/TopBarContext';
import { VideoWithMoments } from '../../types/moment';
import { fetchYouTubeMetadataWithFallback } from '../../services/youtubeMetadata';
import { extractVideoId, isValidYouTubeUrl, normalizeYouTubeUrl } from '../../utils/youtube';

export default function MomentsScreen() {
  const router = useRouter();
  const {
    videos,
    isLoading,
    refreshMoments,
    deleteMoment,
    deleteAllMomentsForVideo,
    clearAllHistory,
    searchVideos,
    getTotalMomentsCount,
    subscribeMomentUpdates,
  } = useMomentsContext();

  // Contexte TopBar pour mettre à jour le titre
  const { setTitle } = useTopBarContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // États pour le modal de nouvelle vidéo
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));

  // Filter videos based on search query
  const filteredVideos = searchVideos(searchQuery);

  // Validation de l'URL YouTube
  useEffect(() => {
    setIsUrlValid(isValidYouTubeUrl(videoUrl));
  }, [videoUrl]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshMoments();
    setRefreshing(false);
  }, [refreshMoments]);

  // Subscribe to real-time moment updates
  useEffect(() => {
    const unsubscribe = subscribeMomentUpdates((updatedVideos) => {
      // The context will automatically update the videos state
      // This callback can be used for additional real-time UI updates if needed
    });

    return unsubscribe;
  }, [subscribeMomentUpdates]);

  // Mise à jour du titre TopBar
  useEffect(() => {
    setTitle('Moments');
  }, [setTitle]);

  const handleToggleExpand = useCallback((videoId: string) => {
    setExpandedVideoId(current => current === videoId ? null : videoId);
  }, []);

  const handlePlayMoment = useCallback((videoId: string, timestamp: number) => {
    // Navigate to player screen with video and timestamp
    const video = videos.find(v => v.id === videoId);
    router.push({
      pathname: '/player',
      params: {
        videoId,
        timestamp: timestamp.toString(),
        title: video?.title || 'Vidéo YouTube',
        author: video?.author || '',
        thumbnail: video?.thumbnailFromApi || video?.thumbnail || '',
        url: video?.url || `https://youtube.com/watch?v=${videoId}`,
        isFromApi: (video?.metadataLoadedFromApi || false).toString(),
      },
    });
  }, [router, videos]);

  const handleDeleteMoment = useCallback(async (momentId: string) => {
    await deleteMoment(momentId);
  }, [deleteMoment]);

  const handleDeleteAllMomentsForVideo = useCallback(async (videoId: string) => {
    await deleteAllMomentsForVideo(videoId);
  }, [deleteAllMomentsForVideo]);

  const handleClearAllHistory = useCallback(() => {
    Alert.alert(
      'Effacer tous les moments',
      'Êtes-vous sûr de vouloir supprimer tous les moments ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout effacer',
          style: 'destructive',
          onPress: clearAllHistory,
        },
      ]
    );
  }, [clearAllHistory]);

  // Gestion du modal de nouvelle vidéo
  const showAddVideoModal = useCallback(() => {
    setIsModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [modalAnimation]);

  const hideAddVideoModal = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setVideoUrl('');
      setIsLoadingMetadata(false);
    });
  }, [modalAnimation]);

  const handleAddVideo = useCallback(async () => {
    if (!isUrlValid || isLoadingMetadata) return;

    try {
      setIsLoadingMetadata(true);

      const normalizedUrl = normalizeYouTubeUrl(videoUrl);
      const videoId = extractVideoId(normalizedUrl);

      if (!videoId) {
        Alert.alert('Erreur', 'Impossible d\'extraire l\'ID de la vidéo.');
        return;
      }

      // Récupérer les métadonnées
      const metadata = await fetchYouTubeMetadataWithFallback(normalizedUrl, videoId);

      // Fermer le modal
      hideAddVideoModal();

      // Naviguer vers le player
      router.push({
        pathname: '/player',
        params: {
          videoId,
          title: metadata.title,
          author: metadata.author_name,
          thumbnail: metadata.thumbnail_url,
          url: normalizedUrl,
          isFromApi: metadata.isFromApi.toString(),
        },
      });
    } catch (error) {
      console.error('Error adding video:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les informations de la vidéo. Vérifiez l\'URL et votre connexion internet.'
      );
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [isUrlValid, isLoadingMetadata, videoUrl, hideAddVideoModal, router]);

  const renderVideoItem = useCallback(({ item }: { item: VideoWithMoments }) => (
    <VideoAccordion
      video={item}
      isExpanded={expandedVideoId === item.id}
      onToggleExpand={() => handleToggleExpand(item.id)}
      onPlayMoment={handlePlayMoment}
      onDeleteMoment={handleDeleteMoment}
      onDeleteAllMoments={handleDeleteAllMomentsForVideo}
    />
  ), [expandedVideoId, handleToggleExpand, handlePlayMoment, handleDeleteMoment, handleDeleteAllMomentsForVideo]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bookmark-outline" size={64} color={Colors.text.light} />
      <Text style={styles.emptyTitle}>Aucun moment</Text>
      <Text style={styles.emptySubtitle}>
        Les moments que vous capturez apparaîtront ici
      </Text>
      <TouchableOpacity
        style={styles.goToHomeButton}
        onPress={() => router.push('/(tabs)/')}
      >
        <Ionicons name="home-outline" size={20} color={Colors.primary} />
        <Text style={styles.goToHomeText}>Aller à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color={Colors.text.light} />
      <Text style={styles.emptyTitle}>Aucun résultat</Text>
      <Text style={styles.emptySubtitle}>
        Aucune vidéo ne correspond à "{searchQuery}"
      </Text>
      <TouchableOpacity
        style={styles.clearSearchButton}
        onPress={() => setSearchQuery('')}
      >
        <Text style={styles.clearSearchText}>Effacer la recherche</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des moments...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Add Video Button */}
      <View style={styles.addVideoSection}>
        <TouchableOpacity
          style={styles.addVideoButton}
          onPress={showAddVideoModal}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={Colors.background.white} />
          <Text style={styles.addVideoText}>Nouvelle vidéo</Text>
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une vidéo..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats and Clear Button */}
        {videos.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {videos.length} vidéo{videos.length > 1 ? 's' : ''} • {getTotalMomentsCount()} moment{getTotalMomentsCount() > 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={handleClearAllHistory}
            >
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
              <Text style={styles.clearAllText}>Tout effacer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Videos List */}
      <FlatList
        data={filteredVideos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredVideos.length === 0 && styles.listContentCentered,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          videos.length === 0 ? renderEmptyState() :
          searchQuery ? renderSearchEmptyState() : null
        }
        // Optimize performance for large lists
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
        getItemLayout={(data, index) => ({
          length: 80, // Estimated height
          offset: 80 * index,
          index,
        })}
      />

      {/* Add Video Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={hideAddVideoModal}
        statusBarTranslucent
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: modalAnimation,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={hideAddVideoModal}
          />
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
                opacity: modalAnimation,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter une vidéo</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={hideAddVideoModal}
              >
                <Ionicons name="close" size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>URL YouTube</Text>
              <View style={[
                styles.urlInputContainer,
                isUrlValid && styles.urlInputContainerValid,
                videoUrl.length > 0 && !isUrlValid && styles.urlInputContainerError,
              ]}>
                <Ionicons
                  name={isUrlValid ? "checkmark-circle" : "link"}
                  size={20}
                  color={isUrlValid ? Colors.success : Colors.text.secondary}
                />
                <TextInput
                  style={styles.urlInput}
                  placeholder="https://youtube.com/watch?v=..."
                  placeholderTextColor={Colors.text.tertiary}
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="done"
                  onSubmitEditing={handleAddVideo}
                  editable={!isLoadingMetadata}
                />
              </View>

              {videoUrl.length > 0 && !isUrlValid && (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning" size={16} color={Colors.error} />
                  <Text style={styles.errorText}>
                    Veuillez saisir une URL YouTube valide
                  </Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={hideAddVideoModal}
                  disabled={isLoadingMetadata}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.launchButton,
                    (!isUrlValid || isLoadingMetadata) && styles.launchButtonDisabled,
                  ]}
                  onPress={handleAddVideo}
                  disabled={!isUrlValid || isLoadingMetadata}
                >
                  {isLoadingMetadata ? (
                    <ActivityIndicator size="small" color={Colors.background.white} />
                  ) : (
                    <>
                      <Ionicons name="play" size={20} color={Colors.background.white} />
                      <Text style={styles.launchButtonText}>Lancer</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  addVideoSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  addVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addVideoText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearAllText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  goToHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  goToHomeText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  clearSearchButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  clearSearchText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: Colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.border.light,
    gap: 12,
  },
  urlInputContainerValid: {
    borderColor: Colors.success,
    backgroundColor: Colors.background.white,
  },
  urlInputContainerError: {
    borderColor: Colors.error,
  },
  urlInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    ...(Platform.OS === 'ios' && {
      paddingVertical: 0,
    }),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  launchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  launchButtonDisabled: {
    backgroundColor: Colors.text.tertiary,
  },
  launchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background.white,
  },
});