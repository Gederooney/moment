# Guide d'intégration OAuth PKCE - Spotify & SoundCloud

## Architecture créée

### Structure des fichiers

```
/services/music/
├── common/
│   ├── types.ts                 ✅ Types partagés
│   └── SecureStorage.ts        ✅ Gestion sécurisée des tokens
├── spotify/
│   ├── types.ts                ✅ Types Spotify
│   ├── SpotifyAuth.ts          ✅ OAuth PKCE
│   ├── SpotifyAPI.ts           ✅ Client API avec auto-refresh
│   └── SpotifyPlayer.ts        ✅ Contrôle playback
├── soundcloud/
│   ├── types.ts                ✅ Types SoundCloud
│   ├── SoundCloudAuth.ts       ✅ OAuth 2.1 PKCE
│   ├── SoundCloudAPI.ts        ✅ Client API avec auto-refresh
│   └── SoundCloudPlayer.ts     ✅ Streaming HLS
└── index.ts                    ✅ Export centralisé

/hooks/
├── useSpotifyOAuth.ts          ✅ Hook Spotify
└── useSoundCloud.ts            ✅ Hook SoundCloud
```

## Configuration

### 1. Spotify

#### Obtenir les credentials
1. Allez sur https://developer.spotify.com/dashboard
2. Créez une nouvelle application
3. Configurez le Redirect URI: `podcut://callback`
4. Copiez votre `Client ID`

#### Configuration dans l'app
Ajoutez dans votre fichier `/app/_layout.tsx` ou équivalent:

```typescript
import { SpotifyAuth, SpotifyAPI } from '@/services/music';

// Au démarrage de l'app
useEffect(() => {
  const clientId = process.env.SPOTIFY_CLIENT_ID || '';
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'podcut://callback';

  SpotifyAuth.configure(clientId, redirectUri);
  SpotifyAPI.initialize();
}, []);
```

### 2. SoundCloud

#### Obtenir les credentials
1. Allez sur https://developers.soundcloud.com/
2. Créez une nouvelle application
3. Configurez le Redirect URI: `podcut://callback`
4. Copiez votre `Client ID` et `Client Secret`

#### Configuration dans l'app
Ajoutez dans votre fichier `/app/_layout.tsx` ou équivalent:

```typescript
import { SoundCloudAuth, SoundCloudAPI } from '@/services/music';

// Au démarrage de l'app
useEffect(() => {
  const clientId = process.env.SOUNDCLOUD_CLIENT_ID || '';
  const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET || '';
  const redirectUri = process.env.SOUNDCLOUD_REDIRECT_URI || 'podcut://callback';

  SoundCloudAuth.configure(clientId, clientSecret, redirectUri);
  SoundCloudAPI.initialize(clientId);
}, []);
```

### 3. Configuration du fichier .env

Créez un fichier `.env` à la racine:

```env
# Spotify
SPOTIFY_CLIENT_ID=votre_client_id
SPOTIFY_REDIRECT_URI=podcut://callback

# SoundCloud
SOUNDCLOUD_CLIENT_ID=votre_client_id
SOUNDCLOUD_CLIENT_SECRET=votre_client_secret
SOUNDCLOUD_REDIRECT_URI=podcut://callback
```

### 4. Configuration app.json

Ajoutez le scheme dans `/app.json`:

```json
{
  "expo": {
    "scheme": "podcut",
    "ios": {
      "bundleIdentifier": "com.yourcompany.podcut"
    },
    "android": {
      "package": "com.yourcompany.podcut"
    }
  }
}
```

## Utilisation

### Exemple 1: Authentification Spotify

```typescript
import { useSpotifyOAuth } from '@/hooks/useSpotifyOAuth';

function SpotifyLoginButton() {
  const { isAuthenticated, isLoading, user, error, login, logout } = useSpotifyOAuth();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isAuthenticated) {
    return (
      <View>
        <Text>Connecté en tant que: {user?.display_name}</Text>
        {user?.product === 'premium' && <Text>✅ Premium</Text>}
        <Button title="Déconnexion" onPress={logout} />
      </View>
    );
  }

  return (
    <View>
      <Button title="Se connecter avec Spotify" onPress={login} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

### Exemple 2: Recherche et lecture Spotify

```typescript
import { useSpotifyOAuth } from '@/hooks/useSpotifyOAuth';
import { useState } from 'react';

