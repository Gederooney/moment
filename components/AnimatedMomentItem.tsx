import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { MomentHistoryItem } from './MomentHistoryItem';
import { CapturedMoment } from '../types/moment';

interface AnimatedMomentItemProps {
  moment: CapturedMoment;
  onPlay: () => void;
  onDelete: () => void;
  showNewBadge?: boolean;
  isNew?: boolean;
}

export const AnimatedMomentItem: React.FC<AnimatedMomentItemProps> = ({
  moment,
  onPlay,
  onDelete,
  showNewBadge = false,
  isNew = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(isNew ? -50 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(isNew ? 0.8 : 1)).current;

  useEffect(() => {
    if (isNew) {
      // Animate new moment appearing
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNew, fadeAnim, slideAnim, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <MomentHistoryItem
        moment={moment}
        onPlay={onPlay}
        onDelete={onDelete}
        showNewBadge={showNewBadge}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    // No additional styles needed, just a wrapper for animation
  },
});