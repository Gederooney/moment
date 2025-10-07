/**
 * MomentContextMenu Component
 * Context menu for moment actions (Edit, Add to Folder, Delete)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface MomentContextMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAddToFolder: () => void;
  onDelete: () => void;
  momentTitle: string;
  darkMode?: boolean;
}

export const MomentContextMenu: React.FC<MomentContextMenuProps> = ({
  visible,
  onClose,
  onEdit,
  onAddToFolder,
  onDelete,
  momentTitle,
  darkMode = false,
}) => {
  const handleAction = (action: () => void) => {
    onClose();
    // Small delay to let modal close animation finish
    setTimeout(action, 100);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.menuContainer, darkMode && styles.menuContainerDark]}>
              <View style={styles.menuHeader}>
                <Text style={[styles.menuTitle, darkMode && styles.menuTitleDark]} numberOfLines={1}>
                  {momentTitle}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleAction(onEdit)}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={22} color={Colors.text.primary} />
                <Text style={[styles.menuItemText, darkMode && styles.menuItemTextDark]}>
                  Éditer / Prendre des notes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleAction(onAddToFolder)}
                activeOpacity={0.7}
              >
                <Ionicons name="folder-outline" size={22} color={Colors.primary} />
                <Text style={[styles.menuItemText, darkMode && styles.menuItemTextDark]}>
                  Ajouter à un dossier
                </Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleAction(onDelete)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                  Supprimer
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  menuContainerDark: {
    backgroundColor: '#2a2a2a',
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  menuTitleDark: {
    color: '#aaa',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  menuItemTextDark: {
    color: '#fff',
  },
  menuItemTextDanger: {
    color: '#FF3B30',
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 4,
  },
});
