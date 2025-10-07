/**
 * Tests for FoldersContext
 * Coverage: folder CRUD operations, context state management
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { FoldersProvider, useFoldersContext } from '../FoldersContext';
import { FolderStorage } from '../../services/folderStorage';
import { Folder } from '../../types/folder';

jest.mock('../../services/folderStorage');

const MockedFolderStorage = FolderStorage as jest.Mocked<typeof FolderStorage>;

describe('FoldersContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FoldersProvider>{children}</FoldersProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    MockedFolderStorage.loadFolders.mockResolvedValue([]);
  });

  describe('createFolder', () => {
    it('should create a root folder successfully', async () => {
      const newFolder: Folder = {
        id: 'folder-1',
        name: 'Test Folder',
        items: [],
        subFolderIds: [],
        settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MockedFolderStorage.createFolder.mockResolvedValue(newFolder);

      const { result } = renderHook(() => useFoldersContext(), { wrapper });

      await act(async () => {
        await result.current.createFolder('Test Folder');
      });

      expect(MockedFolderStorage.createFolder).toHaveBeenCalledWith('Test Folder', undefined);
    });

    it('should create a subfolder with parent ID', async () => {
      const parentFolder: Folder = {
        id: 'parent-1',
        name: 'Parent',
        items: [],
        subFolderIds: [],
        settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const childFolder: Folder = {
        id: 'child-1',
        name: 'Child',
        parentFolderId: 'parent-1',
        items: [],
        subFolderIds: [],
        settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MockedFolderStorage.loadFolders.mockResolvedValue([parentFolder]);
      MockedFolderStorage.createFolder.mockResolvedValue(childFolder);

      const { result } = renderHook(() => useFoldersContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.folders).toHaveLength(1);
      });

      await act(async () => {
        await result.current.createFolder('Child', 'parent-1');
      });

      expect(MockedFolderStorage.createFolder).toHaveBeenCalledWith('Child', 'parent-1');
    });
  });

  describe('deleteFolder', () => {
    it('should delete a folder successfully', async () => {
      const folder: Folder = {
        id: 'folder-1',
        name: 'To Delete',
        items: [],
        subFolderIds: [],
        settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MockedFolderStorage.loadFolders.mockResolvedValue([folder]);
      MockedFolderStorage.deleteFolder.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFoldersContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.folders).toHaveLength(1);
      });

      await act(async () => {
        await result.current.deleteFolder('folder-1');
      });

      expect(MockedFolderStorage.deleteFolder).toHaveBeenCalledWith('folder-1');
    });

    it('should handle delete errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      MockedFolderStorage.deleteFolder.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useFoldersContext(), { wrapper });

      await act(async () => {
        await result.current.deleteFolder('folder-1');
      });

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('getFolderPath', () => {
    it('should return correct path for nested folder', async () => {
      const grandparent: Folder = {
        id: 'gp-1',
        name: 'Grandparent',
        items: [],
        subFolderIds: ['p-1'],
        settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parent: Folder = {
        id: 'p-1',
        name: 'Parent',
        parentFolderId: 'gp-1',
        items: [],
        subFolderIds: ['c-1'],
        settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const child: Folder = {
        id: 'c-1',
        name: 'Child',
        parentFolderId: 'p-1',
        items: [],
        subFolderIds: [],
        settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MockedFolderStorage.loadFolders.mockResolvedValue([grandparent, parent, child]);

      const { result } = renderHook(() => useFoldersContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.folders).toHaveLength(3);
      });

      const path = result.current.getFolderPath('c-1');
      expect(path).toEqual(['Grandparent', 'Parent', 'Child']);
    });

    it('should return single-item path for root folder', async () => {
      const folder: Folder = {
        id: 'f-1',
        name: 'Root',
        items: [],
        subFolderIds: [],
        settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MockedFolderStorage.loadFolders.mockResolvedValue([folder]);

      const { result } = renderHook(() => useFoldersContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.folders).toHaveLength(1);
      });

      const path = result.current.getFolderPath('f-1');
      expect(path).toEqual(['Root']);
    });
  });
});
