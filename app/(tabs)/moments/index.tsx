import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { VideoAccordion } from '../../../components/VideoAccordion';
import { VideoWithMoments } from '../../../types/moment';
import { useMomentsScreen } from './_useMomentsScreen';
import { MomentsHeader } from './_MomentsHeader';
import { MomentsSearchBar } from './_MomentsSearchBar';
import { MomentsEmptyState } from './_MomentsEmptyState';
import { MomentsModal } from './_MomentsModal';
import { MomentsLoadingState } from './_MomentsLoadingState';
import { MomentsList } from './_MomentsList';

export default function MomentsScreen() {
  const {
    videos,
    isLoading,
    searchQuery,
    setSearchQuery,
    expandedVideoId,
    refreshing,
    filteredVideos,
    isModalVisible,
    videoUrl,
    setVideoUrl,
    isUrlValid,
    isLoadingMetadata,
    modalAnimation,
    getTotalMomentsCount,
    handleRefresh,
    handleToggleExpand,
    handlePlayMoment,
    handleDeleteMoment,
    handleDeleteAllMomentsForVideo,
    handleClearAllHistory,
    showAddVideoModal,
    hideAddVideoModal,
    handleAddVideo,
  } = useMomentsScreen();

  const renderVideoItem = useCallback(
    ({ item }: { item: VideoWithMoments }) => (
      <VideoAccordion
        video={item}
        isExpanded={expandedVideoId === item.id}
        onToggleExpand={() => handleToggleExpand(item.id)}
        onPlayMoment={handlePlayMoment}
        onDeleteMoment={handleDeleteMoment}
        onDeleteAllMoments={handleDeleteAllMomentsForVideo}
      />
    ),
    [
      expandedVideoId,
      handleToggleExpand,
      handlePlayMoment,
      handleDeleteMoment,
      handleDeleteAllMomentsForVideo,
    ]
  );

  const renderEmptyComponent = () => {
    if (videos.length === 0) {
      return <MomentsEmptyState type="empty" />;
    }
    if (searchQuery) {
      return (
        <MomentsEmptyState
          type="search"
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
        />
      );
    }
    return null;
  };

  if (isLoading) {
    return <MomentsLoadingState />;
  }

  return (
    <View style={styles.container}>
      <MomentsHeader onAddVideo={showAddVideoModal} />

      <MomentsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        videosCount={videos.length}
        momentsCount={getTotalMomentsCount()}
        onClearAll={handleClearAllHistory}
      />

      <MomentsList
        filteredVideos={filteredVideos}
        expandedVideoId={expandedVideoId}
        refreshing={refreshing}
        renderEmptyComponent={renderEmptyComponent}
        renderVideoItem={renderVideoItem}
        handleRefresh={handleRefresh}
      />

      <MomentsModal
        visible={isModalVisible}
        videoUrl={videoUrl}
        isUrlValid={isUrlValid}
        isLoading={isLoadingMetadata}
        modalAnimation={modalAnimation}
        onChangeUrl={setVideoUrl}
        onClose={hideAddVideoModal}
        onSubmit={handleAddVideo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});
