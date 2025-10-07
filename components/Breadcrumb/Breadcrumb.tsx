/**
 * Breadcrumb Component
 * Displays folder path as clickable breadcrumb trail
 * Truncates long paths, horizontal scroll support
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface BreadcrumbProps {
  path: string[]; // Array of folder names from root to current
  onNavigate: (index: number) => void; // Navigate to folder at index
  maxLength?: number; // Max characters before truncation
  darkMode?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  path,
  onNavigate,
  maxLength = 30,
  darkMode = false,
}) => {
  const truncatePath = (fullPath: string[], max: number): string[] => {
    const totalLength = fullPath.join(' / ').length;
    if (totalLength <= max) return fullPath;

    // Keep first and last, truncate middle
    if (fullPath.length > 3) {
      return [fullPath[0], '...', fullPath[fullPath.length - 1]];
    }

    // Truncate individual parts
    return fullPath.map((part) => {
      if (part.length > 15) {
        return part.substring(0, 12) + '...';
      }
      return part;
    });
  };

  const displayPath = truncatePath(path, maxLength);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, darkMode && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      {displayPath.map((item, index) => {
        const isLast = index === displayPath.length - 1;
        const isEllipsis = item === '...';
        const originalIndex = isEllipsis ? -1 : (item === path[0] ? 0 : path.indexOf(item));

        return (
          <View key={`${item}-${index}`} style={styles.itemWrapper}>
            {!isEllipsis ? (
              <TouchableOpacity
                onPress={() => originalIndex >= 0 && onNavigate(originalIndex)}
                disabled={isLast || originalIndex < 0}
              >
                <Text
                  style={[
                    styles.item,
                    darkMode && styles.itemDark,
                    isLast && styles.itemLast,
                    isLast && darkMode && styles.itemLastDark,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.ellipsis, darkMode && styles.ellipsisDark]}>
                {item}
              </Text>
            )}

            {!isLast && (
              <Text style={[styles.separator, darkMode && styles.separatorDark]}>
                /
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
  },
  containerDark: {
    backgroundColor: '#2a2a2a',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  itemDark: {
    color: '#64b5f6',
  },
  itemLast: {
    color: '#333',
    fontWeight: '600',
  },
  itemLastDark: {
    color: '#e0e0e0',
  },
  ellipsis: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  ellipsisDark: {
    color: '#666',
  },
  separator: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 8,
  },
  separatorDark: {
    color: '#666',
  },
});
