# PRD: PodCut - Évolution de l'Application de Capture de Moments Vidéo

## Introduction/Overview

**PodCut** (actuellement nommé "Moments") est une application mobile React Native/Expo qui permet aux utilisateurs de capturer, annoter et organiser des moments spécifiques dans des vidéos YouTube. L'application doit évoluer pour inclure la capture d'écran en arrière-plan, l'annotation enrichie avec éditeur de texte, et l'export vers des outils externes.

### État Actuel (Ce qui existe déjà)
✅ Lecteur YouTube intégré (`react-native-youtube-iframe`)
✅ Capture de moments avec timestamp
✅ Système de playlists avec lecture automatique
✅ Stockage local (AsyncStorage)
✅ Architecture avec contexts (MomentsContext, PlaylistContext, TopBarContext)
✅ Design system moderne avec mode sombre
✅ Composants réutilisables (Button, Card, Toast, EmptyState)
✅ Navigation avec Expo Router (tabs + player screen)
✅ Métadonnées YouTube (titre, auteur, thumbnail)

### Ce qui manque (Objectifs de ce PRD)
❌ **Screen recording en arrière-plan**
❌ **Bouton flottant (pendant screen recording uniquement)**
❌ **Éditeur de texte riche pour notes sur moments**
❌ **Previews vidéo de 10s pour tous les moments**
❌ **Organisation par folders (actuellement seulement playlists)**
❌ **Système de tags**
❌ **Export vers Notion/Obsidian**
❌ **UI redesign** (l'UI actuelle n'est pas assez moderne/attrayante)

**But:** Transformer PodCut en une plateforme complète pour la capture, l'annotation et l'organisation de moments vidéo, adaptée aux conducteurs, étudiants, créateurs de contenu et utilisateurs spirituels.

---

## Goals

1. **Ajouter la capture d'écran** - Permettre l'enregistrement d'écran en arrière-plan avec bouton flottant
2. **Améliorer l'annotation** - Éditeur de texte riche intégré directement dans le player (sans quitter la vidéo)
3. **Enrichir les moments** - Ajouter des previews vidéo, tags, et données supplémentaires
4. **Améliorer l'organisation** - Système de folders + tags (en complément des playlists existantes)
5. **Permettre l'export** - Exporter vers Notion, Obsidian, et formats texte
6. **Moderniser l'UI** - Redesign complet pour une interface plus attrayante et moderne
7. **Maintenir la compatibilité** - Ne pas casser l'architecture existante (contexts, storage, composants)

---

## User Stories

### US-1: Capture d'Écran (Nouveau)
- **US-1.1:** Comme utilisateur, je veux démarrer un enregistrement d'écran depuis PodCut pour capturer du contenu TikTok/Instagram live
- **US-1.2:** Comme utilisateur, je veux que l'enregistrement continue quand je quitte PodCut (background)
- **US-1.3:** Comme utilisateur, je veux un bouton flottant UNIQUEMENT quand je suis en enregistrement et hors de PodCut
- **US-1.4:** Comme utilisateur, je veux que le bouton capture les 30s/1min/3min précédentes (configurable dans Settings)
- **US-1.5:** Comme utilisateur, je veux recevoir une confirmation haptique/visuelle quand un moment est capturé

### US-2: Annotation In-Player (Nouveau)
- **US-2.1:** Comme étudiant, je veux ajouter des notes texte riches **directement dans le player** sans quitter la vidéo
- **US-2.2:** Comme étudiant, je veux que la vidéo continue de jouer (audio) pendant que j'écris mes notes
- **US-2.3:** Comme étudiant, je veux éditer les notes des moments existants sans navigation supplémentaire
- **US-2.4:** Comme étudiant, je veux formater mes notes (gras, italique, listes, liens)

### US-3: Organisation Avancée (Nouveau)
- **US-3.1:** Comme utilisateur, je veux créer des folders pour organiser mes vidéos par thème/projet
- **US-3.2:** Comme utilisateur, je veux créer des sous-folders (hiérarchie)
- **US-3.3:** Comme utilisateur, je veux ajouter des tags à mes moments pour les filtrer facilement
- **US-3.4:** Comme utilisateur, je veux chercher dans mes moments par titre, notes, ou tags

