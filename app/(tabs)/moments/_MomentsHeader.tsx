import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

interface MomentsHeaderProps {
  onAddVideo: () => void;
  onExport?: () => void;
  hasExportableMoments?: boolean;
}

export function MomentsHeader({ onAddVideo, onExport, hasExportableMoments = false }: MomentsHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Export button */}
      {hasExportableMoments && onExport && (
        <TouchableOpacity
          style={styles.exportButton}
          onPress={onExport}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={20} color={Colors.text.secondary} />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      )}

      {/* Bouton floating "Nouveau" - Wireframe 3 */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={onAddVideo}
        activeOpacity={0.8}
      >
        <View style={styles.floatingCircle}>
          <Ionicons name="add" size={20} color={Colors.background.white} />
        </View>
        <Text style={styles.floatingText}>Nouveau</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
  },
  exportText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  floatingText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
});
