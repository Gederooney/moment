# Queue Components

Composants React Native pour la file d'attente vidéo de PodCut, avec design YouTube et animations fluides.

## Composants

### Queue (Composant principal)
```tsx
import { Queue } from './components/Queue';

<Queue
  videos={queueVideos}
  currentVideoId={currentVideoId}
  onVideoPress={handleVideoPress}
  onAddVideo={handleAddVideo}
  onVideoRemove={handleVideoRemove}
  isDark={true}
/>
```

### QueueContainer
Conteneur principal avec gradient sombre et hauteur fixe de 140px.

### QueueHeader
En-tête avec titre "File d'attente (X)" et bouton + rouge pour ajouter des vidéos.

### QueueList
Liste horizontale scrollable avec snap-to-interval pour une navigation fluide.

### QueueItem
Item individuel de vidéo avec :
- Miniature 80x76px
- Bordure rouge pour la vidéo en cours
- Titre tronqué sur 2 lignes
- Indicateur de lecture animé
- Durée affichée en overlay

### AddVideoModal
Modal bottom sheet pour ajouter des URLs YouTube avec :
- Validation d'URL YouTube
- Animation d'entrée/sortie fluide
- Gestion des erreurs
- Interface keyboard-friendly

## Types

```tsx
interface QueueVideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration?: string;
  channelName?: string;
}
```

## Style

- **Hauteur fixe** : 140px pour le conteneur
- **Couleurs** : Rouge #FF0000 (YouTube) pour les éléments actifs
- **Background** : #1F1F1F pour les cartes vidéo
- **Animations** : 300ms pour les transitions
- **Responsive** : Scroll horizontal avec snap

## Installation

Les composants utilisent les dépendances suivantes :
- `expo-linear-gradient` pour les gradients
- `@expo/vector-icons` pour les icônes
- Design system PodCut existant

## Notes importantes

1. **Image placeholder** : Ajouter `placeholder-video.png` dans `/assets/` ou modifier le QueueItem
2. **Validation YouTube** : Le modal valide automatiquement les URLs YouTube
3. **Accessibilité** : Tous les composants incluent les props d'accessibilité appropriées
4. **Performance** : Liste optimisée avec `snapToInterval` et animations natives

## Utilisation complète

```tsx
import React, { useState } from 'react';
import { Queue, QueueVideoItem } from './components/Queue';

const MyScreen = () => {
  const [videos, setVideos] = useState<QueueVideoItem[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string>();

  const handleAddVideo = async (url: string) => {
    // Appeler votre API YouTube pour récupérer les métadonnées
    const videoInfo = await fetchYouTubeVideoInfo(url);
    setVideos(prev => [...prev, videoInfo]);
  };

  return (
    <Queue
      videos={videos}
      currentVideoId={currentVideoId}
      onVideoPress={(video) => setCurrentVideoId(video.id)}
      onAddVideo={handleAddVideo}
      isDark={true}
    />
  );
};
```