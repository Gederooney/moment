/**
 * QueueItem Component
 * Individual video item in the queue with thumbnail and title
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export interface QueueVideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration?: string;
  channelName?: string;
}

interface QueueItemProps {
  item: QueueVideoItem;
  isCurrentVideo?: boolean;
  onPress: (item: QueueVideoItem) => void;
  onRemove?: (item: QueueVideoItem) => void;
  isDark?: boolean;
  style?: ViewStyle;
}

export const QueueItem: React.FC<QueueItemProps> = ({
  item,
  isCurrentVideo = false,
  onPress,
  onRemove,
  isDark = true,
  style,
}) => {
  const colors = getColors(isDark);
  const [scaleValue] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    onPress(item);
  };

  const containerStyle = [
    styles.container,
    isCurrentVideo && {
      backgroundColor: 'rgba(255, 0, 0, 0.05)',
      borderRadius: 8,
    },
    style,
  ];

  const renderRightActions = () => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => onRemove?.(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash" size={20} color="#fff" />
      </TouchableOpacity>
    );
  };

  const content = (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={containerStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        accessibilityLabel={`Lecture de ${item.title}`}
        accessibilityRole="button"
        accessibilityState={{ selected: isCurrentVideo }}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />

          {/* Duration overlay */}
          {item.duration && (
            <View style={styles.durationOverlay}>
              <Text style={styles.durationText}>
                {item.duration}
              </Text>
            </View>
          )}

          {/* Current video indicator */}
          {isCurrentVideo && (
            <View style={[styles.playingIndicator, { backgroundColor: colors.primary }]}>
              <View style={styles.playingDot} />
              <View style={[styles.playingDot, styles.playingDotDelayed]} />
              <View style={[styles.playingDot, styles.playingDotDelayed2]} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: isCurrentVideo ? colors.primary : colors.text.primary }
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>

          {/* Channel name if available */}
          {item.channelName && (
            <Text
              style={[styles.channel, { color: colors.text.secondary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.channelName}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Ne pas permettre le swipe sur la vidéo en cours
  if (isCurrentVideo) {
    return content;
  }

  return (
    <Swipeable renderRightActions={renderRightActions}>
      {content}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 50,
    width: '100%',
  },
  thumbnailContainer: {
    position: 'relative',
    width: 50,
    height: 38,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  durationOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  playingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingDot: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  playingDotDelayed: {
    display: 'none',
  },
  playingDotDelayed2: {
    display: 'none',
  },
  title: {
    ...Typography.caption,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 2,
  },
  channel: {
    ...Typography.caption,
    fontSize: 10,
    opacity: 0.7,
  },
  deleteAction: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 8,
    marginVertical: 8,
  },
});