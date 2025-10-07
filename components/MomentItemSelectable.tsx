/**
 * MomentItemSelectable Component
 * Moment item with checkbox for selection mode
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SwipeableMomentItem } from './SwipeableMomentItem';
import { CapturedMoment } from '../types/moment';
import { Colors } from '../constants/Colors';

interface MomentItemSelectableProps {
  moment: CapturedMoment;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onPlay: () => void;
  onDelete: () => void;
  showNewBadge?: boolean;
}

export const MomentItemSelectable: React.FC<MomentItemSelectableProps> = ({
  moment,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  onPlay,
  onDelete,
  showNewBadge = false,
}) => {
  const handlePress = () => {
    if (isSelectionMode) {
      onToggleSelect();
    } else {
      onPlay();
    }
  };

  return (
    <View style={styles.container}>
      {isSelectionMode && (
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={onToggleSelect}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && (
              <Ionicons name="checkmark" size={18} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
      )}

      <View style={[styles.itemContainer, isSelectionMode && styles.itemContainerSelection]}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={handlePress}
          activeOpacity={isSelectionMode ? 0.7 : 1}
        >
          <SwipeableMomentItem
            moment={moment}
            onPlay={onPlay}
            onDelete={onDelete}
            showNewBadge={showNewBadge}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.white,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  itemContainer: {
    flex: 1,
  },
  itemContainerSelection: {
    opacity: 0.9,
  },
  touchable: {
    flex: 1,
  },
});
