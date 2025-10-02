# Quick Start: Tester l'Intégration Spotify

## Étapes Rapides

### 1. Configuration (5 minutes)

#### A. Créer une App Spotify
1. Allez sur https://developer.spotify.com/dashboard
2. Cliquez "Create App"
3. Remplissez:
   - **Name**: PodCut Dev
   - **Description**: Audio moments app
   - **Redirect URI**: `podcut://callback`
4. Cliquez "Save"
5. Copiez votre **Client ID**

#### B. Configuration Environnement
```bash
cd /Users/gedeonrony/Desktop/coding/podcut/mobile
cp .env.example .env
```

Éditez `.env`:
```env
SPOTIFY_CLIENT_ID=paste_your_client_id_here
SPOTIFY_REDIRECT_URI=podcut://callback
```

### 2. Lancer l'App (2 minutes)

```bash
# Depuis /mobile
pnpm start
```

Puis:
- **iOS**: Appuyez sur `i`
- **Android**: Appuyez sur `a`

### 3. Tester l'Authentification

#### Option A: Utiliser le Composant d'Exemple

Ajoutez dans votre écran principal (ex: `app/(tabs)/index.tsx`):

```typescript
import { SpotifyAuthExample } from '../components/SpotifyAuthExample';

export default function HomeScreen() {
  return <SpotifyAuthExample />;
}
```

#### Option B: Créer Votre Propre Test

```typescript
import { useSpotify } from '../hooks/useSpotify';
import { Button, Text, View } from 'react-native';

export default function TestScreen() {
  const {
    isAuthenticated,
    userProfile,
    login,
    search
  } = useSpotify();

  const handleTest = async () => {
    if (!isAuthenticated) {
      await login();
    } else {
      const tracks = await search('Beatles');
      console.log('Found:', tracks.length, 'tracks');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text>{isAuthenticated ? 'Logged in!' : 'Not logged in'}</Text>
      {userProfile && <Text>User: {userProfile.display_name}</Text>}
      <Button title="Test Spotify" onPress={handleTest} />
    </View>
  );
}
```

### 4. Workflow de Test

1. **Cliquez "Login with Spotify"**
   - Une page web Spotify s'ouvre
   - Connectez-vous avec votre compte
   - Autorisez l'app

2. **Vérifiez l'Authentification**
   - L'app affiche votre nom
   - Type de compte (Free/Premium)

3. **Testez la Recherche**
   - Cliquez "Search"
   - Vérifiez les résultats dans la console

4. **Testez la Lecture (Premium seulement)**
   ```typescript
   const { play } = useSpotify();
   await play('spotify:track:6rqhFgbbKwnb9MLmUQDhG6');
   ```

### 5. Debugging

#### Voir les Logs
```typescript
import { Logger } from '../services/logger/Logger';

// Dans n'importe quel composant
const logs = Logger.getLogs();
console.log(logs);
```

#### Vérifier les Tokens
```typescript
import * as SecureStore from 'expo-secure-store';

const token = await SecureStore.getItemAsync('spotify_access_token');
console.log('Token:', token ? 'Exists' : 'Missing');
```

#### Erreurs Courantes

**"CLIENT_ID missing"**
- Vérifiez que `.env` existe
- Vérifiez que `SPOTIFY_CLIENT_ID` est rempli
- Redémarrez l'app (`r` dans terminal)

**"Auth failed: cancel"**
- L'utilisateur a annulé
- Ré-essayez

**"Premium required"**
- Votre compte est Free
- Utilisez seulement search/metadata
- OU utilisez preview_url avec expo-av

**"Redirect URI mismatch"**
- Vérifiez que `podcut://callback` est dans Spotify Dashboard
- Exactement pareil (sensible à la casse)

### 6. Fonctionnalités Disponibles

#### Avec Compte Free
```typescript
const { search, api } = useSpotify();

// ✅ Recherche
const tracks = await search('jazz');

// ✅ Métadonnées
const track = await api.getTrackMetadata('trackId');

// ✅ Profil
const profile = await api.getUserProfile();

// ✅ Preview audio (30s)
// track.preview_url avec expo-av
```

#### Avec Compte Premium
```typescript
const { play, player } = useSpotify();

// ✅ Lecture complète
await play('spotify:track:...');

// ✅ Contrôle
await player.pause();
await player.resume();

// ✅ État
const state = await player.getPlaybackState();
console.log('Playing:', state?.is_playing);
```

### 7. Prochaines Étapes

Après avoir vérifié que ça fonctionne:

1. **Intégrer dans votre UI**
   - Créer un écran de login
   - Ajouter recherche dans votre flow
   - Intégrer player dans vos moments

2. **Ajouter Gestion d'Erreurs**
   ```typescript
   try {
     await login();
   } catch (error) {
     Alert.alert('Login Error', error.message);
   }
   ```

3. **Optimiser UX**
   - Loading states
   - Error messages
   - Retry logic

4. **Tests**
   - Tester sur iOS ET Android
   - Tester avec/sans Premium
   - Tester déconnexion/reconnexion

## Checklist de Validation

- [ ] App Spotify créée
- [ ] CLIENT_ID configuré dans .env
- [ ] Redirect URI ajouté (podcut://callback)
- [ ] App lance sans erreur
- [ ] Login fonctionne
- [ ] Token sauvegardé
- [ ] Profil affiché
- [ ] Recherche retourne résultats
- [ ] Logout fonctionne
- [ ] Re-login fonctionne

## Support

Si bloqué:
1. Vérifiez les logs: `Logger.getLogs()`
2. Vérifiez `.env` existe et rempli
3. Vérifiez Redirect URI dans Dashboard
4. Redémarrez l'app complètement

---

**Temps Total Estimé**: 10-15 minutes
**Prérequis**: Compte Spotify (Free OK)
