import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SpotifyAPI } from '../../services/music/spotify/SpotifyAPI';
import { Logger } from '../../services/logger/Logger';

interface Track {
  track: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
      name: string;
      images: Array<{ url: string }>;
    };
    duration_ms: number;
    uri: string;
  };
}

export default function PlaylistScreen() {
  const router = useRouter();
  const { playlistId, playlistName } = useLocalSearchParams();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlaylistTracks();
  }, [playlistId]);

  const loadPlaylistTracks = async () => {
    if (!playlistId) {
      setError('Playlist ID manquant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Initialize Spotify API if not already done
      if (!SpotifyAPI.isInitialized()) {
        SpotifyAPI.initialize();
      }

      const data = await SpotifyAPI.getPlaylistTracks(playlistId as string);
      setTracks(data.items || []);
    } catch (err: any) {
      Logger.error('PlaylistScreen', 'Failed to load tracks', err);
      setError('Impossible de charger les titres');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  const handleTrackPress = (track: Track) => {
    // TODO: Connect to universal player
    Alert.alert('Player', `Lecture de: ${track.track.name}`);
    console.log('Track selected:', track);
  };

  const renderTrack = ({ item }: { item: Track }) => {
    if (!item.track) return null;

    return (
      <TouchableOpacity
        style={styles.trackItem}
        onPress={() => handleTrackPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri: item.track.album.images?.[0]?.url || 'https://via.placeholder.com/50',
          }}
          style={styles.albumArt}
        />
        <View style={styles.trackInfo}>
          <Text style={styles.trackName} numberOfLines={1}>
            {item.track.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {item.track.artists.map(a => a.name).join(', ')}
          </Text>
        </View>
        <Text style={styles.duration}>{formatDuration(item.track.duration_ms)}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {playlistName || 'Playlist'}
          </Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Chargement des titres...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Erreur</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPlaylistTracks}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {playlistName || 'Playlist'}
        </Text>
        <View style={styles.backButton} />
      </View>
      <FlatList
        data={tracks}
        keyExtractor={(item, index) => item.track?.id || index.toString()}
        renderItem={renderTrack}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons name="musical-notes-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>Aucun titre dans cette playlist</Text>
          </View>
        }
      />
    </View>
  );
}

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
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  backButton: {
    padding: 8,
    width: 40,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1DB954',
    borderRadius: 24,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});