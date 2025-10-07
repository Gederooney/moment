# Authentification OAuth 2.0 PKCE - Spotify & SoundCloud

Documentation complète de l'implémentation OAuth pour PodCut mobile.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Utilisation](#utilisation)
6. [API Reference](#api-reference)
7. [Sécurité](#sécurité)
8. [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

### Fonctionnalités

- **OAuth 2.0 PKCE** pour Spotify (conformité avril 2025)
- **OAuth 2.1 PKCE** pour SoundCloud (conformité novembre 2025)
- **Stockage sécurisé** avec expo-secure-store (hardware-backed encryption)
- **Auto-refresh** des tokens avec buffer de 5 minutes
- **Context API** pour gestion d'état réactive
- **Type-safe** avec TypeScript strict mode
- **Persistence** des sessions entre redémarrages

### Technologies

- React Native + Expo ~54.0.9
- expo-auth-session (OAuth flow)
- expo-crypto (PKCE code generation)
- expo-secure-store (token encryption)
- AsyncStorage (fallback)
- TypeScript 5.9.2

---

## Architecture

### Structure des fichiers

```
├── types/
│   └── auth.types.ts              # Types TypeScript
├── config/
│   └── oauth.config.ts            # Configuration OAuth
├── services/
│   ├── music/
│   │   ├── common/
│   │   │   ├── types.ts           # Types communs
│   │   │   └── SecureStorage.ts   # Stockage sécurisé
│   │   ├── spotify/
│   │   │   ├── SpotifyAuth.ts     # OAuth Spotify
│   │   │   ├── SpotifyAPI.ts      # Client API
│   │   │   └── types.ts           # Types Spotify
│   │   └── soundcloud/
│   │       ├── SoundCloudAuth.ts  # OAuth SoundCloud
│   │       ├── SoundCloudAPI.ts   # Client API
│   │       └── types.ts           # Types SoundCloud
├── contexts/
│   └── AuthContext.tsx            # Context React
├── hooks/
│   └── useAuth.ts                 # Hook personnalisé
└── utils/
    └── tokenStorage.ts            # Utilitaires tokens
```

### Flux d'authentification

```
1. User clicks "Login with Spotify"
   ↓
2. Generate PKCE code_verifier & code_challenge (SHA256)
   ↓
3. Open OAuth authorization page (expo-web-browser)
   ↓
4. User authorizes app
   ↓
5. Redirect to app with authorization code
   ↓
6. Exchange code for access_token + refresh_token
   ↓
7. Save tokens securely (expo-secure-store)
   ↓
8. Update AuthContext state
   ↓
9. Auto-refresh every minute (if needed)
```

---

## Installation

### Packages requis

Tous les packages nécessaires sont déjà installés dans le projet:

```json
{
  "expo-auth-session": "^7.0.8",
  "expo-crypto": "^15.0.7",
  "expo-secure-store": "^15.0.7",
  "expo-web-browser": "^15.0.8",
  "@react-native-async-storage/async-storage": "^2.2.0"
}
```

### Configuration Expo

Vérifier que `app.json` contient le scheme correct:

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

---

## Configuration

### 1. Obtenir les credentials

#### Spotify

1. Aller sur [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Créer une nouvelle application
3. Ajouter Redirect URI: `podcut://callback`
4. Copier le Client ID

#### SoundCloud

1. Aller sur [SoundCloud Developer Portal](https://developers.soundcloud.com/)
2. Créer une application (si API ouverte)
3. Obtenir Client ID et Client Secret
4. Ajouter Redirect URI: `podcut://callback`

**Note**: L'API SoundCloud est actuellement fermée aux nouvelles applications. Voir [Workarounds](#workarounds).

### 2. Variables d'environnement

Créer un fichier `.env` à la racine:

```bash
# Spotify OAuth
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here

# SoundCloud OAuth
EXPO_PUBLIC_SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id_here
EXPO_PUBLIC_SOUNDCLOUD_CLIENT_SECRET=your_soundcloud_secret_here
```

**Important**: Ajouter `.env` au `.gitignore` pour ne jamais committer les credentials.

### 3. Configuration du projet

Le fichier `/config/oauth.config.ts` lit automatiquement les variables d'environnement.

Pour valider la configuration:

```typescript
import { validateOAuthConfig } from '@/config/oauth.config';

const { isValid, errors } = validateOAuthConfig();
console.log('Config valid:', isValid);
if (!isValid) {
  console.error('Errors:', errors);
}
```

---

## Utilisation

### Setup de base

#### 1. Wrapper l'application avec AuthProvider

```tsx
// app/_layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider autoRefresh={true}>
      {/* Votre app */}
    </AuthProvider>
  );
}
```

#### 2. Utiliser le hook dans un composant

```tsx
// components/LoginScreen.tsx
import { useAuth } from '@/hooks/useAuth';

export function LoginScreen() {
  const {
    isSpotifyAuthenticated,
    isSpotifyLoading,
    loginSpotify,
    logoutSpotify,
    spotifyError,
  } = useAuth();

  const handleLogin = async () => {
    try {
      await loginSpotify();
      // Succès - rediriger vers l'app
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isSpotifyAuthenticated) {
    return <Text>Authentifié!</Text>;
  }

  return (
    <View>
      <Button
        title="Login with Spotify"
        onPress={handleLogin}
        disabled={isSpotifyLoading}
      />
      {spotifyError && <Text style={{ color: 'red' }}>{spotifyError}</Text>}
    </View>
  );
}
```

### Exemples avancés

#### Recherche de tracks avec auto-refresh

```tsx
import { useAuth } from '@/hooks/useAuth';
import { SpotifyAPI } from '@/services/music/spotify/SpotifyAPI';

export function SearchScreen() {
  const { isSpotifyAuthenticated, getAccessToken } = useAuth();
  const [results, setResults] = useState([]);

  const search = async (query: string) => {
    if (!isSpotifyAuthenticated) {
      alert('Please login first');
      return;
    }

    try {
      // getAccessToken auto-refresh si nécessaire
      const token = await getAccessToken(MusicService.SPOTIFY);

      if (!token) {
        alert('Session expired, please login again');
        return;
      }

      const data = await SpotifyAPI.searchTracks(query);
      setResults(data.tracks);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <View>
      <TextInput onSubmitEditing={(e) => search(e.nativeEvent.text)} />
      <FlatList data={results} renderItem={({ item }) => <TrackItem track={item} />} />
    </View>
  );
}
```

#### Utilisation avec un service spécifique

```tsx
import { useServiceAuth } from '@/hooks/useAuth';
import { MusicService } from '@/types/auth.types';

export function SpotifyProfile() {
  const spotify = useServiceAuth(MusicService.SPOTIFY);

  useEffect(() => {
    if (spotify.isAuthenticated) {
      loadProfile();
    }
  }, [spotify.isAuthenticated]);

  const loadProfile = async () => {
    const token = await spotify.getToken();
    // Utiliser le token pour les API calls
  };

  if (!spotify.isAuthenticated) {
    return (
      <Button title="Login" onPress={spotify.login} />
    );
  }

  return (
    <View>
      <Text>{spotify.user?.displayName}</Text>
      <Button title="Logout" onPress={spotify.logout} />
    </View>
  );
}
```

#### Gestion des erreurs

```tsx
import { useAuthErrors } from '@/hooks/useAuth';

export function AuthErrorBanner() {
  const { hasErrors, errors } = useAuthErrors();

  if (!hasErrors) {
    return null;
  }

  return (
    <View style={{ backgroundColor: 'red' }}>
      {errors.map(({ service, error }) => (
        <Text key={service} style={{ color: 'white' }}>
          {service}: {error}
        </Text>
      ))}
    </View>
  );
}
```

---

## API Reference

### Hook useAuth()

```typescript
const {
  // États
  isSpotifyAuthenticated: boolean;
  isSpotifyLoading: boolean;
  spotifyError: string | null;
  spotifyUser: AuthUser | null;

  isSoundCloudAuthenticated: boolean;
  isSoundCloudLoading: boolean;
  soundCloudError: string | null;
  soundCloudUser: AuthUser | null;

  // Méthodes
  loginSpotify: () => Promise<void>;
  logoutSpotify: () => Promise<void>;
  loginSoundCloud: () => Promise<void>;
  logoutSoundCloud: () => Promise<void>;

  // Génériques
  isAuthenticated: (service: MusicService) => boolean;
  getAccessToken: (service: MusicService) => Promise<string | null>;
  logout: (service: MusicService) => Promise<void>;
  logoutAll: () => Promise<void>;

  // Utilitaires
  hasAnyAuthentication: boolean;
  allServicesAuthenticated: boolean;
  authenticatedServices: MusicService[];
} = useAuth();
```

### SpotifyAuth

```typescript
// Login
await SpotifyAuth.login();

// Logout
await SpotifyAuth.logout();

// Refresh token
await SpotifyAuth.refreshToken(refreshToken);

// Check auth
const isAuth = await SpotifyAuth.isAuthenticated();

// Get tokens
const tokens = await SpotifyAuth.getTokens();
```

### SoundCloudAuth

Même API que SpotifyAuth.

### Token Storage

```typescript
import {
  saveToken,
  getToken,
  removeToken,
  validateToken,
  getValidAccessToken,
  clearAllTokens,
} from '@/utils/tokenStorage';

// Sauvegarder
await saveToken(MusicService.SPOTIFY, tokens);

// Récupérer
const token = await getToken(MusicService.SPOTIFY);

// Valider
const validation = validateToken(token);
if (!validation.isValid) {
  // Token expiré
}

// Récupérer avec auto-refresh
const accessToken = await getValidAccessToken(
  MusicService.SPOTIFY,
  (refreshToken) => SpotifyAuth.refreshToken(refreshToken)
);

// Tout supprimer
await clearAllTokens();
```

---

## Sécurité

### Stockage des tokens

1. **expo-secure-store**: Chiffrement hardware (iOS Keychain, Android Keystore)
2. **Fallback AsyncStorage**: Si SecureStore indisponible (simulateurs)
3. **Pas de credentials dans le code**: Utilisation variables d'environnement

### PKCE (Proof Key for Code Exchange)

- **Code Verifier**: 32 bytes random (256 bits)
- **Code Challenge**: SHA256(verifier) base64url encoded
- **Method**: S256 (SHA256)
- Protection contre interception du code d'autorisation

### Auto-refresh

- Buffer de 5 minutes avant expiration
- Refresh automatique en background
- Maximum 3 tentatives avec délai exponentiel
- Callback en cas d'échec pour re-authentication

### Best practices

1. Ne jamais logger les tokens complets
2. Invalider les tokens côté serveur lors du logout
3. Utiliser HTTPS pour toutes les requêtes
4. Implémenter rate limiting côté client
5. Vérifier l'expiration avant chaque requête

---

## Troubleshooting

### Token refresh échoue

**Symptômes**: Token expired error après quelques heures

**Causes**:
- Refresh token invalide ou expiré
- Client ID changé côté serveur
- Rate limit atteint

**Solutions**:
```typescript
// Forcer re-authentication
await logout(MusicService.SPOTIFY);
await loginSpotify();
```

### SecureStore not available

**Symptômes**: Warning "Using AsyncStorage fallback"

**Causes**:
- Simulateur iOS/Android
- Pas de hardware encryption disponible

**Solutions**:
- Normal sur simulateurs
- Utiliser device réel pour tests de production
- AsyncStorage fonctionne mais moins sécurisé

### Redirect URI mismatch

**Symptômes**: "redirect_uri mismatch" error

**Solutions**:
1. Vérifier `app.json` scheme: `"scheme": "podcut"`
2. Vérifier Spotify Dashboard Redirect URIs: `podcut://callback`
3. Tester avec: `console.log(makeRedirectUri())`

### Login popup ne s'ouvre pas

**Symptômes**: Rien ne se passe au clic

**Solutions**:
1. Vérifier que `expo-web-browser` est bien installé
2. Ajouter `WebBrowser.maybeCompleteAuthSession()` au début de l'app
3. Tester sur device réel (pas web)

### SoundCloud API fermée

**Workarounds**:
1. Extraire client_id depuis le site web (Inspect Network)
2. Utiliser un client_id existant (dev only)
3. Contacter SoundCloud pour demander accès API
4. Utiliser Spotify uniquement

### Rate limit atteint

**Symptômes**: 429 Too Many Requests

**Solutions Spotify**:
- Mode dev: 180 req/min
- Implémenter cache local
- Debounce les recherches
- Utiliser pagination

**Solutions SoundCloud**:
- 50 tokens/12h
- 30 tokens/h par IP
- Utiliser token longue durée (`non-expiring` scope)

---

## Ressources

### Documentation officielle

- [Spotify OAuth PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [SoundCloud OAuth 2.1](https://developers.soundcloud.com/blog/oauth-migration/)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)

### Fichiers de documentation

- `/OAUTH_INTEGRATION_GUIDE.md` - Guide complet
- `/OAUTH_TECHNICAL_SUMMARY.md` - Résumé technique
- `/QUICK_START_OAUTH.md` - Démarrage rapide
- `/docs/UNIVERSAL_PLAYER_RESEARCH.md` - Recherche approfondie

### Support

Pour questions ou problèmes:
1. Vérifier les logs avec `Logger.info()` / `Logger.error()`
2. Consulter la documentation complète
3. Tester avec des credentials valides
4. Vérifier les changements 2025 (PKCE obligatoire)

---

## Changelog

### Version 1.0.0 (2 octobre 2025)

- Implémentation initiale OAuth 2.0 PKCE Spotify
- Implémentation OAuth 2.1 PKCE SoundCloud
- Context API avec auto-refresh
- Types TypeScript complets
- Stockage sécurisé avec encryption
- Documentation complète

### Conformité 2025

- ✅ Spotify: Universal Linking (avril 2025)
- ✅ SoundCloud: OAuth 2.1 migration (octobre 2024)
- ✅ PKCE obligatoire pour les deux services
- ⚠️ SoundCloud: AAC HLS migration (novembre 2025) - À implémenter

---

## License

Propriétaire - PodCut Mobile
