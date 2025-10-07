/**
 * Tests for FolderTree component
 * Coverage: folder rendering, expand/collapse, nested hierarchy
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FolderTree } from '../FolderTree';
import { Folder } from '../../../types/folder';

describe('FolderTree', () => {
  const mockFolders: Folder[] = [
    {
      id: 'root-1',
      name: 'Root Folder',
      items: [],
      subFolderIds: ['child-1'],
      settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'child-1',
      name: 'Child Folder',
      parentFolderId: 'root-1',
      items: ['moment-1'],
      subFolderIds: [],
      settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'root-2',
      name: 'Another Root',
      items: [],
      subFolderIds: [],
      settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockOnFolderPress = jest.fn();
  const mockOnFolderLongPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all root folders', () => {
    const { getByText } = render(
      <FolderTree
        folders={mockFolders}
        onFolderPress={mockOnFolderPress}
        onFolderLongPress={mockOnFolderLongPress}
      />
    );

    expect(getByText('Root Folder')).toBeTruthy();
    expect(getByText('Another Root')).toBeTruthy();
  });

  it('should expand and show subfolders when folder is pressed', () => {
    const { getByText, queryByText } = render(
      <FolderTree
        folders={mockFolders}
        onFolderPress={mockOnFolderPress}
        onFolderLongPress={mockOnFolderLongPress}
      />
    );

    // Child should not be visible initially
    expect(queryByText('Child Folder')).toBeNull();

    // Press the root folder to expand
    const rootFolder = getByText('Root Folder');
    fireEvent.press(rootFolder);

    // Child should now be visible
    expect(getByText('Child Folder')).toBeTruthy();
  });

  it('should display item count badge for folders with items', () => {
    const { getByText } = render(
      <FolderTree
        folders={mockFolders}
        onFolderPress={mockOnFolderPress}
        onFolderLongPress={mockOnFolderLongPress}
      />
    );

    // Expand to show child folder
    fireEvent.press(getByText('Root Folder'));

    // Child folder has 1 item, should show badge
    expect(getByText('1')).toBeTruthy();
  });
});
