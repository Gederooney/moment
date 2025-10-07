/**
 * Tests for folderStorage
 * Coverage: nested folders, CRUD operations, hierarchy management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FolderStorage } from '../folderStorage';
import { Folder } from '../../types/folder';
import { STORAGE_KEYS } from '../../utils/storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('FolderStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleRootFolder: Folder = {
    id: 'folder-1',
    name: 'My Folder',
    description: 'Test folder',
    items: [],
    subFolderIds: [],
    settings: {
      sortBy: 'dateAdded',
      sortOrder: 'desc',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const sampleChildFolder: Folder = {
    id: 'folder-2',
    name: 'Child Folder',
    parentFolderId: 'folder-1',
    items: [],
    subFolderIds: [],
    settings: {
      sortBy: 'name',
      sortOrder: 'asc',
    },
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  };

  describe('saveFolders and loadFolders', () => {
    it('should save and load folders with nested structure', async () => {
      const folders = [sampleRootFolder, sampleChildFolder];

      await FolderStorage.saveFolders(folders);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.FOLDERS,
        expect.any(String)
      );

      // Now test loading
      const serialized = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serialized);

      const loaded = await FolderStorage.loadFolders();

      expect(loaded).toHaveLength(2);
      expect(loaded[0].id).toBe('folder-1');
      expect(loaded[1].parentFolderId).toBe('folder-1');
    });

    it('should return empty array if no folders stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const folders = await FolderStorage.loadFolders();

      expect(folders).toEqual([]);
    });
  });

  describe('addFolder', () => {
    it('should add folder and update parent subFolderIds', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([
          { ...sampleRootFolder, createdAt: sampleRootFolder.createdAt.toISOString(), updatedAt: sampleRootFolder.updatedAt.toISOString() },
        ])
      );

      await FolderStorage.addFolder(sampleChildFolder);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      const parentFolder = parsedData.find((f: Folder) => f.id === 'folder-1');
      expect(parentFolder.subFolderIds).toContain('folder-2');
    });
  });

  describe('deleteFolder', () => {
    it('should cascade delete folder and all children', async () => {
      const grandChildFolder: Folder = {
        ...sampleChildFolder,
        id: 'folder-3',
        parentFolderId: 'folder-2',
      };

      // Setup proper hierarchy with subFolderIds
      const rootFolder = { ...sampleRootFolder, subFolderIds: ['folder-2'] };
      const childFolder = { ...sampleChildFolder, subFolderIds: ['folder-3'] };

      const folders = [rootFolder, childFolder, grandChildFolder];
      const serialized = JSON.stringify(
        folders.map((f) => ({
          ...f,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        }))
      );

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serialized);

      // Delete parent folder (should delete child and grandchild)
      await FolderStorage.deleteFolder('folder-2');

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData.find((f: Folder) => f.id === 'folder-2')).toBeUndefined();
      expect(parsedData.find((f: Folder) => f.id === 'folder-3')).toBeUndefined();
      expect(parsedData.find((f: Folder) => f.id === 'folder-1')).toBeDefined();
    });
  });

  describe('moveFolderToParent', () => {
    it('should move folder to new parent', async () => {
      const newParent: Folder = {
        ...sampleRootFolder,
        id: 'folder-new',
        name: 'New Parent',
      };

      const folders = [sampleRootFolder, sampleChildFolder, newParent];
      const serialized = JSON.stringify(
        folders.map((f) => ({
          ...f,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        }))
      );

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serialized);

      await FolderStorage.moveFolderToParent('folder-2', 'folder-new');

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      const movedFolder = parsedData.find((f: Folder) => f.id === 'folder-2');
      expect(movedFolder.parentFolderId).toBe('folder-new');

      const oldParent = parsedData.find((f: Folder) => f.id === 'folder-1');
      expect(oldParent.subFolderIds).not.toContain('folder-2');

      const newParentData = parsedData.find((f: Folder) => f.id === 'folder-new');
      expect(newParentData.subFolderIds).toContain('folder-2');
    });

    it('should prevent moving folder into itself', async () => {
      const serialized = JSON.stringify([
        {
          ...sampleRootFolder,
          createdAt: sampleRootFolder.createdAt.toISOString(),
          updatedAt: sampleRootFolder.updatedAt.toISOString(),
        },
      ]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serialized);

      await expect(
        FolderStorage.moveFolderToParent('folder-1', 'folder-1')
      ).rejects.toThrow();
    });

    it('should prevent moving folder into its descendants', async () => {
      // Setup proper hierarchy: folder-1 (root) contains folder-2 (child)
      const rootFolder = { ...sampleRootFolder, subFolderIds: ['folder-2'] };
      const childFolder = { ...sampleChildFolder };

      const folders = [rootFolder, childFolder];
      const serialized = JSON.stringify(
        folders.map((f) => ({
          ...f,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        }))
      );

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serialized);

      // Try to move parent into child
      await expect(
        FolderStorage.moveFolderToParent('folder-1', 'folder-2')
      ).rejects.toThrow();
    });
  });

  describe('getRootFolders', () => {
    it('should return only folders without parent', async () => {
      const folders = [sampleRootFolder, sampleChildFolder];
      const serialized = JSON.stringify(
        folders.map((f) => ({
          ...f,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        }))
      );

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serialized);

      const rootFolders = await FolderStorage.getRootFolders();

      expect(rootFolders).toHaveLength(1);
      expect(rootFolders[0].id).toBe('folder-1');
    });
  });

  describe('getFolderPath', () => {
    it('should return breadcrumb path for nested folder', async () => {
      const grandChildFolder: Folder = {
        ...sampleChildFolder,
        id: 'folder-3',
        name: 'Grandchild',
        parentFolderId: 'folder-2',
      };

      const folders = [
        { ...sampleRootFolder, subFolderIds: ['folder-2'] },
        { ...sampleChildFolder, subFolderIds: ['folder-3'] },
        grandChildFolder,
      ];

      const serialized = JSON.stringify(
        folders.map((f) => ({
          ...f,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        }))
      );

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serialized);

      const path = await FolderStorage.getFolderPath('folder-3');

      expect(path).toEqual(['My Folder', 'Child Folder', 'Grandchild']);
    });
  });
});
