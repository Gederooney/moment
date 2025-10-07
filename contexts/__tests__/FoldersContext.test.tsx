/**
 * Tests for FoldersContext
 * Coverage: folder CRUD operations, context state management
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { FoldersProvider, useFolders } from '../FoldersContext';
import * as FolderStorage from '../../services/folderStorage';
import { Folder } from '../../types/folder';

jest.mock('../../services/folderStorage', () => ({
  FolderStorage: {
    loadFolders: jest.fn(),
    saveFolders: jest.fn(),
    addFolder: jest.fn(),
    deleteFolder: jest.fn(),
    getFolderById: jest.fn(),
    moveFolderToParent: jest.fn(),
  },
}));

jest.mock('nanoid', () => ({
  nanoid: () => 'test-id-123',
}));

const MockedFolderStorage = FolderStorage.FolderStorage as jest.Mocked<typeof FolderStorage.FolderStorage>;

describe('FoldersContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FoldersProvider>{children}</FoldersProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    MockedFolderStorage.loadFolders.mockResolvedValue([]);
    MockedFolderStorage.addFolder.mockResolvedValue(undefined);
    MockedFolderStorage.saveFolders.mockResolvedValue(undefined);
    MockedFolderStorage.deleteFolder.mockResolvedValue(undefined);
  });

  describe('initial state', () => {
    it('should load folders on mount', async () => {
      const folders: Folder[] = [
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

      MockedFolderStorage.loadFolders.mockResolvedValue(folders);

      const { result } = renderHook(() => useFolders(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.folders).toEqual(folders);
      expect(MockedFolderStorage.loadFolders).toHaveBeenCalled();
    });
  });

  describe('createFolder', () => {
    it('should create a folder and refresh', async () => {
      const { result } = renderHook(() => useFolders(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createFolder('New Folder');
      });

      expect(MockedFolderStorage.addFolder).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id-123',
          name: 'New Folder',
        })
      );
      expect(MockedFolderStorage.loadFolders).toHaveBeenCalled();
    });
  });

  describe('deleteFolder', () => {
    it('should delete a folder and refresh', async () => {
      const { result } = renderHook(() => useFolders(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteFolder('folder-1');
      });

      expect(MockedFolderStorage.deleteFolder).toHaveBeenCalledWith('folder-1');
      expect(MockedFolderStorage.loadFolders).toHaveBeenCalled();
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

      const { result } = renderHook(() => useFolders(), { wrapper });

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

      const { result } = renderHook(() => useFolders(), { wrapper });

      await waitFor(() => {
        expect(result.current.folders).toHaveLength(1);
      });

      const path = result.current.getFolderPath('f-1');
      expect(path).toEqual(['Root']);
    });
  });

  describe('getRootFolders', () => {
    it('should return only folders without parentFolderId', async () => {
      const rootFolder: Folder = {
        id: 'root-1',
        name: 'Root',
        items: [],
        subFolderIds: [],
        settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const childFolder: Folder = {
        id: 'child-1',
        name: 'Child',
        parentFolderId: 'root-1',
        items: [],
        subFolderIds: [],
        settings: { sortBy: 'dateAdded', sortOrder: 'desc' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MockedFolderStorage.loadFolders.mockResolvedValue([rootFolder, childFolder]);

      const { result } = renderHook(() => useFolders(), { wrapper });

      await waitFor(() => {
        expect(result.current.folders).toHaveLength(2);
      });

      const roots = result.current.getRootFolders();
      expect(roots).toHaveLength(1);
      expect(roots[0].id).toBe('root-1');
    });
  });
});
