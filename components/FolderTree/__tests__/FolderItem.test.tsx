/**
 * Tests for FolderItem component
 * Coverage: folder item rendering, interactions, animations
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FolderItem } from '../FolderItem';
import { Folder } from '../../../types/folder';

describe('FolderItem', () => {
  const mockFolder: Folder = {
    id: 'folder-1',
    name: 'Test Folder',
    items: ['item-1', 'item-2'],
    subFolderIds: ['child-1'],
    settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnPress = jest.fn();
  const mockOnLongPress = jest.fn();
  const mockOnToggleExpand = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render folder with correct name and item count', () => {
    const { getByText } = render(
      <FolderItem
        folder={mockFolder}
        hasSubFolders={true}
        isExpanded={false}
        isSelected={false}
        level={0}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
        onToggleExpand={mockOnToggleExpand}
      />
    );

    expect(getByText('Test Folder')).toBeTruthy();
    expect(getByText('2')).toBeTruthy(); // Item count badge
  });

  it('should call onLongPress when folder is long pressed', () => {
    const { getByText } = render(
      <FolderItem
        folder={mockFolder}
        hasSubFolders={true}
        isExpanded={false}
        isSelected={false}
        level={0}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
        onToggleExpand={mockOnToggleExpand}
      />
    );

    const folderItem = getByText('Test Folder');
    fireEvent(folderItem, 'longPress');

    expect(mockOnLongPress).toHaveBeenCalledWith(mockFolder);
  });
});
