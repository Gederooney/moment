/**
 * FolderItem Component
 * Individual folder item with icon, name, count badge, and expand/collapse chevron
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Folder } from '../../types/folder';

interface FolderItemProps {
  folder: Folder;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasSubFolders: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onToggleExpand: () => void;
  darkMode?: boolean;
}

export const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  level,
  isExpanded,
  isSelected,
  hasSubFolders,
  onPress,
  onLongPress,
  onToggleExpand,
  darkMode = false,
}) => {
  const indentWidth = level * 20;
  const itemCount = folder.items.length + (folder.subFolderIds?.length || 0);

  // Chevron rotation animation
  const rotateAnim = React.useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        { marginLeft: indentWidth },
        isSelected && styles.selected,
        isSelected && darkMode && styles.selectedDark,
        darkMode && styles.containerDark,
      ]}
      activeOpacity={0.7}
    >
      {/* Expand/Collapse Chevron */}
      {hasSubFolders && (
        <TouchableOpacity onPress={onToggleExpand} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Animated.Text
            style={[
              styles.chevron,
              darkMode && styles.chevronDark,
              { transform: [{ rotate: chevronRotation }] },
            ]}
          >
            ›
          </Animated.Text>
        </TouchableOpacity>
      )}

      {/* Folder Icon */}
      <Text style={[styles.icon, darkMode && styles.iconDark]}>
        📁
      </Text>

      {/* Folder Name */}
      <Text
        style={[styles.name, darkMode && styles.nameDark]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {folder.name}
      </Text>

      {/* Item Count Badge */}
      {itemCount > 0 && (
        <View style={[styles.badge, darkMode && styles.badgeDark]}>
          <Text style={[styles.badgeText, darkMode && styles.badgeTextDark]}>
            {itemCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
    borderBottomColor: '#2a2a2a',
  },
  selected: {
    backgroundColor: '#e3f2fd',
  },
  selectedDark: {
    backgroundColor: '#1e3a5f',
  },
  chevron: {
    fontSize: 20,
    color: '#666',
    marginRight: 4,
    fontWeight: 'bold',
  },
  chevronDark: {
    color: '#999',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  iconDark: {
    opacity: 0.9,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  nameDark: {
    color: '#e0e0e0',
  },
  badge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeDark: {
    backgroundColor: '#404040',
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  badgeTextDark: {
    color: '#999',
  },
});
