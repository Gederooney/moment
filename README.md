# PodCut Mobile

Application mobile Expo/React Native pour convertir des vidéos YouTube en podcasts audio.

## Démarrage rapide

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm start

# Démarrage pour iOS
npm run ios

# Démarrage pour Android
npm run android
```

## Structure du projet

```
mobile/
├── app/              # Screens avec Expo Router
│   ├── _layout.tsx   # Layout racine
│   └── index.tsx     # Écran principal
├── components/       # Composants réutilisables
├── services/         # Logique métier et API
├── constants/        # Couleurs et configuration
├── hooks/           # Custom hooks React
└── assets/          # Images et ressources
```

## Fonctionnalités

- ✅ Interface utilisateur native avec Expo
- ✅ Validation d'URL YouTube
- ✅ Gestion d'état avec hooks personnalisés
- ✅ Stockage local avec AsyncStorage
- ✅ Navigation avec Expo Router
- 🔄 Traitement vidéo (simulé pour le développement)

## Technologies

- **Expo 54** - Framework de développement React Native
- **TypeScript** - Langage de programmation typé
- **Expo Router** - Navigation basée sur les fichiers
- **Expo AV** - Lecture audio/vidéo
- **AsyncStorage** - Stockage local
- **Vector Icons** - Icônes

## Développement

L'application utilise des services simulés pour le développement. Les vrais appels API seront intégrés avec le backend.

### Scripts disponibles

- `npm start` - Démarre le serveur Expo
- `npm run ios` - Lance sur simulateur iOS
- `npm run android` - Lance sur émulateur Android