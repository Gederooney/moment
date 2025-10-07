/**
 * Tests for useFolders hook
 * Coverage: hook initialization, state management
 */

import { renderHook } from '@testing-library/react-native';
import { useFolders } from '../useFolders';
import * as FoldersContext from '../../contexts/FoldersContext';
import { Folder } from '../../types/folder';

describe('useFolders', () => {
  const mockFolders: Folder[] = [
    {
      id: 'folder-1',
      name: 'Test Folder',
      items: [],
      subFolderIds: [],
      settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockContextValue = {
    folders: mockFolders,
    currentFolder: null,
    isLoading: false,
    createFolder: jest.fn(),
    deleteFolder: jest.fn(),
    updateFolder: jest.fn(),
    moveFolder: jest.fn(),
    setCurrentFolder: jest.fn(),
    getFolderPath: jest.fn(),
    addItemToFolder: jest.fn(),
    removeItemFromFolder: jest.fn(),
    refreshFolders: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(FoldersContext, 'useFoldersContext').mockReturnValue(mockContextValue);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return folders context values', () => {
    const { result } = renderHook(() => useFolders());

    expect(result.current.folders).toEqual(mockFolders);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentFolder).toBeNull();
  });

  it('should provide all context methods', () => {
    const { result } = renderHook(() => useFolders());

    expect(result.current.createFolder).toBeDefined();
    expect(result.current.deleteFolder).toBeDefined();
    expect(result.current.updateFolder).toBeDefined();
    expect(result.current.setCurrentFolder).toBeDefined();
    expect(result.current.getFolderPath).toBeDefined();
    expect(result.current.refreshFolders).toBeDefined();
  });
});
