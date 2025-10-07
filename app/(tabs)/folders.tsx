import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFolders } from '../../hooks/useFolders';
import { FolderTree } from '../../components/FolderTree';
import { Breadcrumb } from '../../components/Breadcrumb';
import { Folder } from '../../types/folder';

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
  } = useFolders();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isDark] = useState(false); // TODO: Get from theme context

  const handleFolderPress = (folder: Folder) => {
    setCurrentFolder(folder);
  };

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

  const handleBreadcrumbNavigate = (index: number) => {
    const path = getFolderPath(currentFolder?.id || '');
    if (index === 0) {
      setCurrentFolder(null);
    } else {
      const targetFolderName = path[index];
      const targetFolder = folders.find(f => f.name === targetFolderName);
      if (targetFolder) {
        setCurrentFolder(targetFolder);
      }
    }
  };

  const breadcrumbPath = currentFolder
    ? ['Accueil', ...getFolderPath(currentFolder.id)]
    : ['Accueil'];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Breadcrumb */}
      <Breadcrumb path={breadcrumbPath} onNavigate={handleBreadcrumbNavigate} darkMode={isDark} />

      {/* Folder Tree */}
      {folders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>📁 Aucun dossier</Text>
          <Text style={[styles.emptySubtext, isDark && styles.emptySubtextDark]}>
            Appuyez sur le bouton + pour créer votre premier dossier
          </Text>
        </View>
      ) : (
        <FolderTree
          folders={folders}
          onFolderPress={handleFolderPress}
          onFolderLongPress={handleFolderLongPress}
          selectedFolderId={currentFolder?.id}
          darkMode={isDark}
        />
      )}

      {/* FAB - Create Folder */}
      <TouchableOpacity
        style={[styles.fab, isDark && styles.fabDark]}
        onPress={() => setShowCreateModal(true)}
      >
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
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
              Nouveau dossier
            </Text>

            <TextInput
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Nom du dossier..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              style={[styles.input, isDark && styles.inputDark]}
              autoFocus
              onSubmitEditing={handleCreateFolder}
            />

            {currentFolder && (
              <Text style={[styles.parentInfo, isDark && styles.parentInfoDark]}>
                dans {currentFolder.name}
              </Text>
            )}

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
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 24,
    color: '#333',
    marginBottom: 8,
  },
  emptyTextDark: {
    color: '#e0e0e0',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptySubtextDark: {
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabDark: {
    backgroundColor: '#64b5f6',
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
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
  modalContentDark: {
    backgroundColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  modalTitleDark: {
    color: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  inputDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#404040',
    color: '#fff',
  },
  parentInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  parentInfoDark: {
    color: '#999',
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
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    backgroundColor: '#1976d2',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
