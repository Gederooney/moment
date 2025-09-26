/**
 * QueueExample Component
 * Example usage of the Queue component with mock data
 * This file demonstrates how to integrate the queue into your app
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Queue } from './Queue';
import { QueueVideoItem } from './QueueItem';

// Mock data for demonstration
const MOCK_VIDEOS: QueueVideoItem[] = [
  {
    id: '1',
    title: 'How to Build React Native Apps',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    duration: '15:32',
    channelName: 'Tech Channel',
  },
  {
    id: '2',
    title: 'TypeScript Best Practices for Mobile Development',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    duration: '8:45',
    channelName: 'DevTips',
  },
  {
    id: '3',
    title: 'UI/UX Design Principles',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    duration: '22:18',
    channelName: 'Design Hub',
  },
];

export const QueueExample: React.FC = () => {
  const [videos, setVideos] = useState<QueueVideoItem[]>(MOCK_VIDEOS);
  const [currentVideoId, setCurrentVideoId] = useState<string>('1');

  const handleVideoPress = (video: QueueVideoItem) => {
    setCurrentVideoId(video.id);
    Alert.alert('Lecture', `Lecture de: ${video.title}`);
  };

  const handleAddVideo = async (url: string): Promise<void> => {
    // Simulate API call to extract video info from YouTube URL
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Extract video ID from URL (simplified)
          const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
          const videoId = videoIdMatch ? videoIdMatch[1] : Math.random().toString();

          const newVideo: QueueVideoItem = {
            id: videoId,
            title: 'Nouvelle vidéo ajoutée',
            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            duration: '10:00',
            channelName: 'Chaîne YouTube',
          };

          setVideos(prev => [...prev, newVideo]);
          Alert.alert('Succès', "Vidéo ajoutée à la file d'attente");
          resolve();
        } catch (error) {
          reject(new Error("Impossible d'ajouter la vidéo"));
        }
      }, 1000); // Simulate loading time
    });
  };

  const handleVideoRemove = (video: QueueVideoItem) => {
    setVideos(prev => prev.filter(v => v.id !== video.id));

    // If we removed the current video, select the next one
    if (video.id === currentVideoId) {
      const currentIndex = videos.findIndex(v => v.id === currentVideoId);
      const nextVideo = videos[currentIndex + 1] || videos[currentIndex - 1];
      setCurrentVideoId(nextVideo?.id || '');
    }
  };

  return (
    <View style={styles.container}>
      <Queue
        videos={videos}
        currentVideoId={currentVideoId}
        onVideoPress={handleVideoPress}
        onAddVideo={handleAddVideo}
        onVideoRemove={handleVideoRemove}
        isDark={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 50, // For status bar
  },
});