### US-4: Previews Vidéo (Nouveau)
- **US-4.1:** Comme utilisateur, je veux voir un preview vidéo de 10s quand je survole/long-press un moment
- **US-4.2:** Comme utilisateur, les previews doivent fonctionner pour les moments YouTube (seek + 10s) ET screen recordings
- **US-4.3:** Comme utilisateur, je veux configurer la durée des previews (5s, 10s, 15s) dans Settings

### US-5: Export (Nouveau)
- **US-5.1:** Comme étudiant, je veux exporter mes notes vers Notion avec formatage markdown
- **US-5.2:** Comme utilisateur spirituel, je veux exporter vers Obsidian avec liens vers vidéos
- **US-5.3:** Comme utilisateur, je veux prévisualiser l'export avant de l'envoyer
- **US-5.4:** Comme utilisateur, je veux copier mes notes formatées dans le presse-papier

### US-6: UI Redesign (Nouveau)
- **US-6.1:** Comme utilisateur, je veux une interface plus moderne et attrayante
- **US-6.2:** Comme utilisateur, je veux des animations fluides et un design cohérent
- **US-6.3:** Comme utilisateur, je veux une meilleure hiérarchie visuelle dans la liste des moments

### US-7: Compatibilité avec l'Existant (Maintien)
- **US-7.1:** Comme utilisateur, je veux que mes playlists actuelles continuent de fonctionner
- **US-7.2:** Comme utilisateur, je veux que mes moments existants (timestamps YouTube) soient préservés
- **US-7.3:** Comme développeur, je veux que l'architecture existante (contexts, storage) soit réutilisée

---

## Functional Requirements

### 1. Screen Recording (Nouveau)

#### FR-1.1: Démarrage de l'Enregistrement
- **FR-1.1.1:** Ajouter un bouton "Start Screen Recording" sur la Home screen
- **FR-1.1.2:** Demander les permissions natives (iOS: ReplayKit, Android: MediaProjection)
- **FR-1.1.3:** Afficher un indicateur visuel (badge rouge) quand l'enregistrement est actif
- **FR-1.1.4:** Permettre l'arrêt manuel de l'enregistrement depuis n'importe où dans l'app

#### FR-1.2: Recording en Arrière-Plan
- **FR-1.2.1:** L'enregistrement doit continuer quand PodCut est en arrière-plan
- **FR-1.2.2:** Implémenter un buffer circulaire en mémoire (dernières N minutes configurables)
- **FR-1.2.3:** Optimiser la mémoire pour éviter les crashes (compression à la volée si nécessaire)

#### FR-1.3: Bouton Flottant (Screen Recording Uniquement)
- **FR-1.3.1:** Le bouton flottant ne doit apparaître QUE si:
  - Screen recording est actif, ET
  - PodCut est en arrière-plan (user dans TikTok, Instagram, etc.)
