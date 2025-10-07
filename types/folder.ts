/**
 * Folder types for hierarchical organization of videos and moments
 */

export type FolderItemType = 'youtube_video' | 'screen_recording_moment';

export interface FolderItem {
  id: string;
  type: FolderItemType;
  itemId: string; // videoId for youtube_video, momentId for screen_recording_moment
  addedAt: Date;
}

export interface FolderSettings {
  sortBy: 'dateAdded' | 'name' | 'custom';
  sortOrder: 'asc' | 'desc';
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  parentFolderId?: string; // null/undefined if root folder
  items: FolderItem[];
  subFolderIds: string[]; // IDs of child folders
  settings: FolderSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderState {
  folders: Folder[];
  isLoading: boolean;
}

export interface FolderActions {
  createFolder: (name: string, parentId?: string, description?: string) => Promise<string>;
  deleteFolder: (folderId: string) => Promise<void>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  addItemToFolder: (folderId: string, itemType: FolderItemType, itemId: string) => Promise<void>;
  removeItemFromFolder: (folderId: string, itemId: string) => Promise<void>;
  moveFolder: (folderId: string, newParentId?: string) => Promise<void>;
  getFolderById: (folderId: string) => Folder | undefined;
  getRootFolders: () => Folder[];
  getSubFolders: (folderId: string) => Folder[];
  updateFolderSettings: (folderId: string, settings: Partial<FolderSettings>) => Promise<void>;
  loadFolders: () => Promise<void>;
}

export interface FolderContextType extends FolderState, FolderActions {}

/**
 * Helper type for folder breadcrumb navigation
 */
export interface FolderBreadcrumb {
  id: string;
  name: string;
}

/**
 * Helper type for folder tree view
 */
export interface FolderTreeNode {
  folder: Folder;
  children: FolderTreeNode[];
  depth: number;
}
