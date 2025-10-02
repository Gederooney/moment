import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useMomentsContext } from '../../contexts/MomentsContext';

interface RecentMomentsProps {
  colors: any;
}

export function RecentMoments({ colors }: RecentMomentsProps) {
  const router = useRouter();
  const { videos } = useMomentsContext();

  // Récupérer les 5 derniers moments de tous les médias (YouTube, Spotify, SoundCloud, etc.)
  const recentMoments = videos
    .flatMap(video =>
      video.moments.map(moment => ({
        ...moment,
        videoId: video.id,
        videoTitle: video.title,
        videoUrl: video.url,
        videoThumbnail: video.thumbnail,
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleMomentPress = (moment: any) => {
    router.push({
      pathname: '/player',
      params: {
        videoId: moment.videoId,
        title: moment.videoTitle,
        url: moment.videoUrl,
        thumbnail: moment.videoThumbnail,
        timestamp: moment.timestamp.toString(),
        isFromApi: 'false',
      },
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')} min`;
  };

  if (recentMoments.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        Moments récents
      </Text>

      {recentMoments.map((moment, index) => (
        <TouchableOpacity
          key={`${moment.videoId}-${moment.id}-${index}`}
          style={styles.momentItem}
          onPress={() => handleMomentPress(moment)}
          activeOpacity={0.7}
        >
          {moment.videoThumbnail ? (
            <Image
              source={{ uri: moment.videoThumbnail }}
              style={styles.momentThumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.momentThumbnail, { backgroundColor: colors.background.tertiary }]} />
          )}
          <View style={styles.momentInfo}>
            <Text
              style={[styles.momentTitle, { color: colors.text.primary }]}
              numberOfLines={1}
            >
              {moment.videoTitle}
            </Text>
            <Text style={[styles.momentTime, { color: colors.text.secondary }]}>
              Moment à {formatTime(moment.timestamp)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  momentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  momentThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  momentInfo: {
    flex: 1,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  momentTime: {
    fontSize: 14,
    fontWeight: '400',
  },
});
