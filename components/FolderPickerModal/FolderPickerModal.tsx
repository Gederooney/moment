/**
 * FolderPickerModal Component
 * Modal for selecting folders to add moments to
 * Supports hierarchical navigation and search
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Folder } from '../../types/folder';
import { Colors } from '../../constants/Colors';

interface FolderPickerModalProps {
  visible: boolean;
  folders: Folder[];
  onClose: () => void;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder?: (name: string, parentId?: string) => Promise<void>;
  selectedMomentId?: string;
  title?: string;
  darkMode?: boolean;
}

export const FolderPickerModal: React.FC<FolderPickerModalProps> = ({
  visible,
  folders,
  onClose,
  onSelectFolder,
  onCreateFolder,
  selectedMomentId,
  title = 'Ajouter à un dossier',
  darkMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Get current level folders (root or children)
  const getCurrentLevelFolders = useMemo(() => {
    let levelFolders = currentFolder
      ? folders.filter(f => f.parentFolderId === currentFolder.id)
      : folders.filter(f => !f.parentFolderId);

    // Apply search filter
    if (searchQuery.trim()) {
      return levelFolders.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return levelFolders;
  }, [folders, currentFolder, searchQuery]);

  // Check if moment is already in folder
  const isMomentInFolder = (folder: Folder): boolean => {
    if (!selectedMomentId) return false;
    return folder.items.some(item => item.itemId === selectedMomentId);
  };

  // Get breadcrumb path
  const getBreadcrumbs = (): Folder[] => {
    const path: Folder[] = [];
    let current = currentFolder;
    while (current) {
      path.unshift(current);
      current = folders.find(f => f.id === current!.parentFolderId) || null;
    }
    return path;
  };

  const handleFolderPress = (folder: Folder) => {
    // Check if this folder has subfolders
    const hasChildren = folders.some(f => f.parentFolderId === folder.id);

    if (hasChildren) {
      // Navigate into folder
      setCurrentFolder(folder);
    } else {
      // Select this folder
      onSelectFolder(folder.id);
      handleClose();
    }
  };

  const handleSelectCurrentFolder = () => {
    if (currentFolder) {
      onSelectFolder(currentFolder.id);
      handleClose();
    }
  };

  const handleBreadcrumbPress = (index: number) => {
    const breadcrumbs = getBreadcrumbs();
    if (index === -1) {
      setCurrentFolder(null);
    } else {
      setCurrentFolder(breadcrumbs[index]);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !onCreateFolder) return;

    try {
      await onCreateFolder(newFolderName.trim(), currentFolder?.id);
      setNewFolderName('');
      setShowCreateModal(false);
      Alert.alert('Succès', 'Dossier créé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le dossier');
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setCurrentFolder(null);
    setShowCreateModal(false);
    setNewFolderName('');
    onClose();
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, darkMode && styles.titleDark]}>{title}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, darkMode && styles.closeButtonTextDark]}>
              Fermer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Breadcrumb Navigation */}
        {breadcrumbs.length > 0 && (
          <View style={styles.breadcrumbContainer}>
            <TouchableOpacity onPress={() => handleBreadcrumbPress(-1)} style={styles.breadcrumbItem}>
              <Ionicons name="folder-outline" size={16} color={Colors.primary} />
              <Text style={styles.breadcrumbText}>Dossiers</Text>
            </TouchableOpacity>
            {breadcrumbs.map((folder, index) => (
              <View key={folder.id} style={styles.breadcrumbItem}>
                <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
                <TouchableOpacity onPress={() => handleBreadcrumbPress(index)}>
                  <Text style={styles.breadcrumbText}>{folder.name}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, darkMode && styles.searchInputDark]}
            placeholder="Rechercher un dossier..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Create Folder Button */}
        {onCreateFolder && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-circle" size={20} color={Colors.primary} />
            <Text style={styles.createButtonText}>Nouveau dossier</Text>
          </TouchableOpacity>
        )}

        {/* Select Current Folder Button (if inside a folder) */}
        {currentFolder && (
          <TouchableOpacity
            style={styles.selectCurrentButton}
            onPress={handleSelectCurrentFolder}
          >
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.selectCurrentText}>
              Ajouter à "{currentFolder.name}"
            </Text>
          </TouchableOpacity>
        )}

        {/* Folder List */}
        <FlatList
          data={getCurrentLevelFolders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const hasChildren = folders.some(f => f.parentFolderId === item.id);
            const isInFolder = isMomentInFolder(item);

            return (
              <TouchableOpacity
                style={styles.folderItem}
                onPress={() => handleFolderPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.folderLeft}>
                  <Ionicons
                    name={hasChildren ? 'folder' : 'folder-outline'}
                    size={24}
                    color={Colors.primary}
                  />
                  <View style={styles.folderInfo}>
                    <Text style={[styles.folderName, darkMode && styles.folderNameDark]}>
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text style={styles.folderDescription}>{item.description}</Text>
                    )}
                    <Text style={styles.folderMeta}>
                      {item.items.length} moment{item.items.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.folderRight}>
                  {isInFolder && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  )}
                  {hasChildren && (
                    <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color={Colors.text.tertiary} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Aucun dossier trouvé' : 'Aucun dossier'}
              </Text>
              {onCreateFolder && !searchQuery && (
                <TouchableOpacity
                  style={styles.emptyCreateButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Text style={styles.emptyCreateButtonText}>Créer un dossier</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          contentContainerStyle={styles.listContent}
        />

        {/* Create Folder Modal */}
        <Modal
          visible={showCreateModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.createModalOverlay}>
            <View style={[styles.createModalContent, darkMode && styles.createModalContentDark]}>
              <Text style={[styles.createModalTitle, darkMode && styles.createModalTitleDark]}>
                Nouveau dossier
              </Text>
              <TextInput
                style={[styles.createModalInput, darkMode && styles.createModalInputDark]}
                placeholder="Nom du dossier"
                placeholderTextColor={Colors.text.tertiary}
                value={newFolderName}
                onChangeText={setNewFolderName}
                autoFocus
              />
              <View style={styles.createModalButtons}>
                <TouchableOpacity
                  style={styles.createModalCancelButton}
                  onPress={() => {
                    setShowCreateModal(false);
                    setNewFolderName('');
                  }}
                >
                  <Text style={styles.createModalCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.createModalCreateButton,
                    !newFolderName.trim() && styles.createModalCreateButtonDisabled,
                  ]}
                  onPress={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                >
                  <Text style={styles.createModalCreateText}>Créer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  titleDark: {
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.primary,
  },
  closeButtonTextDark: {
    color: '#5ac8fa',
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  breadcrumbText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchIcon: {
    position: 'absolute',
    left: 32,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
  searchInputDark: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  selectCurrentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
    gap: 8,
  },
  selectCurrentText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  folderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  folderNameDark: {
    color: '#fff',
  },
  folderDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  folderMeta: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  folderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  emptyCreateButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  emptyCreateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  createModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  createModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  createModalContentDark: {
    backgroundColor: '#2a2a2a',
  },
  createModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  createModalTitleDark: {
    color: '#fff',
  },
  createModalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  createModalInputDark: {
    borderColor: '#404040',
    color: '#fff',
    backgroundColor: '#1a1a1a',
  },
  createModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  createModalCancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
  },
  createModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  createModalCreateButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  createModalCreateButtonDisabled: {
    opacity: 0.5,
  },
  createModalCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
