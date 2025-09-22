import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { YouTubePlayerComponent } from '../components/YouTubePlayer';
import { PlaylistProvider } from '../contexts/PlaylistContext';
import { usePlaylist } from '../hooks/usePlaylist';
import { Colors } from '../constants/Colors';
import { PlaylistVideo } from '../types/playlist';

/**
 * Example component showing how to use the playlist system
 * This demonstrates:
 * - Creating playlists
 * - Adding/removing videos
 * - Playing playlists with auto-advance
 * - Shuffle and repeat functionality
 * - Playlist management
 */

const PlaylistExample = () => {
  const {
    playlists,
    activePlaylist,
    currentVideo,
    currentVideoIndex,
    isPlaying,
    hasNextVideo,
    hasPreviousVideo,
    createPlaylistSafe,
    addVideoSafe,
    setActivePlaylist,
    playNext,
    playPrevious,
    toggleShuffle,
    setRepeatMode,
    deletePlaylist,
    formatDuration,
    activePlaylistMetrics,
  } = usePlaylist();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    try {
      await createPlaylistSafe(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateModal(false);
      Alert.alert('Success', 'Playlist created successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create playlist');
    }
  };

  const handleAddVideo = async (playlistId: string) => {
    if (!newVideoUrl.trim()) {
      Alert.alert('Error', 'Please enter a YouTube URL');
      return;
    }

    const videoId = extractVideoId(newVideoUrl);
    if (!videoId) {
      Alert.alert('Error', 'Please enter a valid YouTube URL');
      return;
    }

    try {
      await addVideoSafe(playlistId, {
        videoId,
        title: `Video ${videoId}`, // In real app, you'd fetch this from YouTube API
        author: 'Unknown Artist',
        thumbnail: `https://img.youtube.com/vi/${videoId}/default.jpg`,
        url: newVideoUrl.trim(),
        duration: 180, // 3 minutes default
      });

      setNewVideoUrl('');
      Alert.alert('Success', 'Video added to playlist!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add video');
    }
  };

  const handleVideoEnd = async () => {
    console.log('Video ended, attempting to play next...');

    if (!activePlaylist) {
      console.log('No active playlist');
      return;
    }

    if (activePlaylist.settings.autoPlay && hasNextVideo) {
      try {
        await playNext();
        console.log('Successfully moved to next video');
      } catch (error) {
        console.error('Failed to play next video:', error);
      }
    } else {
      console.log('Auto-play disabled or no next video available');
    }
  };

  const handleDeletePlaylist = (playlistId: string) => {
    Alert.alert(
      'Delete Playlist',
      'Are you sure you want to delete this playlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePlaylist(playlistId),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* YouTube Player */}
      <View style={styles.playerSection}>
        <YouTubePlayerComponent
          videoId={currentVideo?.videoId || null}
          onStateChange={(state) => {
            console.log('Player state changed:', state);
          }}
          onEnd={handleVideoEnd}
          autoplay={activePlaylist?.settings.autoPlay}
        />

        {/* Player Controls */}
        {activePlaylist && (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, !hasPreviousVideo && styles.disabled]}
              onPress={playPrevious}
              disabled={!hasPreviousVideo}
            >
              <Text style={styles.controlText}>⏮</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, !hasNextVideo && styles.disabled]}
              onPress={playNext}
              disabled={!hasNextVideo}
            >
              <Text style={styles.controlText}>⏭</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                activePlaylist.settings.shuffle && styles.active
              ]}
              onPress={() => toggleShuffle(activePlaylist.id)}
            >
              <Text style={styles.controlText}>🔀</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
                const currentIndex = modes.indexOf(activePlaylist.settings.repeat);
                const nextMode = modes[(currentIndex + 1) % modes.length];
                setRepeatMode(activePlaylist.id, nextMode);
              }}
            >
              <Text style={styles.controlText}>
                {activePlaylist.settings.repeat === 'none' && '🔁'}
                {activePlaylist.settings.repeat === 'one' && '🔂'}
                {activePlaylist.settings.repeat === 'all' && '🔁'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Current Video Info */}
        {currentVideo && (
          <View style={styles.currentVideoInfo}>
            <Text style={styles.currentVideoTitle}>{currentVideo.title}</Text>
            <Text style={styles.currentVideoMeta}>
              Video {currentVideoIndex + 1} of {activePlaylist?.videos.length}
              {currentVideo.duration && ` • ${formatDuration(currentVideo.duration)}`}
            </Text>
          </View>
        )}

        {/* Playlist Metrics */}
        {activePlaylistMetrics && (
          <View style={styles.metrics}>
            <Text style={styles.metricsText}>
              {activePlaylistMetrics.totalVideos} videos •
              {formatDuration(activePlaylistMetrics.totalDuration)} total •
              {Math.round(activePlaylistMetrics.completionPercentage)}% complete
            </Text>
          </View>
        )}
      </View>

      {/* Create Playlist Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.createButtonText}>+ Create New Playlist</Text>
      </TouchableOpacity>

      {/* Playlists List */}
      <View style={styles.playlistsSection}>
        <Text style={styles.sectionTitle}>My Playlists</Text>

        {playlists.length === 0 ? (
          <Text style={styles.emptyText}>No playlists yet. Create one to get started!</Text>
        ) : (
          playlists.map((playlist) => (
            <View key={playlist.id} style={styles.playlistItem}>
              <View style={styles.playlistHeader}>
                <Text style={styles.playlistName}>{playlist.name}</Text>
                <View style={styles.playlistActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      playlist.isActive && styles.activeButton
                    ]}
                    onPress={() => setActivePlaylist(playlist.id)}
                  >
                    <Text style={styles.actionButtonText}>
                      {playlist.isActive ? 'Active' : 'Play'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeletePlaylist(playlist.id)}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.playlistMeta}>
                {playlist.videos.length} videos •
                Created {playlist.createdAt.toLocaleDateString()}
              </Text>

              {playlist.description && (
                <Text style={styles.playlistDescription}>{playlist.description}</Text>
              )}

              {/* Add Video Input */}
              <View style={styles.addVideoSection}>
                <TextInput
                  style={styles.input}
                  placeholder="YouTube URL"
                  placeholderTextColor={Colors.text.muted}
                  value={newVideoUrl}
                  onChangeText={setNewVideoUrl}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddVideo(playlist.id)}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Videos List */}
              {playlist.videos.map((video, index) => (
                <View key={video.id} style={styles.videoItem}>
                  <Text style={styles.videoTitle} numberOfLines={1}>
                    {index + 1}. {video.title}
                  </Text>
                  <Text style={styles.videoMeta}>
                    {video.author} • {video.duration ? formatDuration(video.duration) : 'Unknown duration'}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </View>

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Playlist</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Playlist name"
              placeholderTextColor={Colors.text.muted}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Wrapper component with Provider
export const PlaylistExampleWithProvider = () => (
  <PlaylistProvider>
    <PlaylistExample />
  </PlaylistProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  playerSection: {
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.background.darker,
  },
  controlButton: {
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    minWidth: 50,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: Colors.text.muted,
    opacity: 0.5,
  },
  active: {
    backgroundColor: Colors.accent,
  },
  controlText: {
    fontSize: 18,
    color: Colors.text.white,
  },
  currentVideoInfo: {
    padding: 15,
    backgroundColor: Colors.background.darker,
  },
  currentVideoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 5,
  },
  currentVideoMeta: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  metrics: {
    padding: 15,
    backgroundColor: Colors.background.darker,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metricsText: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: 'center',
  },
  createButton: {
    margin: 15,
    padding: 15,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  playlistsSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 15,
  },
  emptyText: {
    color: Colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  playlistItem: {
    backgroundColor: Colors.background.darker,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.white,
    flex: 1,
  },
  playlistActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: Colors.accent,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  playlistMeta: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 10,
  },
  playlistDescription: {
    fontSize: 14,
    color: Colors.text.light,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  addVideoSection: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colors.text.white,
    backgroundColor: Colors.background.dark,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.text.white,
    fontWeight: 'bold',
  },
  videoItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  videoTitle: {
    fontSize: 14,
    color: Colors.text.white,
    marginBottom: 2,
  },
  videoMeta: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background.darker,
    borderRadius: 15,
    padding: 25,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: Colors.text.white,
    backgroundColor: Colors.background.dark,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.text.muted,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    color: Colors.text.white,
    fontWeight: 'bold',
  },
});

export default PlaylistExampleWithProvider;