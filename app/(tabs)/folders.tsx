/**
 * Folders Screen - iOS Files Style
 * Navigate through folder hierarchy with list/grid view options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
  ScrollView,
} from 'react-native';
import { useFolders } from '../../hooks/useFolders';
import { Folder } from '../../types/folder';
import { Colors } from '../../constants/Colors';
import { useTopBarContext } from '../../contexts/TopBarContext';
import { FolderIcon, GridIcon, ListIcon } from '../../components/icons';
import { Ionicons } from '@expo/vector-icons';
import { FolderMomentItem } from '../../components/FolderMomentItem';
import { useMomentsContext } from '../../contexts/MomentsContext';
import { useRouter } from 'expo-router';
import { CapturedMoment } from '../../types/moment';

type ViewMode = 'list' | 'grid';

export default function FoldersScreen() {
  const {
    folders,
    currentFolder,
    isLoading,
    createFolder,
    deleteFolder,
    setCurrentFolder,
    getFolderPath,
    refreshFolders,
    removeItemFromFolder,
  } = useFolders();

  const { getAllMoments } = useMomentsContext();
  const router = useRouter();
  const { setTitle, setBackButton } = useTopBarContext();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAscending, setSortAscending] = useState(true);

  // Get current level folders (either root or children of current folder)
  const getCurrentLevelFolders = () => {
    let levelFolders;
    if (!currentFolder) {
      // Show root folders
      levelFolders = folders.filter(f => !f.parentFolderId);
    } else {
      // Show children of current folder
      levelFolders = folders.filter(f => f.parentFolderId === currentFolder.id);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      return levelFolders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return levelFolders;
  };

  const currentLevelFolders = getCurrentLevelFolders();

  // Get moments in current folder
  const getCurrentFolderMoments = (): CapturedMoment[] => {
    if (!currentFolder) return [];

    const allMoments = getAllMoments();
    const momentIds = currentFolder.items
      .filter(item => item.type === 'screen_recording_moment')
      .map(item => item.itemId);

    return allMoments.filter(moment => momentIds.includes(moment.id));
  };

  const currentFolderMoments = getCurrentFolderMoments();

  const handleFolderPress = (folder: Folder) => {
    // Navigate into the folder
    setCurrentFolder(folder);
  };

  const handlePlayMoment = (moment: CapturedMoment) => {
    // Navigate to player with the video and timestamp
    router.push({
      pathname: '/player',
      params: {
        videoId: moment.videoId,
        timestamp: moment.timestamp.toString(),
      },
    });
  };

  const handleRemoveMomentFromFolder = async (moment: CapturedMoment) => {
    if (!currentFolder) return;
    try {
      // Find the FolderItem that corresponds to this moment
      const folderItem = currentFolder.items.find(
        item => item.type === 'screen_recording_moment' && item.itemId === moment.id
      );

      if (!folderItem) {
        Alert.alert('Erreur', 'Moment non trouvé dans le dossier');
        return;
      }

      await removeItemFromFolder(currentFolder.id, folderItem.id);
      Alert.alert('Succès', 'Moment retiré du dossier');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de retirer le moment du dossier');
    }
  };

  const handleBackPress = () => {
    if (!currentFolder) return;

    if (currentFolder.parentFolderId) {
      // Go to parent folder
      const parentFolder = folders.find(f => f.id === currentFolder.parentFolderId);
      setCurrentFolder(parentFolder || null);
    } else {
      // Go to root
      setCurrentFolder(null);
    }
  };

  // Update TopBar based on current folder state
  useEffect(() => {
    if (currentFolder) {
      // Show folder name and back button
      setTitle(currentFolder.name);
      setBackButton(true, handleBackPress);
    } else {
      // At root level
      setTitle('Dossiers');
      setBackButton(false);
    }
  }, [currentFolder, setTitle, setBackButton]);

  const handleFolderLongPress = (folder: Folder) => {
    Alert.alert(folder.name, 'Choisissez une action', [
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => handleDeleteFolder(folder),
      },
      {
        text: 'Annuler',
        style: 'cancel',
      },
    ]);
  };

  const handleDeleteFolder = async (folder: Folder) => {
    try {
      await deleteFolder(folder.id);
      if (currentFolder?.id === folder.id) {
        setCurrentFolder(null);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le dossier');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder(newFolderName, currentFolder?.id);
      setNewFolderName('');
      setShowCreateModal(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le dossier');
    }
  };

  const renderFolderItem = ({ item }: { item: Folder }) => {
    // Calculate total items (folder items + subfolders)
    const totalItems = item.items.length + item.subFolderIds.length;

    if (viewMode === 'grid') {
      return (
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => handleFolderPress(item)}
          onLongPress={() => handleFolderLongPress(item)}
        >
          <View style={styles.gridIconContainer}>
            <FolderIcon size={48} color={Colors.primary} focused={false} />
          </View>
          <Text style={styles.gridLabel} numberOfLines={2}>
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    }

    // List view
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => handleFolderPress(item)}
        onLongPress={() => handleFolderLongPress(item)}
      >
        <View style={styles.listIconContainer}>
          <FolderIcon size={32} color={Colors.primary} focused={false} />
        </View>
        <View style={styles.listInfo}>
          <Text style={styles.listTitle}>{item.name}</Text>
          <Text style={styles.listSubtitle}>
            {totalItems} élément{totalItems !== 1 ? 's' : ''}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher dans les dossiers"
          placeholderTextColor={Colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {/* View Toggle Controls */}
      <View style={styles.controls}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <ListIcon
              size={18}
              color={viewMode === 'list' ? Colors.primary : Colors.text.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <GridIcon
              size={20}
              color={viewMode === 'grid' ? Colors.primary : Colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortAscending(!sortAscending)}
        >
          <Text style={styles.sortText}>Date</Text>
          <Ionicons
            name={sortAscending ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={Colors.text.secondary}
            style={styles.sortIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Sub-folders Section */}
        {currentLevelFolders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              DOSSIERS ({currentLevelFolders.length})
            </Text>
            {viewMode === 'grid' ? (
              <View style={styles.gridContainer}>
                {currentLevelFolders.map(folder => (
                  <View key={folder.id} style={styles.gridItem}>
                    {renderFolderItem({ item: folder })}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.listContainer}>
                {currentLevelFolders.map(folder => (
                  <View key={folder.id}>
                    {renderFolderItem({ item: folder })}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Moments Section */}
        {currentFolderMoments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              MOMENTS ({currentFolderMoments.length})
            </Text>
            <View style={styles.momentsContainer}>
              {currentFolderMoments.map(moment => (
                <FolderMomentItem
                  key={moment.id}
                  moment={moment}
                  onPlay={() => handlePlayMoment(moment)}
                  onRemoveFromFolder={() => handleRemoveMomentFromFolder(moment)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {currentLevelFolders.length === 0 && currentFolderMoments.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>
              {currentFolder ? 'Dossier vide' : 'Aucun dossier'}
            </Text>
            <Text style={styles.emptySubtext}>
              {currentFolder
                ? 'Ajoutez des moments depuis la page Moments'
                : 'Appuyez sur + pour créer un dossier'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB - Create Folder */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Create Folder Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouveau dossier</Text>

            <TextInput
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Nom du dossier..."
              placeholderTextColor="#999"
              style={styles.input}
              autoFocus
              onSubmitEditing={handleCreateFolder}
            />

            {currentFolder && <Text style={styles.parentInfo}>dans {currentFolder.name}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewFolderName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreateFolder}
              >
                <Text style={styles.createButtonText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.white,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  searchInput: {
    height: 48,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: 0,
  },
  viewButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: Colors.background.white,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  sortText: {
    fontSize: 15,
    color: Colors.primary,
  },
  sortIcon: {
    marginLeft: 2,
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  listIconContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listIcon: {
    fontSize: 32,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  listSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  chevron: {
    fontSize: 24,
    color: Colors.text.tertiary,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
  },
  momentsContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  gridItem: {
    width: '31%',
    marginRight: '3.5%',
    marginBottom: 24,
    alignItems: 'center',
  },
  gridIconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridIcon: {
    fontSize: 56,
  },
  gridLabel: {
    fontSize: 13,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  parentInfo: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background.tertiary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  createButton: {
    backgroundColor: Colors.primary,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
