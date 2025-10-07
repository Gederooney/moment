/**
 * FoldersContext
 * Manages folder hierarchy for organizing videos and moments
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Folder, FolderItem, FolderSettings } from '../types/folder';
import { FolderStorage } from '../services/folderStorage';
import { generateId } from '../utils/idGenerator';

interface FoldersContextType {
  folders: Folder[];
  currentFolder: Folder | null;
  isLoading: boolean;
  createFolder: (name: string, parentId?: string, description?: string) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  addItemToFolder: (folderId: string, item: FolderItem) => Promise<void>;
  addMomentToFolder: (folderId: string, momentId: string) => Promise<void>;
  removeItemFromFolder: (folderId: string, itemId: string) => Promise<void>;
  moveFolder: (folderId: string, newParentId?: string) => Promise<void>;
  getFolderPath: (folderId: string) => string[];
  setCurrentFolder: (folder: Folder | null) => void;
  getRootFolders: () => Folder[];
  getSubFolders: (parentId: string) => Folder[];
  getFolderById: (folderId: string) => Folder | undefined;
  updateFolderSettings: (folderId: string, settings: Partial<FolderSettings>) => Promise<void>;
  refreshFolders: () => Promise<void>;
}

const FoldersContext = createContext<FoldersContextType | undefined>(undefined);

interface FoldersProviderProps {
  children: React.ReactNode;
}

export function FoldersProvider({ children }: FoldersProviderProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load folders on mount
  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedFolders = await FolderStorage.loadFolders();
      setFolders(loadedFolders);
    } catch (error) {
      console.error('[FoldersContext] Error loading folders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFolder = useCallback(
    async (name: string, parentId?: string, description?: string): Promise<Folder> => {
      try {
        const newFolder: Folder = {
          id: generateId(),
          name,
          description,
          parentFolderId: parentId,
          items: [],
          subFolderIds: [],
          settings: {
            sortBy: 'dateAdded',
            sortOrder: 'desc',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log('[FoldersContext] Creating folder:', newFolder);
        await FolderStorage.addFolder(newFolder);
        console.log('[FoldersContext] Folder created, reloading...');
        await loadFolders();
        console.log('[FoldersContext] Folders reloaded');
        return newFolder;
      } catch (error) {
        console.error('[FoldersContext] Error creating folder:', error);
        throw error;
      }
    },
    [loadFolders]
  );

  const deleteFolder = useCallback(
    async (id: string) => {
      await FolderStorage.deleteFolder(id);
      await loadFolders();

      // Clear current folder if deleted
      if (currentFolder?.id === id) {
        setCurrentFolder(null);
      }
    },
    [loadFolders, currentFolder]
  );

  const addItemToFolder = useCallback(
    async (folderId: string, item: FolderItem) => {
      await FolderStorage.addItemToFolder(folderId, item);
      await loadFolders();
    },
    [loadFolders]
  );

  // Helper function to add a moment to a folder
  const addMomentToFolder = useCallback(
    async (folderId: string, momentId: string) => {
      const folderItem: FolderItem = {
        id: generateId(),
        type: 'screen_recording_moment',
        itemId: momentId,
        addedAt: new Date(),
      };
      await addItemToFolder(folderId, folderItem);
    },
    [addItemToFolder]
  );

  const removeItemFromFolder = useCallback(
    async (folderId: string, itemId: string) => {
      await FolderStorage.removeItemFromFolder(folderId, itemId);
      await loadFolders();
    },
    [loadFolders]
  );

  const moveFolder = useCallback(
    async (folderId: string, newParentId?: string) => {
      await FolderStorage.moveFolderToParent(folderId, newParentId);
      await loadFolders();
    },
    [loadFolders]
  );

  const getFolderPath = useCallback(
    (folderId: string): string[] => {
      const path: string[] = [];
      let currentId: string | undefined = folderId;

      while (currentId) {
        const folder = folders.find((f) => f.id === currentId);
        if (!folder) break;

        path.unshift(folder.name);
        currentId = folder.parentFolderId;
      }

      return path;
    },
    [folders]
  );

  const getRootFolders = useCallback(() => {
    return folders.filter((f) => !f.parentFolderId);
  }, [folders]);

  const getSubFolders = useCallback(
    (parentId: string) => {
      return folders.filter((f) => f.parentFolderId === parentId);
    },
    [folders]
  );

  const getFolderById = useCallback(
    (folderId: string) => {
      return folders.find((f) => f.id === folderId);
    },
    [folders]
  );

  const updateFolderSettings = useCallback(
    async (folderId: string, settings: Partial<FolderSettings>) => {
      await FolderStorage.updateFolderSettings(folderId, settings);
      await loadFolders();
    },
    [loadFolders]
  );

  const value: FoldersContextType = {
    folders,
    currentFolder,
    isLoading,
    createFolder,
    deleteFolder,
    addItemToFolder,
    addMomentToFolder,
    removeItemFromFolder,
    moveFolder,
    getFolderPath,
    setCurrentFolder,
    getRootFolders,
    getSubFolders,
    getFolderById,
    updateFolderSettings,
    refreshFolders: loadFolders,
  };

  return <FoldersContext.Provider value={value}>{children}</FoldersContext.Provider>;
}

export function useFolders(): FoldersContextType {
  const context = useContext(FoldersContext);
  if (!context) {
    throw new Error('useFolders must be used within FoldersProvider');
  }
  return context;
}
