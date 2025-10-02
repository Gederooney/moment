import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

interface MomentsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  videosCount: number;
  momentsCount: number;
  onClearAll: () => void;
}

function SearchInput({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search"
        size={20}
        color={Colors.text.secondary}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher"
        value={searchQuery}
        onChangeText={onSearchChange}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => onSearchChange('')}>
          <Ionicons
            name="close-circle"
            size={20}
            color={Colors.text.secondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

function StatsRow({
  videosCount,
  momentsCount,
  onClearAll,
}: {
  videosCount: number;
  momentsCount: number;
  onClearAll: () => void;
}) {
  if (videosCount === 0) return null;

  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statsText}>
        {videosCount} vidéo{videosCount > 1 ? 's' : ''} •{' '}
        {momentsCount} moment{momentsCount > 1 ? 's' : ''}
      </Text>
      <TouchableOpacity
        style={styles.clearAllButton}
        onPress={onClearAll}
      >
        <Ionicons
          name="trash-outline"
          size={16}
          color={Colors.error}
        />
        <Text style={styles.clearAllText}>Tout effacer</Text>
      </TouchableOpacity>
    </View>
  );
}

export function MomentsSearchBar({
  searchQuery,
  onSearchChange,
  videosCount,
  momentsCount,
  onClearAll,
}: MomentsSearchBarProps) {
  return (
    <View style={styles.searchSection}>
      <SearchInput
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <StatsRow
        videosCount={videosCount}
        momentsCount={momentsCount}
        onClearAll={onClearAll}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearAllText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
});
