/**
 * SelectionToolbar Component
 * Bottom toolbar for bulk actions on selected moments
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface SelectionToolbarProps {
  selectedCount: number;
  onAddToFolder: () => void;
  onDelete: () => void;
  onExport: () => void;
  onCancel: () => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedCount,
  onAddToFolder,
  onDelete,
  onExport,
  onCancel,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.countText}>
          {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAddToFolder}
          disabled={selectedCount === 0}
        >
          <Ionicons
            name="folder-outline"
            size={24}
            color={selectedCount === 0 ? Colors.text.tertiary : Colors.primary}
          />
          <Text
            style={[
              styles.actionText,
              selectedCount === 0 && styles.actionTextDisabled,
            ]}
          >
            Ajouter à dossier
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onExport}
          disabled={selectedCount === 0}
        >
          <Ionicons
            name="share-outline"
            size={24}
            color={selectedCount === 0 ? Colors.text.tertiary : Colors.text.primary}
          />
          <Text
            style={[
              styles.actionText,
              selectedCount === 0 && styles.actionTextDisabled,
            ]}
          >
            Exporter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onDelete}
          disabled={selectedCount === 0}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color={selectedCount === 0 ? Colors.text.tertiary : '#FF3B30'}
          />
          <Text
            style={[
              styles.actionText,
              styles.actionTextDanger,
              selectedCount === 0 && styles.actionTextDisabled,
            ]}
          >
            Supprimer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  cancelButton: {
    padding: 4,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  actionTextDisabled: {
    color: Colors.text.tertiary,
  },
  actionTextDanger: {
    color: '#FF3B30',
  },
});