- **FR-1.3.2:** Le bouton NE doit PAS apparaître pendant la lecture YouTube
- **FR-1.3.3:** Le bouton doit être draggable (repositionnable par l'utilisateur)
- **FR-1.3.4:** Workaround iOS: Utiliser PiP, widget, ou notification avec actions

#### FR-1.4: Capture de Moment (Screen Recording)
- **FR-1.4.1:** Quand le bouton flottant est tapé:
  - Extraire les dernières N minutes du buffer (N configuré dans Settings)
  - Sauvegarder comme fichier vidéo local (compressé si possible)
  - Créer un moment de type "screen_recording" (nouveau type)
  - Afficher une confirmation visuelle/haptique
- **FR-1.4.2:** Le moment doit inclure:
  - Fichier vidéo (path local)
  - Timestamp de capture
  - Durée du clip
  - App source (si détectable, ex: "TikTok")
  - Preview thumbnail (première frame)

### 2. Moments: Nouveaux Types (Modification)

#### FR-2.1: Types de Moments
Le système doit supporter deux types de moments:

**Type A: YouTube Timestamp** (existant)
```typescript
{
  id: string;
  type: 'youtube_timestamp';
  videoId: string; // ID YouTube
  timestamp: number; // en secondes
  duration: number; // durée du moment (30s par défaut)
  title: string;
  notes?: string; // NOUVEAU: notes riches
  tags?: string[]; // NOUVEAU
  createdAt: Date;
  videoMetadata: {
    title: string;
    author: string;
    thumbnail: string;
    url: string;
  };
}
```

**Type B: Screen Recording Clip** (nouveau)
```typescript
{
  id: string;
  type: 'screen_recording';
  videoFilePath: string; // path local du clip
  duration: number; // durée du clip (30s, 1min, 3min, etc.)
  title: string;
  notes?: string; // notes riches
  tags?: string[];
  createdAt: Date;
  sourceApp?: string; // "TikTok", "Instagram", etc. (si détectable)
  thumbnail?: string; // path local du thumbnail
}
```

#### FR-2.2: Migration de Données
- **FR-2.2.1:** Les moments existants (CapturedMoment) doivent être migrés vers le nouveau format
- **FR-2.2.2:** Ajouter un champ `type: 'youtube_timestamp'` aux moments existants
- **FR-2.2.3:** Ajouter les champs `notes` et `tags` (vides par défaut)

### 3. Éditeur de Texte Riche (Nouveau)

#### FR-3.1: Intégration dans le Player
- **FR-3.1.1:** Quand l'utilisateur tape "Capture Moment" pendant la lecture YouTube:
  - Un moment est créé avec le timestamp actuel
  - Un éditeur overlay/modal s'affiche IMMÉDIATEMENT
  - La vidéo continue de jouer (audio en background)
  - L'éditeur affiche:
    - Champ "Titre" (pré-rempli avec "Moment at [timestamp]")
    - Éditeur de texte riche (notes)
    - Input pour tags (chips/comma-separated)
    - Boutons "Save" et "Cancel"

#### FR-3.2: Éditeur de Texte
- **FR-3.2.1:** Utiliser `@10play/tentap-editor` ou `react-native-pell-rich-editor`
- **FR-3.2.2:** Fonctionnalités minimales:
  - Gras, italique, souligné
  - Listes (bullet, numérotées)
  - Liens
  - Titres (H1, H2, H3)
- **FR-3.2.3:** Format de stockage: Markdown (pour export facile)
- **FR-3.2.4:** Auto-save toutes les 3 secondes (draft local)

#### FR-3.3: Édition de Moments Existants
- **FR-3.3.1:** Dans le player, afficher une liste/sidebar des moments de la vidéo actuelle
- **FR-3.3.2:** Quand l'utilisateur tape un moment existant:
  - Ouvrir l'éditeur avec les données actuelles
  - Permettre l'édition
  - Sauvegarder les changements
- **FR-3.3.3:** L'édition ne doit JAMAIS forcer une navigation hors du player

#### FR-3.4: UX Critique
- **FR-3.4.1:** L'overlay éditeur doit s'afficher en < 300ms
- **FR-3.4.2:** La vidéo doit continuer de jouer en arrière-plan (audio)
- **FR-3.4.3:** Possibilité de toggle entre "mode vidéo" et "mode notes" sans fermer l'éditeur

### 4. Previews Vidéo (Nouveau)

#### FR-4.1: Génération de Previews
**Pour YouTube Moments:**
- **FR-4.1.1:** Preview = seek au timestamp + lecture de 10s
- **FR-4.1.2:** Utiliser le player YouTube existant (pas d'extraction vidéo réelle)
- **FR-4.1.3:** Afficher dans une mini-vue (Picture-in-Picture style)

**Pour Screen Recording Moments:**
- **FR-4.1.4:** Utiliser FFmpeg (`react-native-ffmpeg`) pour extraire un clip de 10s
- **FR-4.1.5:** Cacher le preview (généré à la demande ou pré-généré en background)
- **FR-4.1.6:** Format: MP4 compressé (résolution réduite pour économiser l'espace)

#### FR-4.2: Affichage des Previews
- **FR-4.2.1:** Dans la liste de moments, long-press sur un moment pour voir le preview
- **FR-4.2.2:** Le preview se joue inline (pas de navigation)
- **FR-4.2.3:** Controls: Play/Pause + bouton "Play Full"
- **FR-4.2.4:** Durée du preview configurable dans Settings (5s, 10s, 15s)

### 5. Organisation: Folders + Tags (Nouveau)

#### FR-5.1: Système de Folders
- **FR-5.1.1:** Créer un nouveau context `FoldersContext` (similaire à PlaylistContext)
- **FR-5.1.2:** Les folders peuvent contenir:
  - Vidéos YouTube (référence par videoId)
  - Screen recordings (référence par moment.id)
  - Sous-folders (hiérarchie)
- **FR-5.1.3:** Structure de données:
```typescript
interface Folder {
  id: string;
  name: string;
  description?: string;
  parentFolderId?: string; // null si root folder
  items: FolderItem[]; // vidéos ou moments
  subFolders: string[]; // IDs de sous-folders
  createdAt: Date;
  updatedAt: Date;
}

interface FolderItem {
  id: string;
  type: 'youtube_video' | 'screen_recording_moment';
  itemId: string; // videoId ou moment.id
  addedAt: Date;
}
```

#### FR-5.2: Système de Tags
- **FR-5.2.1:** Les tags sont globaux (utilisables sur tous les moments)
- **FR-5.2.2:** Auto-complétion lors de la saisie (tags existants suggérés)
- **FR-5.2.3:** Filtrage par tags dans la vue "Moments"
- **FR-5.2.4:** Stockage: array de strings dans chaque moment (`tags: string[]`)

#### FR-5.3: Distinction Folders vs Playlists
- **Folders:** Organisation statique (comme des dossiers sur ordinateur)
- **Playlists:** Lecture séquentielle (ordre spécifique, autoplay)
- Les deux systèmes coexistent (un moment peut être dans un folder ET dans une playlist)

### 6. Export (Nouveau)

#### FR-6.1: Export Notion
- **FR-6.1.1:** Format: Markdown avec blocs Notion
- **FR-6.1.2:** Structure:
```markdown
# [Titre de la vidéo]

## Moments

### [Timestamp] - [Titre du moment]
**Tags:** #tag1 #tag2
**Lien:** [Regarder](https://youtube.com/watch?v=ID&t=123s)

[Notes du moment en markdown]

---
```
- **FR-6.1.3:** API Notion (optionnel pour v1): Intégration avec Notion API pour export direct
- **FR-6.1.4:** Version simple: Copier le markdown dans le presse-papier (user colle manuellement dans Notion)

#### FR-6.2: Export Obsidian
- **FR-6.2.1:** Format: Fichier markdown avec frontmatter
```markdown
---
title: [Titre de la vidéo]
source: youtube
video_id: [ID]
created: 2025-10-06
tags: [learning, tutorial]
---

# Moments

## [[12:34]] - Important Concept
Tags: #concept #important

[Notes]

Link: [Watch](https://youtube.com/watch?v=ID&t=754s)
```
- **FR-6.2.2:** Génération de fichier `.md` avec `expo-file-system`
- **FR-6.2.3:** Partage via `expo-sharing` (user choisit l'app de destination)

#### FR-6.3: Export Clipboard
- **FR-6.3.1:** Copier tout le contenu formaté (markdown) dans le presse-papier
- **FR-6.3.2:** Afficher un toast de confirmation

#### FR-6.4: Prévisualisation
- **FR-6.4.1:** Avant l'export, afficher une modal avec le contenu formaté
- **FR-6.4.2:** Permettre de modifier le format (toggle entre Notion et Obsidian style)
- **FR-6.4.3:** Boutons: "Copy to Clipboard", "Share File", "Cancel"

### 7. Settings (Extension)

#### FR-7.1: Nouveaux Paramètres
Ajouter dans [settings.tsx](mobile/app/(tabs)/settings.tsx):

**Section: Screen Recording**
- Durée de capture par défaut (30s, 1min, 3min, 5min)
- Qualité vidéo (Low, Medium, High)
- Auto-compression (On/Off)

**Section: Moments**
- Durée de preview par défaut (5s, 10s, 15s)
- Format de notes par défaut (Plain text, Markdown)

**Section: Export**
- Format par défaut (Notion, Obsidian, Plain text)
- Inclure les tags (On/Off)
- Inclure les timestamps (On/Off)

**Section: Storage**
- Voir l'espace utilisé (screen recordings + previews)
- Nettoyer les previews (bouton)
- Nettoyer les screen recordings anciens (bouton avec confirmation)

### 8. UI Redesign (Nouveau)

#### FR-8.1: Principes de Design
- **Moderne:** Glassmorphism, gradients subtils, ombres douces
- **Attrayant:** Animations fluides (Reanimated), micro-interactions
- **Cohérent:** Utiliser le Design System existant mais l'améliorer

#### FR-8.2: Composants à Redesigner

**Home Screen:**
- Hero section avec gradient (couleur primaire)
- Cards pour "Recent Moments" avec thumbnails plus grandes
- FAB (Floating Action Button) avec menu:
  - "Add YouTube Video"
  - "Start Screen Recording"
  - "Create Folder"

**Player Screen:**
- Video player en haut (full-width)
- Moments panel en bottom sheet (swipe up pour expand)
- Bouton "Capture" proéminent (grande taille, pulsation subtile)
- Éditeur de notes en overlay translucide (glassmorphism)

**Moments Library:**
- Grid view avec previews (thumbnail + icône play)
- Filters en haut (folders, tags, date)
- Search bar avec autocomplete
- Animations de transition fluides (shared element transitions)

**Folders View:**
- Breadcrumb navigation pour la hiérarchie
- Icons pour folders vs videos
- Drag & drop pour réorganiser (optionnel pour v1)

#### FR-8.3: Animations
- **Capture Button:** Pulsation subtile (scale 1 → 1.05 → 1, 2s loop)
- **Modal Entry:** Slide-up + fade (300ms, easeOut)
- **List Items:** Stagger animation (chaque item apparaît avec 50ms de délai)
- **Preview:** Zoom in (scale 0.8 → 1, 200ms, spring)

#### FR-8.4: Design Assets
Créer dans Figma avant l'implémentation:
- Maquettes high-fidelity pour:
  - Home screen
  - Player screen (avec éditeur de notes)
  - Moments library
  - Folders view
  - Settings screen

---

## Non-Goals (Out of Scope for V1)

1. **Live streaming depuis PodCut** - Pas de broadcast
2. **Social features** - Pas de partage social, commentaires, feed
3. **Édition vidéo avancée** - Pas de trimming, filtres, effets
4. **Multi-langue** - Anglais/Français uniquement
5. **Web/Desktop** - Mobile uniquement
6. **Monétisation** - Pas d'in-app purchases, subscriptions, ads
7. **AI features** - Pas de transcription, résumés, suggestions automatiques
8. **Autres sources vidéo** - Seulement YouTube (pas de Vimeo, Dailymotion)
9. **Collaboration** - Pas de shared folders, notes collaboratives
10. **Cloud storage de vidéos** - Screen recordings en local uniquement
11. **Sync temps réel** - Pas de sync automatique (uniquement backup manuel)

---

## Technical Considerations

### Architecture Actuelle (À Réutiliser)
```
mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home (add screen recording button)
│   │   ├── moments/           # Library (add folders/tags filter)
│   │   └── settings.tsx       # Settings (add new sections)
│   └── player/
│       └── index.tsx          # Player (add notes editor overlay)
├── contexts/
│   ├── MomentsContext.tsx     # Extend with new moment types
│   ├── PlaylistContext.tsx    # Keep as is
│   └── FoldersContext.tsx     # NEW: Create for folders
├── components/
│   ├── Button/                # Keep & enhance animations
│   ├── Card/                  # Redesign visual style
│   ├── Toast/                 # Keep as is
│   ├── EmptyState/            # Keep as is
│   ├── RichTextEditor/        # NEW: Create for notes
│   └── VideoPreview/          # NEW: Create for 10s previews
├── services/
│   ├── screenRecording.ts     # NEW: Screen recording logic
│   ├── ffmpeg.ts              # NEW: Video preview extraction
│   └── export.ts              # NEW: Notion/Obsidian formatters
└── types/
    ├── moment.ts              # Extend with new types
    └── folder.ts              # NEW: Folder types
```

### Nouvelles Dépendances

```json
{
  // Screen Recording
  "react-native-screen-capture": "^1.0.0", // iOS
  "react-native-media-projection": "^1.0.0", // Android

  // Video Processing
  "react-native-ffmpeg": "^0.5.1", // Preview extraction

  // Rich Text Editor
  "@10play/tentap-editor": "^0.5.0", // Markdown editor

  // Export
  "@notionhq/client": "^2.2.0", // Notion API (optionnel)

  // Floating Button (Android)
  "react-native-draggable-view": "^1.0.0"
}
```

### Défis Techniques

#### 1. Screen Recording en Arrière-Plan
**iOS (ReplayKit):**
- Limitations: App doit être en foreground pour démarrer, mais peut continuer en background
- Workaround: Utiliser un broadcast extension
- Bouton flottant: Impossible en natif → Utiliser PiP ou notification avec actions

**Android (MediaProjection):**
- Permission: `SYSTEM_ALERT_WINDOW` pour overlay window
- Bouton flottant: Possible avec `WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY`

**Solution Recommandée:**
- iOS: Notification avec bouton "Capture Moment" (quand recording actif + app backgrounded)
- Android: Floating bubble (draggable overlay window)

#### 2. Buffer Circulaire en Mémoire
- Problème: Stocker 3-5 minutes de vidéo en RAM = 100-200MB
- Solution: Compression à la volée (H.264, résolution réduite si nécessaire)
- Fallback: Limiter à 1 min si RAM < 2GB

#### 3. Preview Extraction (FFmpeg)
- Performance: Extraction de 10s peut prendre 2-5s sur mid-range devices
- Solution: Générer previews en background (queue système)
- Cache: Stocker previews localement (max 1GB, auto-cleanup si dépassement)

#### 4. Rich Text Editor dans Player
- Challenge: Overlay editor + video continue de jouer
- Solution: Utiliser un Modal translucide avec `presentationStyle: 'overCurrentContext'`
- iOS: Continuer l'audio avec AVAudioSession category `playback`

#### 5. Migration de Données
```typescript
// Fonction de migration (run once on app update)
async function migrateOldMomentsToNewFormat() {
  const oldMoments: CapturedMoment[] = await loadOldMoments();

  const newMoments: Moment[] = oldMoments.map(old => ({
    ...old,
    type: 'youtube_timestamp',
    notes: '', // vide par défaut
    tags: [], // vide par défaut
  }));

  await saveMoments(newMoments);
}
```

### Performance

**Targets:**
- Moment capture latency: < 500ms
- Notes editor open: < 300ms
- Video preview load: < 2s
- Search query response: < 1s
- App startup: < 3s

**Optimizations:**
- Use `react-native-reanimated` (déjà installé) pour animations
- Lazy load folders/previews (FlatList avec `windowSize`)
- Compress screen recordings à la volée
- Index tags pour recherche rapide (in-memory map)

---

## Success Metrics

### Adoption Features
- **Screen Recording:** 30% des users l'activent dans le 1er mois
- **Notes Editor:** 80% des moments ont des notes (vs 0% actuellement)
- **Folders:** 60% des users créent au moins 1 folder
- **Tags:** 50% des users utilisent des tags
- **Export:** 20% des users exportent vers Notion/Obsidian

### Engagement
- **Moments Created:** 5+ moments/user/semaine
- **Session Duration:** 15+ minutes/session
- **Retention:** 50% retention à 30 jours

### Technical
- **Crash Rate:** < 1%
- **Average Capture Time:** < 500ms
- **Preview Load Success:** > 95%

---

## Open Questions

### Technical
1. **iOS Floating Button:** Quelle approche adopter (PiP, widget, notification) ?
2. **FFmpeg Performance:** Tester sur devices mid-range (iPhone 11, Samsung A52) - extraction de 10s en combien de temps ?
3. **Storage Limits:** Quelle limite imposer pour screen recordings (2GB, 5GB, configurable) ?
4. **Preview Cache:** Générer tous les previews à la création ou à la demande ?

### Product
5. **Onboarding:** Faut-il un tutorial explicatif pour screen recording ?
6. **Folders vs Playlists:** La distinction est-elle claire pour les users ?
7. **Default Settings:** Quelle durée par défaut pour screen recording moments (1min, 3min) ?
8. **Migration:** Faut-il une annonce in-app pour informer des nouvelles features ?

### Design
9. **Notes Editor:** Full-screen ou bottom sheet ?
10. **Moments Panel:** Toujours visible ou toggle ?
11. **Preview Interaction:** Long-press ou tap avec option ?

### Business
12. **Target Persona:** Quel persona prioriser pour le redesign UI (étudiant, créateur) ?
13. **Launch:** Big bang update ou progressive rollout ?

---

## Roadmap de Développement

### Phase 1: Foundation (Sprint 1-2)
- [ ] Migrer les types de moments (ajouter `type`, `notes`, `tags`)
- [ ] Créer `RichTextEditor` component
- [ ] Intégrer éditeur dans player screen (overlay)
- [ ] Tester UX: video continue pendant édition

### Phase 2: Screen Recording (Sprint 3-4)
- [ ] Implémenter screen recording natif (iOS + Android)
- [ ] Créer buffer circulaire en mémoire
- [ ] Implémenter bouton flottant (Android) ou notification (iOS)
- [ ] Tester capture de moments depuis background

### Phase 3: Organization (Sprint 5)
- [ ] Créer `FoldersContext`
- [ ] Implémenter UI folders (tree view, breadcrumbs)
- [ ] Ajouter système de tags (autocomplete)
- [ ] Ajouter filtres/search dans Moments library

### Phase 4: Previews (Sprint 6)
- [ ] Intégrer `react-native-ffmpeg`
- [ ] Implémenter extraction de previews (background queue)
- [ ] Créer `VideoPreview` component
- [ ] Implémenter long-press pour preview

### Phase 5: Export (Sprint 7)
- [ ] Créer formatters Notion/Obsidian
- [ ] Implémenter preview modal
- [ ] Ajouter copy to clipboard
- [ ] Ajouter file sharing

### Phase 6: UI Redesign (Sprint 8-9)
- [ ] Créer maquettes Figma
- [ ] Redesign Home screen
- [ ] Redesign Player screen
- [ ] Redesign Moments library
- [ ] Animations et micro-interactions

### Phase 7: Settings & Polish (Sprint 10)
- [ ] Ajouter nouveaux settings
- [ ] Implémenter storage management
- [ ] Optimisations performance
- [ ] Tests utilisateurs

### Phase 8: Beta & Launch (Sprint 11-12)
- [ ] Beta testing (20-30 users)
- [ ] Bug fixes
- [ ] App Store submission (iOS + Android)
- [ ] Launch 🚀

---

## Next Steps (Priorité Immédiate)

1. **Valider les choix techniques:**
   - Tester `react-native-ffmpeg` sur device réel (extraction 10s)
   - Tester approches bouton flottant iOS (PiP vs notification)
   - Tester `@10play/tentap-editor` pour rich text

2. **Design:**
   - Créer wireframes pour player screen avec éditeur de notes
   - Créer wireframes pour Home screen redesignée
   - Définir la palette de couleurs (garder rouge YouTube ou changer ?)

3. **Préparer la migration:**
   - Écrire script de migration pour moments existants
   - Tester migration sur données de dev

4. **Commencer Phase 1:**
   - Créer branch `feature/rich-text-editor`
   - Implémenter éditeur de notes dans player
   - PR + Review

---

**Document Version:** 1.0
**Created:** 2025-10-06
**Author:** Product Team
**Status:** Ready for Review
**Codebase:** `/Users/gedeonrony/Desktop/coding/podcut/mobile`