function SpotifySearch() {
  const { searchTracks, play, pause } = useSpotifyOAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const { tracks } = await searchTracks(query);
    setResults(tracks);
  };

  const handlePlay = async (trackUri: string) => {
    try {
      await play(trackUri);
    } catch (err) {
      // Gérer l'erreur (ex: Premium requis)
      console.error(err);
    }
  };

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher..."
      />
      <Button title="Rechercher" onPress={handleSearch} />

      <FlatList
        data={results}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePlay(item.uri)}>
            <Text>{item.title} - {item.artist}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

### Exemple 3: Authentification SoundCloud

```typescript
import { useSoundCloud } from '@/hooks/useSoundCloud';

function SoundCloudLoginButton() {
  const { isAuthenticated, isLoading, error, login, logout } = useSoundCloud();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isAuthenticated) {
    return <Button title="Déconnexion" onPress={logout} />;
  }

  return (
    <View>
      <Button title="Se connecter avec SoundCloud" onPress={login} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

### Exemple 4: Lecture SoundCloud

```typescript
import { useSoundCloud } from '@/hooks/useSoundCloud';
import { useState } from 'react';

function SoundCloudPlayer() {
  const { searchTracks, play, pause, resume, stop } = useSoundCloud();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSearch = async (query: string) => {
    const { tracks } = await searchTracks(query);
    return tracks;
  };

  const handlePlay = async (track: MusicTrack) => {
    await play(track);
    setIsPlaying(true);
  };

  const handlePause = async () => {
    await pause();
    setIsPlaying(false);
  };

  const handleResume = async () => {
    await resume();
    setIsPlaying(true);
  };

  return (
    <View>
      {isPlaying ? (
        <Button title="Pause" onPress={handlePause} />
      ) : (
        <Button title="Reprendre" onPress={handleResume} />
      )}
      <Button title="Stop" onPress={stop} />
    </View>
  );
}
```

### Exemple 5: Utilisation directe des services

```typescript
import {
  SpotifyAuth,
  SpotifyAPI,
  SpotifyPlayer,
  SoundCloudAuth,
  SoundCloudAPI,
  SoundCloudPlayer
} from '@/services/music';

// Spotify
async function playSpotifyTrack() {
  // Auth
  await SpotifyAuth.login();

  // Search
  const results = await SpotifyAPI.searchTracks('Daft Punk');

  // Play
  await SpotifyPlayer.play(results.tracks[0].uri);
}

