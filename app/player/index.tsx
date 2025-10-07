import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { getColors } from '../../constants/Colors';
import { YouTubePlayerHandle } from '../../components/YouTubePlayer';
import { usePlayerState } from './_usePlayerState';
import { PlayerVideo } from './_PlayerVideo';
import { PlayerQueue } from './_PlayerQueue';
import { PlayerMoments } from './_PlayerMoments';
import { PlayerControls } from './_PlayerControls';
import { useTopBarContext } from '../../contexts/TopBarContext';
import { MomentEditor } from '../../components/MomentEditor';
import { useMoments } from '../../hooks/useMoments';
import { CapturedMoment } from '../../types/moment';
import { formatTime } from '../../utils/time';

export default function PlayerScreen() {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const { setVideoState, clearVideoState, setBackButton } = useTopBarContext();
  const { updateMomentNotes, updateMomentTags, updateMoment: updateMomentInContext } = useMoments();
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingMoment, setEditingMoment] = useState<CapturedMoment | null>(null);
  const [pendingMomentData, setPendingMomentData] = useState<{ videoId: string; timestamp: number } | null>(null);

  const {
    videoId,
    videoTitle,
    videoState,
    seekToTime,
    getVideoHeight,
    moments,
    queueData,
    getCurrentVideoId,
    isDark,
    handleVideoStateChange,
    handleVideoEnd,
    addVideoByUrl,
    removeVideo,
    playVideo,
    reorderVideos,
    captureMoment: originalCaptureMoment,
    playMoment,
    deleteMoment,
  } = usePlayerState(playerRef);

  const colors = getColors(isDark);

  // Handle queue video press
  const handleQueueVideoPress = (queueVideo: any) => {
    const videoIndex = queueData.findIndex(v => v.id === queueVideo.id);
    if (videoIndex !== -1) {
      playVideo(videoIndex);
    }
  };

  // Handle queue video remove
  const handleQueueVideoRemove = (queueVideo: any) => {
    removeVideo(queueVideo.id);
  };

  // Handle capture moment - open editor immediately
  const handleCaptureMoment = async () => {
    const timestamp = videoState.currentTime;
    setPendingMomentData({ videoId, timestamp });
    setEditingMoment(null);
    setEditorVisible(true);
  };

  // Handle edit existing moment
  const handleEditMoment = (moment: CapturedMoment) => {
    setEditingMoment(moment);
    setPendingMomentData(null);
    setEditorVisible(true);
  };

  // Handle save moment from editor
  const handleSaveMoment = async (data: { title: string; notes: string; tags: string[] }) => {
    if (editingMoment) {
      // Update existing moment
      await updateMomentInContext(editingMoment.id, {
        title: data.title,
        notes: data.notes,
        tags: data.tags,
      });
    } else if (pendingMomentData) {
      // Create new moment
      const newMoment = await originalCaptureMoment();
      if (newMoment) {
        await updateMomentInContext(newMoment.id, {
          title: data.title,
          notes: data.notes,
          tags: data.tags,
        });
      }
    }
    setEditorVisible(false);
    setEditingMoment(null);
    setPendingMomentData(null);
  };

  // Handle cancel editor
  const handleCancelEditor = () => {
    setEditorVisible(false);
    setEditingMoment(null);
    setPendingMomentData(null);
  };

  // Update TopBar with video title and back button
  useEffect(() => {
    if (videoId) {
      setVideoState(videoId, videoTitle || 'Titre de la piste');
      setBackButton(true);
    }

    // Cleanup: reset TopBar when leaving
    return () => {
      clearVideoState();
      setBackButton(false);
    };
  }, [videoId, videoTitle, setVideoState, clearVideoState, setBackButton]);

  if (!videoId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text.primary }]}>ID de vidéo manquant</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <PlayerVideo
        videoId={videoId}
        videoHeight={getVideoHeight}
        seekToTime={seekToTime}
        onStateChange={handleVideoStateChange}
        onVideoEnd={handleVideoEnd}
        playerRef={playerRef}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <PlayerQueue
            videos={queueData}
            currentVideoId={getCurrentVideoId()}
            onVideoPress={handleQueueVideoPress}
            onAddVideo={addVideoByUrl}
            onVideoRemove={handleQueueVideoRemove}
            onVideoReorder={reorderVideos}
            isDark={isDark}
          />

          <PlayerMoments moments={moments} onPlayMoment={playMoment} onDeleteMoment={deleteMoment} />
        </ScrollView>

        <PlayerControls
          onCapture={handleCaptureMoment}
          disabled={!videoState.isReady}
          currentTime={videoState.currentTime}
        />
      </KeyboardAvoidingView>

      {/* Moment Editor Modal */}
      <MomentEditor
        visible={editorVisible}
        moment={editingMoment}
        defaultTitle={
          pendingMomentData
            ? `Moment at ${formatTime(pendingMomentData.timestamp)}`
            : editingMoment?.title || ''
        }
        onSave={handleSaveMoment}
        onCancel={handleCancelEditor}
        darkMode={isDark}
      />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});
