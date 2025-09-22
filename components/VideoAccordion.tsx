import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { VideoWithMoments } from '../types/moment';
import { AnimatedMomentItem } from './AnimatedMomentItem';

interface VideoAccordionProps {
  video: VideoWithMoments;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPlayMoment: (videoId: string, timestamp: number) => void;
  onDeleteMoment: (momentId: string) => void;
  onDeleteAllMoments: (videoId: string) => void;
}

export const VideoAccordion: React.FC<VideoAccordionProps> = ({
  video,
  isExpanded,
  onToggleExpand,
  onPlayMoment,
  onDeleteMoment,
  onDeleteAllMoments,
}) => {
  const [animation] = useState(new Animated.Value(isExpanded ? 1 : 0));
  const [previousMomentsCount, setPreviousMomentsCount] = useState(video.moments.length);

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, animation]);

  React.useEffect(() => {
    // Update previous count when moments change
    if (video.moments.length !== previousMomentsCount) {
      setPreviousMomentsCount(video.moments.length);
    }
  }, [video.moments.length, previousMomentsCount]);

  const handleDeleteAllMoments = () => {
    Alert.alert(
      'Supprimer tous les moments',
      `Êtes-vous sûr de vouloir supprimer tous les moments de "${video.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer tout',
          style: 'destructive',
          onPress: () => onDeleteAllMoments(video.id),
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isRecentMoment = (createdAt: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes < 5; // Less than 5 minutes ago
  };

  // Sort moments by creation date (most recent first)
  const sortedMoments = [...video.moments].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Dynamic height calculation based on actual content
  const MOMENT_HEIGHT = 65; // Approximate height per moment item (padding + content)
  const EMPTY_STATE_HEIGHT = 80; // Height when no moments
  const CONTAINER_PADDING = 24; // Container top/bottom padding

  const maxHeight = video.moments.length === 0
    ? EMPTY_STATE_HEIGHT + CONTAINER_PADDING
    : Math.min(320, video.moments.length * MOMENT_HEIGHT + CONTAINER_PADDING);

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, maxHeight],
  });

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      {/* Video Header */}
      <TouchableOpacity style={styles.header} onPress={onToggleExpand}>
        <Image
          source={{ uri: video.thumbnailFromApi || video.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {video.title}
          </Text>
          {video.author && (
            <Text style={styles.videoAuthor} numberOfLines={1}>
              {video.author}
            </Text>
          )}
          <View style={styles.videoMetaContainer}>
            <Text style={styles.videoMeta}>
              {video.moments.length} moment{video.moments.length > 1 ? 's' : ''} • {formatDate(video.addedAt)}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {video.moments.length > 0 && (
            <TouchableOpacity
              style={styles.deleteAllButton}
              onPress={handleDeleteAllMoments}
              accessibilityLabel="Supprimer tous les moments"
              accessibilityHint="Supprimer tous les moments de cette vidéo"
            >
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
            </TouchableOpacity>
          )}

          <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
            <Ionicons
              name="chevron-down"
              size={20}
              color={Colors.text.secondary}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Moments List */}
      <Animated.View style={[styles.momentsContainer, { height: animatedHeight }]}>
        <ScrollView style={styles.momentsContent} showsVerticalScrollIndicator={false}>
          {video.moments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={24} color={Colors.text.light} />
              <Text style={styles.emptyText}>Aucun moment capturé</Text>
            </View>
          ) : (
            sortedMoments.map((moment, index) => {
              const isNewMoment = index === 0 && video.moments.length > previousMomentsCount;
              return (
                <AnimatedMomentItem
                  key={moment.id}
                  moment={moment}
                  onPlay={() => onPlayMoment(video.id, moment.timestamp)}
                  onDelete={() => onDeleteMoment(moment.id)}
                  showNewBadge={isRecentMoment(moment.createdAt)}
                  isNew={isNewMoment}
                />
              );
            })
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 45,
    borderRadius: 8,
    backgroundColor: Colors.border.light,
  },
  videoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  videoAuthor: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  videoMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoMeta: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
  },
  apiMetadataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  apiMetadataText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteAllButton: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: 'transparent',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentsContainer: {
    overflow: 'hidden',
  },
  momentsContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.light,
    fontStyle: 'italic',
  },
});