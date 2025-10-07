/**
 * FolderTree Component
 * Displays folder hierarchy with nested indentation
 * Expand/collapse animation, tap to navigate, long-press menu
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Folder } from '../../types/folder';
import { FolderItem } from './FolderItem';

interface FolderTreeProps {
  folders: Folder[];
  onFolderPress: (folder: Folder) => void;
  onFolderLongPress?: (folder: Folder) => void;
  selectedFolderId?: string;
  darkMode?: boolean;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  onFolderPress,
  onFolderLongPress,
  selectedFolderId,
  darkMode = false,
}) => {
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());

  const toggleExpand = (folderId: string) => {
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolderIds.has(folder.id);
    const hasSubFolders = folder.subFolderIds && folder.subFolderIds.length > 0;
    const subFolders = folders.filter((f) => folder.subFolderIds.includes(f.id));
    const isSelected = selectedFolderId === folder.id;

    return (
      <View key={folder.id}>
        <FolderItem
          folder={folder}
          level={level}
          isExpanded={isExpanded}
          isSelected={isSelected}
          hasSubFolders={hasSubFolders}
          onPress={() => onFolderPress(folder)}
          onLongPress={() => onFolderLongPress?.(folder)}
          onToggleExpand={() => toggleExpand(folder.id)}
          darkMode={darkMode}
        />

        {/* Render subfolders if expanded */}
        {isExpanded && hasSubFolders && (
          <View>
            {subFolders.map((subFolder) => renderFolder(subFolder, level + 1))}
          </View>
        )}
      </View>
    );
  };

  // Get root folders (no parent)
  const rootFolders = folders.filter((f) => !f.parentFolderId);

  return (
    <ScrollView
      style={[styles.container, darkMode && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      {rootFolders.map((folder) => renderFolder(folder))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
});
