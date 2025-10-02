# Guide d'Intégration Spotify pour PodCut

## Vue d'ensemble

Cette intégration implémente l'authentification Spotify OAuth 2.0 avec PKCE (Proof Key for Code Exchange) pour une sécurité maximale sur mobile.

## Architecture

```
services/audio/
├── SecureStorage.ts           # Stockage sécurisé (Keychain/Keystore)
└── spotify/
    ├── SpotifyAuth.ts         # Authentification OAuth PKCE
    ├── SpotifyAPI.ts          # API Web Spotify
    ├── SpotifyPlayer.ts       # Contrôle de lecture
    ├── types.ts               # Types TypeScript
    └── index.ts               # Exports

config/
└── spotify.config.ts          # Configuration centralisée

hooks/
└── useSpotify.ts              # Hook React pour composants
```

## Configuration

### 1. Créer une Application Spotify

1. Allez sur [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Cliquez sur "Create App"
3. Remplissez les informations:
   - **App name**: PodCut
   - **App description**: Audio moments extraction tool
   - **Redirect URI**: `podcut://callback`
4. Notez votre **Client ID**

### 2. Configuration Environnement

Créez un fichier `.env` à la racine de `/mobile`:

```bash
cp .env.example .env
```

Remplissez avec vos credentials:

```env
SPOTIFY_CLIENT_ID=votre_client_id_ici
SPOTIFY_REDIRECT_URI=podcut://callback
SPOTIFY_SCOPES=user-read-private user-read-email user-modify-playback-state user-read-playback-state streaming
```

### 3. Installation

Les dépendances sont déjà installées:

```bash
# Déjà installé:
# - expo-auth-session (OAuth)
# - expo-crypto (PKCE)
# - expo-web-browser (Navigation OAuth)
# - expo-secure-store (Stockage tokens)
# - axios (HTTP client)
```

## Utilisation

### Méthode 1: Utiliser le Hook React (Recommandé)

```typescript
import { useSpotify } from '../hooks/useSpotify';

export const MyComponent = () => {
  const {
    isAuthenticated,
    isLoading,
    isPremium,
    userProfile,
    login,
    logout,
    search,
    play,
  } = useSpotify();

  const handleLogin = async () => {
    try {
      await login();
      console.log('Logged in!', userProfile);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSearch = async () => {
    const results = await search('The Beatles');
    console.log('Found tracks:', results);
  };

  return (
    <View>
      {!isAuthenticated ? (
        <Button title="Login with Spotify" onPress={handleLogin} />
      ) : (
        <>
          <Text>Welcome {userProfile?.display_name}</Text>
          <Text>Account: {isPremium ? 'Premium' : 'Free'}</Text>
          <Button title="Search" onPress={handleSearch} />
          <Button title="Logout" onPress={logout} />
        </>
      )}
    </View>
  );
};
```

### Méthode 2: Utiliser les Services Directement

```typescript
import { SpotifyAuth, SpotifyAPI, SpotifyPlayer } from '../services/audio/spotify';
import { SPOTIFY_CONFIG } from '../config/spotify.config';

// Initialiser les services
const auth = SpotifyAuth.getInstance(SPOTIFY_CONFIG);
const api = SpotifyAPI.getInstance(auth);
const player = SpotifyPlayer.getInstance(auth, api);

// Authentification
const tokens = await auth.authenticate();
console.log('Access token:', tokens.accessToken);

// Recherche
const tracks = await api.search('The Beatles');
console.log('Found:', tracks.length, 'tracks');

// Lecture (Premium requis)
const isPremium = await api.checkPremiumStatus();
if (isPremium) {
  await player.play('spotify:track:6rqhFgbbKwnb9MLmUQDhG6');
}

// Déconnexion
await auth.logout();
```

## Fonctionnalités Implémentées

### SpotifyAuth

- **authenticate()**: Lance le flux OAuth PKCE
- **refreshAccessToken()**: Rafraîchit le token automatiquement
- **getValidAccessToken()**: Récupère un token valide (refresh si nécessaire)
- **isAuthenticated()**: Vérifie si l'utilisateur est authentifié
- **logout()**: Déconnecte et supprime les tokens

### SpotifyAPI

- **search(query, limit)**: Recherche de tracks
- **getTrackMetadata(trackId)**: Métadonnées d'une track
- **getUserProfile()**: Profil utilisateur
- **checkPremiumStatus()**: Vérifie si compte Premium
- **getRecommendations(seedTracks)**: Recommandations basées sur des tracks

### SpotifyPlayer

- **play(trackUri, deviceId?)**: Lance la lecture
- **pause()**: Met en pause
- **resume()**: Reprend la lecture
- **getCurrentTrack()**: Track en cours de lecture
- **getPlaybackState()**: État complet de lecture
- **getAvailableDevices()**: Liste des devices disponibles
- **transferPlayback(deviceId)**: Transfère vers un autre device

## Sécurité

### PKCE Flow

1. **Génération Code Verifier**: 32 bytes aléatoires (base64url)
2. **Génération Code Challenge**: SHA256(verifier) en base64url
3. **Authorization**: Envoi du challenge à Spotify
4. **Token Exchange**: Envoi du verifier pour récupérer tokens

### Stockage Sécurisé

- **iOS**: Keychain (encryption hardware)
- **Android**: Keystore (encryption hardware)
- Aucun token en AsyncStorage ou localStorage

### Refresh Automatique

Les tokens sont automatiquement rafraîchis 1 minute avant expiration grâce aux intercepteurs Axios.

## Limitations

### Compte Free vs Premium

| Fonctionnalité | Free | Premium |
|----------------|------|---------|
| Recherche | ✅ | ✅ |
| Métadonnées | ✅ | ✅ |
| Profil utilisateur | ✅ | ✅ |
| Lecture audio | ❌ | ✅ |
| Contrôle lecture | ❌ | ✅ |

**Solution pour Free**: Utilisez `preview_url` (30 secondes) avec expo-av.

## Tests

### Test Unitaire

```bash
# Vérifier la compilation TypeScript
cd /Users/gedeonrony/Desktop/coding/podcut/mobile
pnpm tsc --noEmit
```

### Test Manuel

Utilisez le composant exemple:

```typescript
import { SpotifyAuthExample } from './components/SpotifyAuthExample';

// Dans votre App.tsx ou screen
<SpotifyAuthExample />
```

### Checklist de Test

- [ ] Login avec Spotify réussit
- [ ] Token sauvegardé dans SecureStore
- [ ] Profil utilisateur récupéré
- [ ] Statut Premium détecté
- [ ] Recherche retourne des résultats
- [ ] Token auto-refresh fonctionne
- [ ] Logout supprime les tokens
- [ ] Réouverture app = toujours authentifié

## Logs et Debugging

Tous les services utilisent le Logger centralisé:

```typescript
import { Logger } from '../services/logger/Logger';

// Les logs apparaissent dans la console en dev
// En production, ils sont envoyés à Sentry/Crashlytics

// Visualiser les logs en mémoire
const logs = Logger.getLogs();
console.log(logs);
```

## Gestion d'Erreurs

Toutes les fonctions async gèrent les erreurs:

```typescript
try {
  await spotify.login();
} catch (error) {
  if (error.message.includes('cancelled')) {
    // Utilisateur a annulé
  } else if (error.message.includes('Premium required')) {
    // Compte non-premium
  } else {
    // Autre erreur
  }
}
```

## Prochaines Étapes

### Phase 2B: Lecture Audio
- [ ] Implémenter fallback expo-av pour comptes Free
- [ ] Support preview_url (30s)
- [ ] Cache audio local

### Phase 2C: Interface Utilisateur
- [ ] Écran login Spotify
- [ ] Écran recherche
- [ ] Player UI

### Phase 2D: Tests
- [ ] Tests unitaires Jest
- [ ] Tests d'intégration
- [ ] Tests E2E avec Detox

## Ressources

- [Spotify Web API Reference](https://developer.spotify.com/documentation/web-api)
- [OAuth 2.0 PKCE Spec](https://oauth.net/2/pkce/)
- [Expo Auth Session Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo Secure Store Docs](https://docs.expo.dev/versions/latest/sdk/securestore/)

## Support

Pour toute question ou problème:
1. Vérifiez les logs avec `Logger.getLogs()`
2. Consultez la documentation Spotify
3. Vérifiez que CLIENT_ID est configuré
4. Vérifiez que redirect URI match exactement

---

**Statut**: ✅ Phase 2A Complète
**Date**: 2025-10-01
**Version**: 1.0.0