// SoundCloud
async function playSoundCloudTrack() {
  // Auth
  await SoundCloudAuth.login();

  // Search
  const results = await SoundCloudAPI.searchTracks('Flume');
  const track = results.tracks[0];

  // Play
  await SoundCloudPlayer.play(track);
}
```

## Tests manuels suggérés

### Test 1: Flow OAuth Spotify
```bash
✅ L'app ouvre le navigateur
✅ L'utilisateur se connecte
✅ Redirection vers l'app
✅ Token sauvegardé dans SecureStore
✅ Profil utilisateur chargé
```

### Test 2: Refresh Token Spotify
```bash
✅ Simuler expiration (modifier expiresAt dans SecureStore)
✅ Faire une requête API
✅ Token automatiquement rafraîchi
✅ Requête réussie
```

### Test 3: Playback Spotify (Premium requis)
```bash
✅ Ouvrir Spotify sur un device
✅ Lancer play() depuis l'app
✅ Musique joue sur le device
✅ pause() fonctionne
✅ seek() fonctionne
```

### Test 4: Flow OAuth SoundCloud
```bash
✅ L'app ouvre le navigateur
✅ L'utilisateur se connecte
✅ Redirection vers l'app
✅ Token sauvegardé dans SecureStore
```

### Test 5: Streaming SoundCloud
```bash
✅ Rechercher un track
✅ Récupérer l'URL HLS
✅ Lancer le streaming avec expo-av
✅ Audio joue correctement
✅ Contrôles (pause, resume, seek) fonctionnent
```

### Test 6: Gestion des erreurs
```bash
✅ Test sans authentification → MusicServiceError
✅ Test rate limiting → RATE_LIMIT error
✅ Test token expiré → Auto-refresh
✅ Test sans refresh token → NO_REFRESH_TOKEN error
✅ Test Spotify sans Premium → PREMIUM_REQUIRED error
✅ Test SoundCloud sans device → NO_DEVICE error
```

## Limitations connues

### Spotify
- **Premium requis**: Le contrôle de playback (play, pause, seek) nécessite Spotify Premium
- **Device actif**: Un device Spotify doit être actif (app mobile/desktop ouverte)
- **Rate limiting**: 30 requêtes par seconde max
- **Web Playback SDK**: Non disponible sur React Native (utiliser les endpoints de contrôle)

### SoundCloud
- **API v2**: Documentation limitée, certains endpoints peuvent changer
- **Streaming**: Requiert authentification pour obtenir les URLs HLS
- **Rate limiting**: Limites non documentées publiquement
- **Artwork**: URLs en basse résolution par défaut (utiliser `-t500x500`)

## Sécurité

### ✅ Bonnes pratiques implémentées
- PKCE (Proof Key for Code Exchange) pour les deux services
- Tokens stockés dans `expo-secure-store` (chiffrement hardware)
- Auto-refresh des tokens avant expiration
- Validation des tokens avec buffer de 5 minutes
- Gestion des erreurs avec types stricts
- Logging centralisé avec Logger

### ⚠️ À ne PAS faire
- Ne JAMAIS stocker les tokens dans AsyncStorage
- Ne JAMAIS commit les `.env` avec des credentials
- Ne JAMAIS exposer les tokens dans les logs en production
- Ne JAMAIS utiliser le client secret en frontend (SoundCloud: optionnel avec PKCE)

## Troubleshooting

### Erreur: "Not authenticated"
- Vérifier que `configure()` a été appelé au démarrage
- Vérifier les credentials dans `.env`
- Vérifier le Redirect URI dans le dashboard

### Erreur: "PREMIUM_REQUIRED" (Spotify)
- L'utilisateur doit avoir Spotify Premium
- Utiliser uniquement les endpoints de recherche pour les comptes gratuits

### Erreur: "NO_DEVICE" (Spotify)
- Ouvrir l'app Spotify sur un appareil
- Lancer une musique pour activer le device
- Réessayer le playback depuis l'app

### Erreur: "Rate limit exceeded"
- Attendre le délai indiqué dans `retryAfter`
- Implémenter un système de cache pour réduire les requêtes
- Utiliser le debouncing pour les recherches

### Erreur: "Failed to exchange code"
- Vérifier que le Redirect URI match exactement
- Vérifier les scopes configurés
- Vérifier que PKCE est activé dans le dashboard (Spotify)

## Commandes utiles

```bash
# Installer les dépendances (déjà installées)
npm install axios expo-auth-session expo-crypto expo-secure-store expo-av

# Démarrer l'app
npm start

# Effacer les tokens en développement
# Utiliser expo-secure-store deleteItemAsync() dans une fonction debug
```

## Prochaines étapes

1. **Tester l'intégration**
   - Obtenir les credentials API
   - Configurer le `.env`
   - Tester le flow OAuth

2. **Créer les écrans UI**
   - Écran de connexion
   - Écran de recherche
   - Player UI

3. **Implémenter les features avancées**
   - Playlists Spotify/SoundCloud
   - Likes/Favorites
   - Historique de lecture
   - Cache des résultats de recherche

4. **Monitoring**
   - Intégrer Sentry dans Logger
   - Tracker les erreurs OAuth
   - Analytics sur l'utilisation des services

## Support

Pour toute question ou problème:
- Documentation Spotify: https://developer.spotify.com/documentation/web-api
- Documentation SoundCloud: https://developers.soundcloud.com/docs/api
- expo-auth-session: https://docs.expo.dev/versions/latest/sdk/auth-session/
- expo-secure-store: https://docs.expo.dev/versions/latest/sdk/securestore/
