/**
 * Exemples d'utilisation des services musicaux
 * Copiez ces composants dans votre app pour démarrer rapidement
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSpotifyOAuth } from './hooks/useSpotifyOAuth';
import { useSoundCloud } from './hooks/useSoundCloud';
import { MusicTrack } from './services/music/common/types';

// =============================================
// EXEMPLE 1: Écran de connexion Spotify
// =============================================
export function SpotifyLoginScreen() {
  const { isAuthenticated, isLoading, user, error, login, logout } =
    useSpotifyOAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (isAuthenticated && user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Connecté à Spotify</Text>
        <Text>Utilisateur: {user.display_name}</Text>
        <Text>Email: {user.email}</Text>
        <Text>Type: {user.product}</Text>
        {user.product !== 'premium' && (
          <Text style={styles.warning}>
            ⚠️ Spotify Premium requis pour le contrôle de lecture
          </Text>
        )}
        <Button title="Déconnexion" onPress={logout} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spotify</Text>
      <Button title="Se connecter avec Spotify" onPress={login} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// =============================================
// EXEMPLE 2: Recherche et lecture Spotify
// =============================================
export function SpotifySearchPlayer() {
  const {
    isAuthenticated,
    searchTracks,
    play,
    pause,
    getCurrentTrack,
    user,
  } = useSpotifyOAuth();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      const { tracks } = await searchTracks(query);
      setResults(tracks);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlay = async (trackUri: string) => {
    if (user?.product !== 'premium') {
      alert('Spotify Premium requis pour la lecture');
      return;
    }

    try {
      await play(trackUri);
      setIsPlaying(true);
      await updateCurrentTrack();
    } catch (error: any) {
      if (error.code === 'NO_DEVICE') {
        alert(
          'Aucun appareil Spotify actif. Ouvrez Spotify sur votre téléphone ou ordinateur.'
        );
      } else {
        alert('Erreur de lecture: ' + error.message);
      }
    }
  };

  const handlePause = async () => {
    try {
      await pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Pause failed:', error);
    }
  };

  const updateCurrentTrack = async () => {
    try {
      const state = await getCurrentTrack();
      setCurrentTrack(state.track);
      setIsPlaying(state.isPlaying);
    } catch (error) {
      console.error('Failed to get current track:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text>Veuillez vous connecter à Spotify</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recherche Spotify</Text>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher une musique..."
          onSubmitEditing={handleSearch}
        />
        <Button title="Rechercher" onPress={handleSearch} />
      </View>

      {isSearching ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.trackItem}
              onPress={() => handlePlay(item.uri!)}
            >
              <Text style={styles.trackTitle}>{item.title}</Text>
              <Text style={styles.trackArtist}>{item.artist}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {currentTrack && (
        <View style={styles.nowPlaying}>
          <Text style={styles.nowPlayingTitle}>En cours:</Text>
          <Text>{currentTrack.title}</Text>
          <Text>{currentTrack.artist}</Text>
          <Button
            title={isPlaying ? 'Pause' : 'Reprendre'}
            onPress={isPlaying ? handlePause : () => handlePlay(currentTrack.uri!)}
          />
        </View>
      )}
    </View>
  );
}

// =============================================
// EXEMPLE 3: Écran de connexion SoundCloud
// =============================================
export function SoundCloudLoginScreen() {
  const { isAuthenticated, isLoading, error, login, logout } = useSoundCloud();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Connecté à SoundCloud</Text>
        <Button title="Déconnexion" onPress={logout} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SoundCloud</Text>
      <Button title="Se connecter avec SoundCloud" onPress={login} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// =============================================
// EXEMPLE 4: Recherche et lecture SoundCloud
// =============================================
export function SoundCloudSearchPlayer() {
  const {
    isAuthenticated,
    searchTracks,
    play,
    pause,
    resume,
    stop,
    getCurrentTrack,
  } = useSoundCloud();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      const { tracks } = await searchTracks(query);
      setResults(tracks);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlay = async (track: MusicTrack) => {
    try {
      await play(track);
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      alert('Erreur de lecture: ' + (error as Error).message);
    }
  };

  const handlePause = async () => {
    try {
      await pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Pause failed:', error);
    }
  };

  const handleResume = async () => {
    try {
      await resume();
      setIsPlaying(true);
    } catch (error) {
      console.error('Resume failed:', error);
    }
  };

  const handleStop = async () => {
    try {
      await stop();
      setCurrentTrack(null);
      setIsPlaying(false);
    } catch (error) {
      console.error('Stop failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text>Veuillez vous connecter à SoundCloud</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recherche SoundCloud</Text>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher une musique..."
          onSubmitEditing={handleSearch}
        />
        <Button title="Rechercher" onPress={handleSearch} />
      </View>

      {isSearching ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.trackItem}
              onPress={() => handlePlay(item)}
            >
              <Text style={styles.trackTitle}>{item.title}</Text>
              <Text style={styles.trackArtist}>{item.artist}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {currentTrack && (
        <View style={styles.nowPlaying}>
          <Text style={styles.nowPlayingTitle}>En cours:</Text>
          <Text>{currentTrack.title}</Text>
          <Text>{currentTrack.artist}</Text>
          <View style={styles.controls}>
            {isPlaying ? (
              <Button title="Pause" onPress={handlePause} />
            ) : (
              <Button title="Reprendre" onPress={handleResume} />
            )}
            <Button title="Stop" onPress={handleStop} />
          </View>
        </View>
      )}
    </View>
  );
}

// =============================================
// EXEMPLE 5: Sélecteur de service musical
// =============================================
export function MusicServiceSelector() {
  const [selectedService, setSelectedService] = useState<
    'spotify' | 'soundcloud' | null
  >(null);

  if (selectedService === 'spotify') {
    return <SpotifySearchPlayer />;
  }

  if (selectedService === 'soundcloud') {
    return <SoundCloudSearchPlayer />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisissez un service musical</Text>
      <Button
        title="Spotify"
        onPress={() => setSelectedService('spotify')}
      />
      <Button
        title="SoundCloud"
        onPress={() => setSelectedService('soundcloud')}
      />
    </View>
  );
}

// =============================================
// Styles
// =============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  trackItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  nowPlaying: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 20,
  },
  nowPlayingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  warning: {
    color: 'orange',
    marginVertical: 10,
    textAlign: 'center',
  },
});
