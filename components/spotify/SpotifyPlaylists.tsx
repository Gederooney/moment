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
import { useRouter } from 'expo-router';
import { SpotifyAPI } from '../../services/music/spotify/SpotifyAPI';
import { Logger } from '../../services/logger/Logger';
import { useAuthContext } from '../../contexts/AuthContext';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
    href: string;
  };
  owner: {
    display_name: string;
  };
}

interface SpotifyPlaylistsProps {
  onSelectTrack?: (track: any) => void;
  onClose?: () => void;
}

export const SpotifyPlaylists: React.FC<SpotifyPlaylistsProps> = ({ onSelectTrack, onClose }) => {
  const router = useRouter();
  const { loginSpotify } = useAuthContext();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize Spotify API if not already done
      if (!SpotifyAPI.isInitialized()) {
        SpotifyAPI.initialize();
      }

      const userPlaylists = await SpotifyAPI.getUserPlaylists();
      setPlaylists(userPlaylists.items || []);
    } catch (err: any) {
      Logger.error('SpotifyPlaylists', 'Failed to load playlists', err);

      // Handle specific error codes
      if (err.code === 'NOT_AUTHENTICATED') {
        setError('Vous devez vous connecter à Spotify pour voir vos playlists');
        setIsAuthError(true);
      } else if (err.code === 'FORBIDDEN' || err.code === 'AUTH_FAILED' || err.code === 'UNAUTHORIZED') {
        setError('Session expirée ou permissions insuffisantes');
        setIsAuthError(true);
      } else if (err.message?.includes('403') || err.message?.includes('401')) {
        setError('Veuillez vous reconnecter à Spotify');
        setIsAuthError(true);
      } else {
        setError('Impossible de charger les playlists');
        setIsAuthError(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReauth = async () => {
    try {
      await loginSpotify();
      // Reload playlists after successful login
      loadPlaylists();
    } catch (error) {
      Logger.error('SpotifyPlaylists', 'Reauth failed', error);
    }
  };

  const handlePlaylistPress = async (playlist: Playlist) => {
    try {
      // Navigate to playlist tracks view
      router.push({
        pathname: '/spotify/playlist',
        params: {
          playlistId: playlist.id,
          playlistName: playlist.name,
        },
      });
    } catch (err) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir la playlist');
    }
  };

  const renderPlaylist = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => handlePlaylistPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: item.images?.[0]?.url || 'https://via.placeholder.com/60',
        }}
        style={styles.playlistImage}
      />
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.playlistMeta}>
          {item.owner.display_name} • {item.tracks.total} titres
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Chargement des playlists...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.buttonContainer}>
          {isAuthError && (
            <TouchableOpacity style={styles.authButton} onPress={handleReauth}>
              <Ionicons name="logo-spotify" size={20} color="#FFFFFF" />
              <Text style={styles.authButtonText}>
                {error?.includes('connecter') ? 'Se connecter à Spotify' : 'Se reconnecter'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={loadPlaylists}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vos Playlists Spotify</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylist}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons name="musical-notes-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>Aucune playlist trouvée</Text>
          </View>
        }
      />
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
    paddingTop: 50, // Account for safe area
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  closeButton: {
    padding: 8,
  },
  listContainer: {
    paddingVertical: 8,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  playlistImage: {
    width: 56,
    height: 56,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  playlistMeta: {
    fontSize: 14,
    color: '#757575',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 84,
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
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#1DB954',
    borderRadius: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#1DB954',
    borderRadius: 20,
    gap: 8,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});