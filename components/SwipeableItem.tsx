import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../constants/Colors';
import { useSwipeActions } from '../hooks/useSwipeActions';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  onArchive?: () => void;
  deleteConfirmTitle?: string;
  deleteConfirmMessage?: string;
  containerStyle?: ViewStyle;
  showArchiveAction?: boolean;
  swipeThreshold?: number;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
  children,
  onDelete,
  onArchive,
  deleteConfirmTitle,
  deleteConfirmMessage,
  containerStyle,
  showArchiveAction = false,
  swipeThreshold = 40,
}) => {
  const {
    swipeableRef,
    handleDelete,
    handleArchive,
  } = useSwipeActions({
    onDelete,
    onArchive,
    deleteConfirmTitle,
    deleteConfirmMessage,
  });

  // Right actions (swipe left to reveal delete)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const deleteScale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const deleteTranslate = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [0, 25, 100],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActions}>
        <Animated.View
          style={[
            styles.deleteAction,
            {
              transform: [
                { scale: deleteScale },
                { translateX: deleteTranslate },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Supprimer"
            accessibilityHint="Supprimer cet élément"
          >
            <Ionicons name="trash" size={20} color={Colors.background.white} />
            <Text style={styles.deleteText}>Supprimer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // Left actions (swipe right to reveal archive) - Optional
  const renderLeftActions = showArchiveAction ? (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const archiveScale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const archiveTranslate = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [-100, -25, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.leftActions}>
        <Animated.View
          style={[
            styles.archiveAction,
            {
              transform: [
                { scale: archiveScale },
                { translateX: archiveTranslate },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.archiveButton}
            onPress={handleArchive}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Archiver"
            accessibilityHint="Archiver cet élément"
          >
            <Ionicons name="archive" size={20} color={Colors.background.white} />
            <Text style={styles.archiveText}>Archiver</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  } : undefined;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      rightThreshold={swipeThreshold}
      leftThreshold={swipeThreshold}
      friction={2}
      overshootFriction={8}
      containerStyle={[styles.swipeableContainer, containerStyle]}
      enableTrackpadTwoFingerGesture={Platform.OS === 'ios'}
      childrenContainerStyle={styles.swipeableChild}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  swipeableContainer: {
    // Default container style
  },
  swipeableChild: {
    backgroundColor: Colors.background.white,
  },
  // Right actions (delete)
  rightActions: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  deleteAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  deleteText: {
    color: Colors.background.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  // Left actions (archive)
  leftActions: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1', // Indigo color for archive
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  archiveAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  archiveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  archiveText: {
    color: Colors.background.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});