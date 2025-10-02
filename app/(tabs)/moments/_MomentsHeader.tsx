import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

interface MomentsHeaderProps {
  onAddVideo: () => void;
}

export function MomentsHeader({ onAddVideo }: MomentsHeaderProps) {
  return (
    <View style={styles.header}>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
    backgroundColor: Colors.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  floatingText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
});
