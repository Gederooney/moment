import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SpotifyAPI } from '../../services/music/spotify/SpotifyAPI';
import { Logger } from '../../services/logger/Logger';

interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  uri: string;
}

interface SpotifySearchProps {
  initialQuery?: string;
  onSelectTrack?: (track: Track) => void;
  onClose?: () => void;
}

export const SpotifySearch: React.FC<SpotifySearchProps> = ({ initialQuery = '', onSelectTrack, onClose }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery?.trim()) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Initialize Spotify API if not already done
      if (!SpotifyAPI.isInitialized()) {
        SpotifyAPI.initialize();
      }

      const results = await SpotifyAPI.searchTracks(searchQuery, 20);
      setTracks(results.tracks || []);

      if (results.tracks?.length === 0) {
        setError('Aucun résultat trouvé');
      }
    } catch (err: any) {
      Logger.error('SpotifySearch', 'Search failed', err);

      if (err.code === 'NOT_AUTHENTICATED') {
        setError('Vous devez vous connecter à Spotify');
      } else if (err.code === 'FORBIDDEN') {
        setError('Recherche non disponible. Application en attente d\'approbation Spotify.');
      } else {
        setError('Erreur lors de la recherche');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  const renderTrack = ({ item }: { item: Track }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => onSelectTrack?.(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: item.album.images?.[0]?.url || 'https://via.placeholder.com/50',
        }}
        style={styles.albumArt}
      />
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {item.artists.map(a => a.name).join(', ')}
        </Text>
      </View>
      <Text style={styles.duration}>{formatDuration(item.duration_ms)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rechercher sur Spotify</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des titres, artistes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : tracks.length > 0 ? (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={renderTrack}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="musical-notes-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>
            Recherchez vos titres favoris
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    paddingVertical: 8,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  artistName: {
    fontSize: 14,
    color: '#757575',
  },
  duration: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 76,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});