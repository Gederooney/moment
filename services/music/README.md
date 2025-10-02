# Services Musicaux - Spotify & SoundCloud

Architecture OAuth PKCE pour l'authentification et l'intégration des services musicaux.

## Structure

```
music/
├── common/                      # Types et utilitaires partagés
│   ├── types.ts                # OAuthTokens, MusicTrack, etc.
│   └── SecureStorage.ts        # Stockage sécurisé des tokens
│
├── spotify/                    # Service Spotify
│   ├── types.ts                # Types API Spotify
│   ├── SpotifyAuth.ts          # OAuth PKCE
│   ├── SpotifyAPI.ts           # Client API
│   └── SpotifyPlayer.ts        # Contrôle playback
│
├── soundcloud/                 # Service SoundCloud
│   ├── types.ts                # Types API SoundCloud
│   ├── SoundCloudAuth.ts       # OAuth 2.1 PKCE
│   ├── SoundCloudAPI.ts        # Client API
│   └── SoundCloudPlayer.ts     # Streaming HLS
│
├── index.ts                    # Export centralisé
├── init.ts                     # Initialisation
└── README.md                   # Ce fichier
```

## Utilisation

### 1. Initialisation (au démarrage de l'app)

```typescript
import {
  initializeMusicServices,
  getMusicServicesConfigFromEnv,
} from '@/services/music/init';

// Dans app/_layout.tsx
useEffect(() => {
  const config = getMusicServicesConfigFromEnv();
  initializeMusicServices(config);
}, []);
```

### 2. Avec les hooks (recommandé)

```typescript
import { useSpotifyOAuth } from '@/hooks/useSpotifyOAuth';
import { useSoundCloud } from '@/hooks/useSoundCloud';

// Spotify
const { login, searchTracks, play } = useSpotifyOAuth();

// SoundCloud
const { login, searchTracks, play } = useSoundCloud();
```

### 3. Sans hooks (services directs)

```typescript
import {
  SpotifyAuth,
  SpotifyAPI,
  SoundCloudAuth,
  SoundCloudAPI,
} from '@/services/music';

// Spotify
await SpotifyAuth.login();
const results = await SpotifyAPI.searchTracks('query');

// SoundCloud
await SoundCloudAuth.login();
const tracks = await SoundCloudAPI.searchTracks('query');
```

## Fonctionnalités

### Spotify
- OAuth 2.0 avec PKCE (SHA256)
- Recherche de tracks
- Profil utilisateur
- Contrôle playback (Premium requis)
- Auto-refresh des tokens

### SoundCloud
- OAuth 2.1 avec PKCE obligatoire
- Recherche de tracks
- Streaming HLS avec expo-av
- Auto-refresh des tokens

## Sécurité

- **PKCE**: Protection contre l'interception de code
- **expo-secure-store**: Chiffrement hardware des tokens
- **Auto-refresh**: Renouvellement automatique avant expiration
- **Validation**: Vérification des tokens avec buffer de 5 min

## Documentation

Pour plus d'informations, consultez:
- `/QUICK_START_OAUTH.md` - Démarrage rapide
- `/OAUTH_INTEGRATION_GUIDE.md` - Guide complet
- `/OAUTH_TECHNICAL_SUMMARY.md` - Résumé technique
- `/MUSIC_SERVICES_EXAMPLES.tsx` - Exemples de composants
