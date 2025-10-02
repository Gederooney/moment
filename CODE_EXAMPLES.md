# Exemples de Code - Intégration Spotify

## Table des Matières
1. [Authentification](#authentification)
2. [Recherche](#recherche)
3. [Métadonnées](#métadonnées)
4. [Lecture Audio](#lecture-audio)
5. [Gestion d'État](#gestion-détat)
6. [Gestion d'Erreurs](#gestion-derreurs)

---

## Authentification

### Login Simple

```typescript
import { useSpotify } from '../hooks/useSpotify';
import { Button, Alert } from 'react-native';

export default function LoginScreen() {
  const { login, isLoading } = useSpotify();

  const handleLogin = async () => {
    try {
      await login();
      Alert.alert('Success', 'Logged in to Spotify!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Button
      title={isLoading ? 'Loading...' : 'Login with Spotify'}
      onPress={handleLogin}
      disabled={isLoading}
    />
  );
}
```

### Login avec Status

```typescript
import { useSpotify } from '../hooks/useSpotify';
import { View, Text, Button, ActivityIndicator } from 'react-native';

export default function AuthScreen() {
  const {
    isAuthenticated,
    isLoading,
    isPremium,
    userProfile,
    login,
    logout
  } = useSpotify();

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (!isAuthenticated) {
    return (
      <View>
        <Text>Please login to continue</Text>
        <Button title="Login with Spotify" onPress={login} />
      </View>
    );
  }

  return (
    <View>
      <Text>Welcome {userProfile?.display_name}!</Text>
      <Text>Account: {isPremium ? 'Premium' : 'Free'}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

### Login Direct (sans Hook)

```typescript
import { SpotifyAuth } from '../services/audio/spotify';
import { SPOTIFY_CONFIG } from '../config/spotify.config';

async function loginToSpotify() {
  const auth = SpotifyAuth.getInstance(SPOTIFY_CONFIG);

  try {
    const tokens = await auth.authenticate();
    console.log('Logged in! Token expires:', new Date(tokens.expiresAt));
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

---

## Recherche

### Recherche Simple

```typescript
import { useSpotify } from '../hooks/useSpotify';
import { useState } from 'react';
import { TextInput, FlatList, Text } from 'react-native';

export default function SearchScreen() {
  const { search } = useSpotify();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const tracks = await search(query);
    setResults(tracks);
  };

  return (
    <>
      <TextInput
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        placeholder="Search tracks..."
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{item.name} - {item.artists[0].name}</Text>
        )}
      />
    </>
  );
}
```

### Recherche avec Debounce

```typescript
import { useSpotify } from '../hooks/useSpotify';
import { useState, useCallback } from 'react';
import { TextInput, FlatList, View, Text, Image } from 'react-native';
import debounce from 'lodash.debounce';

export default function SmartSearchScreen() {
  const { search } = useSpotify();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const tracks = await search(searchQuery, 20);
        setResults(tracks);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleChangeText = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={handleChangeText}
        placeholder="Search Spotify..."
      />
      {loading && <Text>Searching...</Text>}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', padding: 10 }}>
            <Image
              source={{ uri: item.album.images[2]?.url }}
              style={{ width: 50, height: 50 }}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
              <Text>{item.artists[0].name}</Text>
              <Text style={{ fontSize: 12, color: 'gray' }}>
                {Math.floor(item.duration_ms / 60000)}:
                {Math.floor((item.duration_ms % 60000) / 1000).toString().padStart(2, '0')}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
```

### Recherche Direct (sans Hook)

```typescript
import { SpotifyAPI } from '../services/audio/spotify';
import { SpotifyAuth } from '../services/audio/spotify';
import { SPOTIFY_CONFIG } from '../config/spotify.config';

async function searchSpotify(query: string) {
  const auth = SpotifyAuth.getInstance(SPOTIFY_CONFIG);
  const api = SpotifyAPI.getInstance(auth);

  try {
    const tracks = await api.search(query, 50);
    console.log(`Found ${tracks.length} tracks`);
    return tracks;
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}
```

---

## Métadonnées

### Récupérer Métadonnées Track

```typescript
import { useSpotify } from '../hooks/useSpotify';
import { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';

export default function TrackDetailsScreen({ trackId }: { trackId: string }) {
  const { api } = useSpotify();
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrackDetails();
  }, [trackId]);

  const loadTrackDetails = async () => {
    try {
      const trackData = await api.getTrackMetadata(trackId);
      setTrack(trackData);
    } catch (error) {
      console.error('Failed to load track:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator />;
  if (!track) return <Text>Track not found</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Image
        source={{ uri: track.album.images[0]?.url }}
        style={{ width: '100%', aspectRatio: 1 }}
      />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20 }}>
        {track.name}
      </Text>
      <Text style={{ fontSize: 18, color: 'gray' }}>
        {track.artists.map(a => a.name).join(', ')}
      </Text>
      <Text style={{ marginTop: 10 }}>
        Album: {track.album.name}
      </Text>
      <Text>
        Duration: {Math.floor(track.duration_ms / 60000)}:
        {Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}
      </Text>
    </View>
  );
}
```

### Profil Utilisateur

```typescript
import { useSpotify } from '../hooks/useSpotify';
import { useEffect } from 'react';
import { View, Text, Image } from 'react-native';

export default function ProfileScreen() {
  const { userProfile, api } = useSpotify();

  useEffect(() => {
    // Le hook charge automatiquement le profil
    // Mais vous pouvez forcer un refresh:
    api.getUserProfile().then(profile => {
      console.log('Profile refreshed:', profile);
    });
  }, []);

  if (!userProfile) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 20 }}>
      {userProfile.images?.[0] && (
        <Image
          source={{ uri: userProfile.images[0].url }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      )}
      <Text style={{ fontSize: 24, marginTop: 10 }}>
        {userProfile.display_name}
      </Text>
      <Text>{userProfile.email}</Text>
      <Text>Country: {userProfile.country}</Text>
      <Text>
        Account: {userProfile.product === 'premium' ? '⭐ Premium' : 'Free'}
      </Text>
    </View>
  );
}
```

---

## Lecture Audio

### Lecture Simple (Premium)

```typescript
import { useSpotify } from '../hooks/useSpotify';
import { Button, Alert } from 'react-native';

export default function PlayerScreen({ trackUri }: { trackUri: string }) {
  const { play, isPremium } = useSpotify();

  const handlePlay = async () => {
    if (!isPremium) {
      Alert.alert('Premium Required', 'Playback requires Spotify Premium');
      return;
    }

    try {
      await play(trackUri);
      Alert.alert('Success', 'Playing track!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Button
      title="Play Track"
      onPress={handlePlay}
      disabled={!isPremium}
    />
  );
}
```

### Player Complet (Premium)

```typescript
import { useSpotify } from '../hooks/useSpotify';
import { useState, useEffect } from 'react';
import { View, Button, Text } from 'react-native';

export default function FullPlayerScreen({ trackUri }: { trackUri: string }) {
  const { player, isPremium } = useSpotify();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    loadPlaybackState();
    const interval = setInterval(loadPlaybackState, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPlaybackState = async () => {
    try {
      const state = await player.getPlaybackState();
      setIsPlaying(state?.is_playing || false);
      setCurrentTrack(state?.item);
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  };

  const handlePlay = async () => {
    try {
      await player.play(trackUri);
      setIsPlaying(true);
    } catch (error) {
      console.error('Play failed:', error);
    }
  };

  const handlePause = async () => {
    try {
      await player.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Pause failed:', error);
    }
  };

  if (!isPremium) {
    return <Text>Premium account required</Text>;
  }

  return (
    <View>
      {currentTrack && (
        <Text>Now Playing: {currentTrack.name}</Text>
      )}
      {isPlaying ? (
        <Button title="Pause" onPress={handlePause} />
      ) : (
        <Button title="Play" onPress={handlePlay} />
      )}
    </View>
  );
}
```

### Preview Audio (Free & Premium)

```typescript
import { Audio } from 'expo-av';
import { useState } from 'react';
import { Button, Text } from 'react-native';
import { SpotifyTrack } from '../services/audio/spotify/types';

export default function PreviewPlayer({ track }: { track: SpotifyTrack }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playPreview = async () => {
    if (!track.preview_url) {
      alert('No preview available for this track');
      return;
    }

    try {
      // Arrêter le son précédent
      if (sound) {
        await sound.unloadAsync();
      }

      // Charger et jouer le preview
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.preview_url },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Auto-stop après fin
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Preview failed:', error);
    }
  };

  const stopPreview = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  return (
    <>
      {track.preview_url ? (
        <Button
          title={isPlaying ? 'Stop Preview (30s)' : 'Play Preview (30s)'}
          onPress={isPlaying ? stopPreview : playPreview}
        />
      ) : (
        <Text>No preview available</Text>
      )}
    </>
  );
}
```

---

## Gestion d'État

### Context Provider

```typescript
import React, { createContext, useContext, ReactNode } from 'react';
import { useSpotify } from '../hooks/useSpotify';

const SpotifyContext = createContext(null);

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const spotify = useSpotify();
  return (
    <SpotifyContext.Provider value={spotify}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotifyContext() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotifyContext must be used within SpotifyProvider');
  }
  return context;
}

// Usage dans App.tsx:
// <SpotifyProvider>
//   <Navigation />
// </SpotifyProvider>
```

---

## Gestion d'Erreurs

### Wrapper avec Error Handling

```typescript
import { useSpotify } from '../hooks/useSpotify';
import { useState } from 'react';
import { Button, Alert, ActivityIndicator } from 'react-native';

export default function SafeSpotifyButton({ trackUri }: { trackUri: string }) {
  const { play, isPremium } = useSpotify();
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    // Vérifications préalables
    if (!isPremium) {
      Alert.alert(
        'Premium Required',
        'Spotify Premium is required for playback. Upgrade your account to play full tracks.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      await play(trackUri);
      Alert.alert('Success', 'Now playing!');
    } catch (error) {
      // Gestion d'erreurs spécifiques
      if (error.message.includes('No active device')) {
        Alert.alert(
          'No Device Found',
          'Please open Spotify on your phone or computer to enable playback.',
          [{ text: 'OK' }]
        );
      } else if (error.message.includes('Token')) {
        Alert.alert(
          'Session Expired',
          'Please login again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <Button
      title="Play"
      onPress={handlePlay}
      disabled={!isPremium}
    />
  );
}
```

### Retry Logic

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Usage:
const tracks = await retryOperation(() => api.search('Beatles'), 3, 1000);
```

---

**Pour plus d'exemples, consultez:**
- `components/SpotifyAuthExample.tsx` - Exemple complet
- `SPOTIFY_INTEGRATION_GUIDE.md` - Guide détaillé
- `QUICK_START_SPOTIFY.md` - Guide rapide
