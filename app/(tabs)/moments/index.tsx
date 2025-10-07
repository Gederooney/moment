import React, { useCallback } from 'react';
import {
  View,
  Text,
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
import { TagFilterChips } from '../../../components/TagFilterChips';
import { ExportModal } from '../../../components/ExportModal';
import { SelectionToolbar } from '../../../components/SelectionToolbar';
import { FolderPickerModal } from '../../../components/FolderPickerModal/FolderPickerModal';
import { useFolders } from '../../../hooks/useFolders';
import { Alert } from 'react-native';

export default function MomentsScreen() {
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showBulkFolderPicker, setShowBulkFolderPicker] = React.useState(false);
  const { folders, addMomentToFolder, createFolder } = useFolders();
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
    selectedTags,
    availableTags,
    handleToggleTag,
    handleClearTagFilters,
    getFilteredMomentsCount,
    isSelectionMode,
    selectedMomentIds,
    handleToggleSelection,
    handleToggleMomentSelect,
    handleCancelSelection,
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
        isSelectionMode={isSelectionMode}
        selectedMomentIds={selectedMomentIds}
        onToggleMomentSelect={handleToggleMomentSelect}
      />
    ),
    [
      expandedVideoId,
      handleToggleExpand,
      handlePlayMoment,
      handleDeleteMoment,
      handleDeleteAllMomentsForVideo,
      isSelectionMode,
      selectedMomentIds,
      handleToggleMomentSelect,
    ]
  );

  // Get all moments for export and selection
  const allMoments = filteredVideos.flatMap(video => video.moments);
  const hasExportableMoments = allMoments.length > 0;

  const handleBulkAddToFolder = React.useCallback(async (folderId: string) => {
    try {
      const selectedIds = Array.from(selectedMomentIds);
      for (const momentId of selectedIds) {
        await addMomentToFolder(folderId, momentId);
      }
      Alert.alert('Succès', `${selectedIds.length} moment(s) ajouté(s) au dossier`);
      handleCancelSelection();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter les moments au dossier');
    }
  }, [selectedMomentIds, addMomentToFolder, handleCancelSelection]);

  const handleBulkDelete = React.useCallback(() => {
    Alert.alert(
      'Supprimer les moments',
      `Êtes-vous sûr de vouloir supprimer ${selectedMomentIds.size} moment(s) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const selectedIds = Array.from(selectedMomentIds);
              for (const momentId of selectedIds) {
                await handleDeleteMoment(momentId);
              }
              Alert.alert('Succès', `${selectedIds.length} moment(s) supprimé(s)`);
              handleCancelSelection();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer les moments');
            }
          },
        },
      ]
    );
  }, [selectedMomentIds, handleDeleteMoment, handleCancelSelection]);

  const handleBulkExport = React.useCallback(() => {
    const selectedMoments = allMoments.filter(m => selectedMomentIds.has(m.id));
    if (selectedMoments.length > 0) {
      // TODO: Implement bulk export
      Alert.alert('Export', `Exporter ${selectedMoments.length} moment(s)`);
    }
  }, [selectedMomentIds, allMoments]);

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
      <MomentsHeader
        onAddVideo={showAddVideoModal}
        onExport={() => setShowExportModal(true)}
        hasExportableMoments={hasExportableMoments}
        onToggleSelection={handleToggleSelection}
        isSelectionMode={isSelectionMode}
      />

      <MomentsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        videosCount={videos.length}
        momentsCount={getTotalMomentsCount()}
        onClearAll={handleClearAllHistory}
      />

      {availableTags.length > 0 && (
        <TagFilterChips
          availableTags={availableTags}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          onClearAll={handleClearTagFilters}
        />
      )}

      {selectedTags.length > 0 && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterInfoText}>
            {getFilteredMomentsCount()} moment{getFilteredMomentsCount() !== 1 ? 's' : ''} with{' '}
            {selectedTags.map(tag => `#${tag}`).join(' + ')}
          </Text>
        </View>
      )}

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

      <ExportModal
        visible={showExportModal}
        moments={allMoments}
        videoTitle={filteredVideos.length === 1 ? filteredVideos[0].title : undefined}
        onClose={() => setShowExportModal(false)}
      />

      {isSelectionMode && (
        <SelectionToolbar
          selectedCount={selectedMomentIds.size}
          onAddToFolder={() => setShowBulkFolderPicker(true)}
          onDelete={handleBulkDelete}
          onExport={handleBulkExport}
          onCancel={handleCancelSelection}
        />
      )}

      <FolderPickerModal
        visible={showBulkFolderPicker}
        folders={folders}
        onClose={() => setShowBulkFolderPicker(false)}
        onSelectFolder={(folderId) => {
          setShowBulkFolderPicker(false);
          handleBulkAddToFolder(folderId);
        }}
        onCreateFolder={async (name, parentId) => {
          await createFolder(name, parentId);
        }}
        title="Ajouter à un dossier"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  filterInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e3f2fd',
  },
  filterInfoText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
});
