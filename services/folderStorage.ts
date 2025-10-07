/**
 * Storage service for folders (hierarchical organization)
 * Similar pattern to playlistStorage.ts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Folder, FolderItem, FolderSettings } from '../types/folder';
import { STORAGE_KEYS } from '../utils/storage';

export class FolderStorage {
  /**
   * Save folders to AsyncStorage
   */
  static async saveFolders(folders: Folder[]): Promise<void> {
    try {
      const serializedFolders = folders.map((folder) => ({
        ...folder,
        createdAt: folder.createdAt.toISOString(),
        updatedAt: folder.updatedAt.toISOString(),
        items: folder.items.map((item) => ({
          ...item,
          addedAt: item.addedAt.toISOString(),
        })),
      }));

      await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(serializedFolders));
    } catch (error) {
      console.error('[FolderStorage] Error saving folders:', error);
      throw new Error('Failed to save folders');
    }
  }

  /**
   * Load folders from AsyncStorage
   */
  static async loadFolders(): Promise<Folder[]> {
    try {
      const foldersData = await AsyncStorage.getItem(STORAGE_KEYS.FOLDERS);

      if (!foldersData) {
        return [];
      }

      const parsedFolders = JSON.parse(foldersData);

      if (!Array.isArray(parsedFolders)) {
        console.error('[FolderStorage] Folders data is not an array');
        return [];
      }

      // Deserialize dates
      return parsedFolders.map((folder: any) => ({
        ...folder,
        createdAt: new Date(folder.createdAt),
        updatedAt: new Date(folder.updatedAt),
        items: folder.items.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        })),
      }));
    } catch (error) {
      console.error('[FolderStorage] Error loading folders:', error);
      return [];
    }
  }

  /**
   * Get folder by ID
   */
  static async getFolderById(folderId: string): Promise<Folder | null> {
    try {
      const folders = await this.loadFolders();
      return folders.find((f) => f.id === folderId) || null;
    } catch (error) {
      console.error('[FolderStorage] Error getting folder by ID:', error);
      return null;
    }
  }

  /**
   * Add a new folder
   */
  static async addFolder(folder: Folder): Promise<void> {
    try {
      const folders = await this.loadFolders();

      // If folder has a parent, add this folder ID to parent's subFolderIds
      if (folder.parentFolderId) {
        const parentFolder = folders.find((f) => f.id === folder.parentFolderId);
        if (parentFolder) {
          if (!parentFolder.subFolderIds.includes(folder.id)) {
            parentFolder.subFolderIds.push(folder.id);
          }
        } else {
          console.warn(`[FolderStorage] Parent folder ${folder.parentFolderId} not found`);
        }
      }

      folders.push(folder);
      await this.saveFolders(folders);
    } catch (error) {
      console.error('[FolderStorage] Error adding folder:', error);
      throw new Error('Failed to add folder');
    }
  }

  /**
   * Update folder
   */
  static async updateFolder(folderId: string, updates: Partial<Folder>): Promise<void> {
    try {
      const folders = await this.loadFolders();
      const index = folders.findIndex((f) => f.id === folderId);

      if (index === -1) {
        throw new Error(`Folder with ID ${folderId} not found`);
      }

      folders[index] = {
        ...folders[index],
        ...updates,
        id: folderId, // Ensure ID doesn't change
        updatedAt: new Date(),
      };

      await this.saveFolders(folders);
    } catch (error) {
      console.error('[FolderStorage] Error updating folder:', error);
      throw new Error('Failed to update folder');
    }
  }

  /**
   * Delete folder
   * Cascade delete: deletes folder and all its children
   */
  static async deleteFolder(folderId: string): Promise<void> {
    try {
      const folders = await this.loadFolders();
      const folderToDelete = folders.find((f) => f.id === folderId);

      if (!folderToDelete) {
        console.warn(`[FolderStorage] Folder ${folderId} not found, nothing to delete`);
        return;
      }

      // Get all descendant folder IDs (recursive)
      const descendantIds = this.getDescendantFolderIds(folderId, folders);
      const idsToDelete = [folderId, ...descendantIds];

      // Remove all folders to delete
      const updatedFolders = folders.filter((f) => !idsToDelete.includes(f.id));

      // Remove deleted folder from parent's subFolderIds
      if (folderToDelete.parentFolderId) {
        const parentFolder = updatedFolders.find((f) => f.id === folderToDelete.parentFolderId);
        if (parentFolder) {
          parentFolder.subFolderIds = parentFolder.subFolderIds.filter((id) => id !== folderId);
        }
      }

      await this.saveFolders(updatedFolders);
    } catch (error) {
      console.error('[FolderStorage] Error deleting folder:', error);
      throw new Error('Failed to delete folder');
    }
  }

  /**
   * Move folder to a new parent
   */
  static async moveFolderToParent(folderId: string, newParentId?: string): Promise<void> {
    try {
      const folders = await this.loadFolders();
      const folderToMove = folders.find((f) => f.id === folderId);

      if (!folderToMove) {
        throw new Error(`Folder ${folderId} not found`);
      }

      // Prevent moving folder into itself or its descendants
      if (newParentId) {
        const descendantIds = this.getDescendantFolderIds(folderId, folders);
        if (folderId === newParentId || descendantIds.includes(newParentId)) {
          throw new Error('Cannot move folder into itself or its descendants');
        }
      }

      const oldParentId = folderToMove.parentFolderId;

      // Remove from old parent's subFolderIds
      if (oldParentId) {
        const oldParent = folders.find((f) => f.id === oldParentId);
        if (oldParent) {
          oldParent.subFolderIds = oldParent.subFolderIds.filter((id) => id !== folderId);
        }
      }

      // Add to new parent's subFolderIds
      if (newParentId) {
        const newParent = folders.find((f) => f.id === newParentId);
        if (!newParent) {
          throw new Error(`New parent folder ${newParentId} not found`);
        }
        if (!newParent.subFolderIds.includes(folderId)) {
          newParent.subFolderIds.push(folderId);
        }
      }

      // Update folder's parentFolderId
      folderToMove.parentFolderId = newParentId;
      folderToMove.updatedAt = new Date();

      await this.saveFolders(folders);
    } catch (error) {
      console.error('[FolderStorage] Error moving folder:', error);
      throw new Error('Failed to move folder');
    }
  }

  /**
   * Add item to folder
   */
  static async addItemToFolder(folderId: string, item: FolderItem): Promise<void> {
    try {
      const folders = await this.loadFolders();
      const folder = folders.find((f) => f.id === folderId);

      if (!folder) {
        throw new Error(`Folder ${folderId} not found`);
      }

      // Check if item already exists
      const exists = folder.items.some((i) => i.id === item.id);
      if (exists) {
        console.warn(`[FolderStorage] Item ${item.id} already exists in folder ${folderId}`);
        return;
      }

      folder.items.push(item);
      folder.updatedAt = new Date();

      await this.saveFolders(folders);
    } catch (error) {
      console.error('[FolderStorage] Error adding item to folder:', error);
      throw new Error('Failed to add item to folder');
    }
  }

  /**
   * Remove item from folder
   */
  static async removeItemFromFolder(folderId: string, itemId: string): Promise<void> {
    try {
      const folders = await this.loadFolders();
      const folder = folders.find((f) => f.id === folderId);

      if (!folder) {
        throw new Error(`Folder ${folderId} not found`);
      }

      folder.items = folder.items.filter((i) => i.id !== itemId);
      folder.updatedAt = new Date();

      await this.saveFolders(folders);
    } catch (error) {
      console.error('[FolderStorage] Error removing item from folder:', error);
      throw new Error('Failed to remove item from folder');
    }
  }

  /**
   * Get root folders (folders with no parent)
   */
  static async getRootFolders(): Promise<Folder[]> {
    try {
      const folders = await this.loadFolders();
      return folders.filter((f) => !f.parentFolderId);
    } catch (error) {
      console.error('[FolderStorage] Error getting root folders:', error);
      return [];
    }
  }

  /**
   * Get subfolders of a folder
   */
  static async getSubFolders(folderId: string): Promise<Folder[]> {
    try {
      const folders = await this.loadFolders();
      return folders.filter((f) => f.parentFolderId === folderId);
    } catch (error) {
      console.error('[FolderStorage] Error getting subfolders:', error);
      return [];
    }
  }

  /**
   * Update folder settings
   */
  static async updateFolderSettings(
    folderId: string,
    settings: Partial<FolderSettings>
  ): Promise<void> {
    try {
      const folders = await this.loadFolders();
      const folder = folders.find((f) => f.id === folderId);

      if (!folder) {
        throw new Error(`Folder ${folderId} not found`);
      }

      folder.settings = { ...folder.settings, ...settings };
      folder.updatedAt = new Date();

      await this.saveFolders(folders);
    } catch (error) {
      console.error('[FolderStorage] Error updating folder settings:', error);
      throw new Error('Failed to update folder settings');
    }
  }

  /**
   * Clear all folders (dangerous - use with caution)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.FOLDERS);
    } catch (error) {
      console.error('[FolderStorage] Error clearing folders:', error);
      throw new Error('Failed to clear folders');
    }
  }

  /**
   * Helper: Get all descendant folder IDs (recursive)
   */
  private static getDescendantFolderIds(folderId: string, folders: Folder[]): string[] {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return [];

    let descendants: string[] = [];

    for (const childId of folder.subFolderIds) {
      descendants.push(childId);
      descendants = descendants.concat(this.getDescendantFolderIds(childId, folders));
    }

    return descendants;
  }

  /**
   * Get folder hierarchy (breadcrumb path)
   */
  static async getFolderPath(folderId: string): Promise<string[]> {
    try {
      const folders = await this.loadFolders();
      const path: string[] = [];
      let currentId: string | undefined = folderId;

      while (currentId) {
        const folder = folders.find((f) => f.id === currentId);
        if (!folder) break;

        path.unshift(folder.name);
        currentId = folder.parentFolderId;
      }

      return path;
    } catch (error) {
      console.error('[FolderStorage] Error getting folder path:', error);
      return [];
    }
  }
}
