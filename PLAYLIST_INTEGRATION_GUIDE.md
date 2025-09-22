# Guide d'intégration du système de playlist PodCut

## Vue d'ensemble

Le système de playlist de PodCut permet aux utilisateurs de créer et gérer des playlists pour les longs trajets. Il inclut des fonctionnalités avancées comme le shuffle, la répétition, l'auto-play et la persistance des données.

## Architecture

### Fichiers créés

1. **Types** (`/types/playlist.ts`)
   - Interfaces TypeScript pour Playlist, PlaylistVideo, PlaylistSettings
   - Types pour les actions et métriques

2. **Service de stockage** (`/services/playlistStorage.ts`)
   - Persistance avec AsyncStorage
   - Migration de schéma
   - Import/export de playlists

3. **Contexte principal** (`/contexts/PlaylistContext.tsx`)
   - État global des playlists
   - Actions CRUD
   - Navigation dans les playlists

4. **Hook personnalisé** (`/hooks/usePlaylist.ts`)
   - Interface simplifiée pour les composants
   - Méthodes utilitaires
   - Calculs dérivés

5. **Tests** (`/tests/playlist.test.ts`)
   - Tests de validation du système
   - Scénarios de test manuels

6. **Exemple** (`/examples/PlaylistExample.tsx`)
   - Démonstration complète des fonctionnalités
   - Interface utilisateur de référence

## Installation et configuration

### 1. Wrapper votre app avec le Provider

```tsx
import { PlaylistProvider } from './contexts/PlaylistContext';

export default function App() {
  return (
    <PlaylistProvider>
      {/* Votre app */}
    </PlaylistProvider>
  );
}
```

### 2. Intégrer avec YouTubePlayer

```tsx
import { usePlaylist } from './hooks/usePlaylist';
import { YouTubePlayerComponent } from './components/YouTubePlayer';

function VideoPlayer() {
  const { currentVideo, hasNextVideo, playNext } = usePlaylist();

  const handleVideoEnd = async () => {
    if (hasNextVideo) {
      await playNext();
    }
  };

  return (
    <YouTubePlayerComponent
      videoId={currentVideo?.videoId || null}
      onEnd={handleVideoEnd}
      autoplay={true}
    />
  );
}
```

## Utilisation du hook usePlaylist

### Données disponibles

```tsx
const {
  // État
  playlists,              // Toutes les playlists
  activePlaylist,         // Playlist actuellement active
  currentVideo,           // Vidéo en cours de lecture
  currentVideoIndex,      // Index de la vidéo courante
  isPlaying,             // État de lecture

  // Informations dérivées
  hasNextVideo,          // Peut aller à la vidéo suivante
  hasPreviousVideo,      // Peut aller à la vidéo précédente
  activePlaylistMetrics, // Métriques de la playlist active

  // Actions de base
  createPlaylist,        // Créer une playlist
  deletePlaylist,        // Supprimer une playlist
  addVideoToPlaylist,    // Ajouter une vidéo
  removeVideoFromPlaylist, // Retirer une vidéo

  // Navigation
  setActivePlaylist,     // Activer une playlist
  playNext,             // Vidéo suivante
  playPrevious,         // Vidéo précédente

  // Paramètres
  toggleShuffle,        // Activer/désactiver le shuffle
  setRepeatMode,        // none | one | all

  // Utilitaires
  formatDuration,       // Formater la durée (secondes → mm:ss)
  searchPlaylists,      // Rechercher dans les playlists
  duplicatePlaylist,    // Dupliquer une playlist
} = usePlaylist();
```

### Exemples d'utilisation

#### Créer une playlist

```tsx
const handleCreatePlaylist = async () => {
  try {
    const playlistId = await createPlaylist('Ma playlist de voyage');
    console.log('Playlist créée:', playlistId);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};
```

#### Ajouter une vidéo

