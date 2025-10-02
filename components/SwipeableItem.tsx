import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
} from 'react-native';
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

function createDeleteInterpolation(
  progress: Animated.AnimatedInterpolation<number>
) {
  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return { opacity };
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
  children,
  onDelete,
  onArchive,
  deleteConfirmTitle,
  deleteConfirmMessage,
  containerStyle,
  showArchiveAction = false,
  swipeThreshold = 80,
}) => {
  const { swipeableRef, handleDelete } = useSwipeActions({
    onDelete,
    onArchive,
    deleteConfirmTitle,
    deleteConfirmMessage,
  });

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const { opacity } = createDeleteInterpolation(progress);

    return (
      <Animated.View
        style={[
          styles.rightActions,
          {
            opacity,
          },
        ]}
      />
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={swipeThreshold}
      friction={2}
      overshootRight={false}
      onSwipeableWillOpen={() => handleDelete()}
      containerStyle={[styles.swipeableContainer, containerStyle]}
      enableTrackpadTwoFingerGesture={Platform.OS === 'ios'}
      childrenContainerStyle={styles.swipeableChild}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  swipeableContainer: {},
  swipeableChild: {
    backgroundColor: Colors.background.white,
  },
  rightActions: {
    flex: 1,
    backgroundColor: Colors.error,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
});
