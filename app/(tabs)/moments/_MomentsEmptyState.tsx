import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';

interface MomentsEmptyStateProps {
  type: 'empty' | 'search';
  searchQuery?: string;
  onClearSearch?: () => void;
}

function SearchEmptyState({
  searchQuery,
  onClearSearch,
}: {
  searchQuery?: string;
  onClearSearch?: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <Ionicons
        name="search-outline"
        size={64}
        color={Colors.text.light}
      />
      <Text style={styles.emptyTitle}>Aucun résultat</Text>
      <Text style={styles.emptySubtitle}>
        Aucune vidéo ne correspond à "{searchQuery}"
      </Text>
      <TouchableOpacity
        style={styles.clearSearchButton}
        onPress={onClearSearch}
      >
        <Text style={styles.clearSearchText}>
          Effacer la recherche
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function DefaultEmptyState() {
  const router = useRouter();

  return (
    <View style={styles.emptyState}>
      <Ionicons
        name="bookmark-outline"
        size={64}
        color={Colors.text.light}
      />
      <Text style={styles.emptyTitle}>Aucun moment</Text>
      <Text style={styles.emptySubtitle}>
        Les moments que vous capturez apparaîtront ici
      </Text>
      <TouchableOpacity
        style={styles.goToHomeButton}
        onPress={() => router.push('/(tabs)/')}
      >
        <Ionicons
          name="home-outline"
          size={20}
          color={Colors.primary}
        />
        <Text style={styles.goToHomeText}>Aller à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

export function MomentsEmptyState({
  type,
  searchQuery,
  onClearSearch,
}: MomentsEmptyStateProps) {
  if (type === 'search') {
    return (
      <SearchEmptyState
        searchQuery={searchQuery}
        onClearSearch={onClearSearch}
      />
    );
  }

  return <DefaultEmptyState />;
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  goToHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  goToHomeText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  clearSearchButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  clearSearchText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
});