```tsx
const handleAddVideo = async (playlistId: string, youtubeUrl: string) => {
  const videoId = extractVideoIdFromUrl(youtubeUrl);

  try {
    await addVideoToPlaylist(playlistId, {
      videoId,
      title: 'Titre de la vidéo',
      author: 'Nom de l\'auteur',
      url: youtubeUrl,
      duration: 300, // en secondes
      thumbnail: `https://img.youtube.com/vi/${videoId}/default.jpg`,
    });
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};
```

#### Navigation dans la playlist

```tsx
const PlaylistControls = () => {
  const { playNext, playPrevious, hasNextVideo, hasPreviousVideo } = usePlaylist();

  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity
        onPress={playPrevious}
        disabled={!hasPreviousVideo}
      >
        <Text>⏮ Précédent</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={playNext}
        disabled={!hasNextVideo}
      >
        <Text>Suivant ⏭</Text>
      </TouchableOpacity>
    </View>
  );
};
```

#### Contrôles de playlist

```tsx
const PlaylistSettings = ({ playlistId }: { playlistId: string }) => {
  const { activePlaylist, toggleShuffle, setRepeatMode } = usePlaylist();

  if (!activePlaylist || activePlaylist.id !== playlistId) return null;

  return (
    <View>
      <TouchableOpacity onPress={() => toggleShuffle(playlistId)}>
        <Text>
          🔀 Shuffle: {activePlaylist.settings.shuffle ? 'ON' : 'OFF'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          const modes = ['none', 'one', 'all'] as const;
          const currentIndex = modes.indexOf(activePlaylist.settings.repeat);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          setRepeatMode(playlistId, nextMode);
        }}
      >
        <Text>🔁 Repeat: {activePlaylist.settings.repeat}</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Fonctionnalités avancées

### Métriques de playlist

```tsx
const PlaylistMetrics = () => {
  const { activePlaylistMetrics, formatDuration } = usePlaylist();

  if (!activePlaylistMetrics) return null;

  return (
    <View>
      <Text>
        {activePlaylistMetrics.totalVideos} vidéos •
        {formatDuration(activePlaylistMetrics.totalDuration)} total
      </Text>
      <Text>
        Progression: {Math.round(activePlaylistMetrics.completionPercentage)}%
      </Text>
      <Text>
        Reste: {formatDuration(activePlaylistMetrics.remainingDuration)}
      </Text>
    </View>
  );
};
```

### Recherche de playlists

```tsx
const PlaylistSearch = () => {
  const [query, setQuery] = useState('');
  const { searchPlaylists } = usePlaylist();

  const results = searchPlaylists(query);

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher une playlist..."
      />
      {results.map(playlist => (
        <Text key={playlist.id}>{playlist.name}</Text>
      ))}
    </View>
  );
};
```

### Import/Export de playlists

```tsx
const PlaylistBackup = () => {
  const { exportPlaylistData, validatePlaylistData } = usePlaylist();

  const handleExport = (playlistId: string) => {
    try {
      const data = exportPlaylistData(playlistId);
      // Sauvegarder ou partager les données
      console.log('Données exportées:', data);
    } catch (error) {
      console.error('Erreur export:', error.message);
    }
  };

  const handleImport = (data: string) => {
    if (validatePlaylistData(data)) {
      // Importer les données
      console.log('Données valides, importation...');
    } else {
      console.error('Données invalides');
    }
  };

  return (
    <View>
      {/* Interface d'export/import */}
    </View>
  );
};
```

## Tests et validation

### Exécuter les tests

```tsx
import { runPlaylistTests } from './tests/playlist.test';

// Dans votre composant de développement
const DevTools = () => {
  const runTests = async () => {
    await runPlaylistTests();
  };

  return (
    <TouchableOpacity onPress={runTests}>
      <Text>Exécuter les tests de playlist</Text>
    </TouchableOpacity>
  );
};
```

### Tests inclus

1. **Création de playlist** - Vérification de la persistance
2. **Gestion des vidéos** - Ajout/suppression/réorganisation
3. **Navigation** - Suivant/précédent avec différents modes
4. **Shuffle** - Logique de randomisation
5. **Persistance** - Simulation de redémarrage d'app

## Bonnes pratiques

### 1. Gestion d'erreurs

```tsx
const handlePlaylistAction = async () => {
  try {
    await somePlaylistAction();
  } catch (error) {
    if (error.message === 'Playlist not found') {
      // Gestion spécifique
    } else if (error.message === 'Video already exists in playlist') {
      // Gestion des doublons
    } else {
      // Erreur générique
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  }
};
```

### 2. Performance

- Le contexte utilise useCallback pour éviter les re-renders
- Les opérations AsyncStorage sont optimisées
- Les calculs dérivés sont mémorisés

### 3. Persistance

- Toutes les modifications sont automatiquement sauvegardées
- La playlist active est restaurée au redémarrage
- Les données corrompues sont gérées gracieusement

## Intégration avec l'existant

### Modification du YouTubePlayer ✅

Le composant a été modifié pour supporter le callback `onEnd` qui permet l'auto-advance vers la vidéo suivante.

### App.tsx

Ajoutez le PlaylistProvider au niveau racine :

```tsx
import { PlaylistProvider } from './contexts/PlaylistContext';

export default function App() {
  return (
    <PlaylistProvider>
      {/* Votre app existante */}
    </PlaylistProvider>
  );
}
```

### Écrans existants

Vous pouvez maintenant utiliser le hook dans n'importe quel composant :

```tsx
import { usePlaylist } from './hooks/usePlaylist';

function VideoScreen() {
  const { currentVideo, playNext } = usePlaylist();

  // Votre logique existante + nouvelles fonctionnalités playlist
}
```

## Dépendances

- `@react-native-async-storage/async-storage` ✅ (déjà installé)
- React hooks (useState, useEffect, useContext, etc.)
- TypeScript pour le typage strict

## Prochaines étapes

1. Intégrer le PlaylistProvider dans votre App.tsx
2. Tester avec l'exemple fourni (`PlaylistExample.tsx`)
3. Adapter l'interface utilisateur selon vos besoins
4. Exécuter les tests pour valider le fonctionnement
5. Intégrer progressivement dans vos écrans existants

Le système est conçu pour être flexible et s'adapter à vos besoins spécifiques tout en fournissant une base solide pour la gestion des playlists.