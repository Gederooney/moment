# RAPPORT COMPLET - RECHERCHE APIs MUSICALES
## Spotify API, Apple Music API et SoundCloud API

**Date:** 2 Octobre 2025
**Contexte:** Application React Native (Expo) pour recherche, lecture et métadonnées de musique
**Objectif:** Intégration OAuth pour contrôle de playback et recherche de tracks

---

## EXECUTIVE SUMMARY

Cette recherche approfondie compare trois plateformes musicales majeures pour intégration dans une application React Native avec Expo. Les principales conclusions sont :

**RECOMMANDATIONS PRIORITAIRES:**
1. **Spotify API** - Prioritaire (recommandé comme première implémentation)
2. **SoundCloud API** - Secondaire (alternative intéressante et gratuite)
3. **Apple Music API** - À éviter pour l'instant (coût élevé, complexité Android)

---

## 1. SPOTIFY API

### 1.1 Vue d'ensemble

**Statut 2025:** Entièrement opérationnel et activement maintenu
**Coût:** GRATUIT
**Documentation:** Excellente et complète
**Difficulté d'implémentation:** 3/5

### 1.2 OAuth 2.0 PKCE Flow - Détails complets

#### Étapes du flow PKCE

**Étape 1: Génération du Code Verifier**
```javascript
// Générer une chaîne aléatoire de 43-128 caractères
// Utiliser cryptographiquement sécurisé (crypto.getRandomValues)
// Caractères autorisés: A-Z, a-z, 0-9, -, ., _, ~
```

**Étape 2: Création du Code Challenge**
```javascript
// Hash du code verifier avec SHA256
// Encoder en Base64 URL-safe
// Utilisé dans la requête d'autorisation
```

**Étape 3: Requête d'autorisation**
```
Endpoint: https://accounts.spotify.com/authorize

Paramètres requis:
- client_id: Votre Client ID Spotify
- response_type: "code"
- redirect_uri: URI de redirection (ex: yourapp://callback)
- code_challenge_method: "S256"
- code_challenge: Le challenge généré
- scope: Permissions demandées (optionnel)

Scopes nécessaires pour votre app:
- user-read-playback-state
- user-modify-playback-state
- user-read-currently-playing
- streaming (si utilisation du SDK)
```

**Étape 4: Échange du code pour un token**
```
Endpoint: https://accounts.spotify.com/api/token
Méthode: POST

Paramètres:
- client_id: Votre Client ID
- grant_type: "authorization_code"
- code: Le code d'autorisation reçu
- redirect_uri: Même URI qu'à l'étape 3
- code_verifier: Le verifier original (non hashé)
```

**Réponse token:**
```json
{
  "access_token": "NgCXRK...MzYjw",
  "token_type": "Bearer",
  "scope": "user-read-playback-state user-modify-playback-state",
  "expires_in": 3600,
  "refresh_token": "NgAagA...Um_SHo"
}
```

#### Implémentation React Native / Expo

**Bibliothèque recommandée:** `expo-auth-session`

```javascript
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

// Configuration
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

// Créer le code verifier et challenge
const generateCodeChallenge = async () => {
  const codeVerifier = generateRandomString(128);
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier
  );
  const codeChallenge = base64URLEncode(hash);
  return { codeVerifier, codeChallenge };
};

// Lancer l'authentification
const [request, response, promptAsync] = AuthSession.useAuthRequest(
  {
    clientId: 'YOUR_CLIENT_ID',
    scopes: ['user-read-playback-state', 'user-modify-playback-state'],
    usePKCE: true,
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'yourapp'
    }),
  },
  discovery
);
```

**Note importante:** Il y a des rapports récents (2025) de problèmes avec PKCE via expo-auth-session retournant des erreurs `INVALID_CLIENT`. Solution de contournement disponible mais nécessite tests approfondis.

**Alternative:** Bibliothèque `react-native-app-auth` (https://nearform.com/open-source/react-native-app-auth/docs/providers/spotify/)

### 1.3 Endpoints API nécessaires

#### A. Recherche de tracks

**Endpoint:** `GET https://api.spotify.com/v1/search`

**Paramètres:**
```
q: "track:Hello artist:Adele"
type: "track"
limit: 20
market: "FR"
offset: 0
```

**Exemple de requête:**
```bash
curl -X GET "https://api.spotify.com/v1/search?q=hello&type=track&limit=1" \
  -H "Authorization: Bearer {access_token}"
```

**Réponse (structure):**
```json
{
  "tracks": {
    "items": [
      {
        "id": "0pt5TAXJSwDAKSLpJxPSnN",
        "name": "Hello",
        "artists": [
          {
            "name": "Adele",
            "id": "4dpARuHxo51G3z768sgnrY"
          }
        ],
        "album": {
          "name": "25",
          "images": [
            {
              "url": "https://...",
              "height": 640,
              "width": 640
            }
          ]
        },
        "duration_ms": 295493,
        "uri": "spotify:track:0pt5TAXJSwDAKSLpJxPSnN"
      }
    ]
  }
}
```

#### B. Récupération métadonnées track

**Endpoint:** `GET https://api.spotify.com/v1/tracks/{id}`

**Exemple:**
```bash
curl -X GET "https://api.spotify.com/v1/tracks/0pt5TAXJSwDAKSLpJxPSnN" \
  -H "Authorization: Bearer {access_token}"
```

**Données disponibles:**
- Titre, artiste(s), album
- Durée (en millisecondes)
- Images de couverture (plusieurs tailles)
- Popularité (0-100)
- ISRC, numéro de track
- Preview URL (30 secondes)

#### C. Contrôle de playback

**IMPORTANT:** Nécessite un compte Spotify Premium pour l'utilisateur final

**1. Démarrer/Reprendre la lecture**

**Endpoint:** `PUT https://api.spotify.com/v1/me/player/play`

**Scope requis:** `user-modify-playback-state`

**Body:**
```json
{
  "uris": ["spotify:track:0pt5TAXJSwDAKSLpJxPSnN"],
  "position_ms": 0
}
```

**2. Pause**

**Endpoint:** `PUT https://api.spotify.com/v1/me/player/pause`

**3. Seek to position (CRUCIAL pour votre use case)**

**Endpoint:** `PUT https://api.spotify.com/v1/me/player/seek`

**Paramètres:**
```
position_ms: 45000  // Se positionner à 45 secondes
```

**Exemple:**
```bash
curl -X PUT "https://api.spotify.com/v1/me/player/seek?position_ms=45000" \
  -H "Authorization: Bearer {access_token}"
```

**4. Obtenir l'état de lecture actuel**

**Endpoint:** `GET https://api.spotify.com/v1/me/player`

**Scope requis:** `user-read-playback-state`

### 1.4 Limitations et Quotas

#### Rate Limits

**Calcul:** Fenêtre glissante de 30 secondes

**Modes de quotas:**

1. **Mode Development (par défaut):**
   - Limite inférieure (non spécifiée publiquement)
   - Maximum 25 utilisateurs authentifiés
   - Parfait pour développement et tests

2. **Mode Extended Quota:**
   - Limite beaucoup plus élevée
   - Utilisateurs illimités
   - Depuis mai 2025: Réservé aux organisations (pas aux particuliers)
   - Application via email d'entreprise requis

**Gestion des rate limits:**
- Erreur HTTP 429 en cas de dépassement
- Header `Retry-After` indique le délai d'attente (en secondes)
- Stratégie de backoff-retry recommandée

**Bonnes pratiques:**
- Utiliser les APIs batch quand possible
- Implémenter lazy loading
- Monitorer usage via Developer Dashboard
- Utiliser `snapshot_id` pour playlists (éviter refresh inutiles)

### 1.5 Exigences et prérequis

**Compte développeur:**
- Gratuit sur https://developer.spotify.com/
- Création d'une app pour obtenir Client ID et Client Secret
- Configuration du Redirect URI

**Configuration app Spotify:**
1. Aller sur Dashboard: https://developer.spotify.com/dashboard
2. Créer une nouvelle app
3. Copier Client ID
4. Ajouter Redirect URI (ex: `yourapp://callback`)
5. Configurer les paramètres de l'app

**Aucun coût:** 100% gratuit pour tous les développeurs

### 1.6 SDK React Native

**Statut:** SDK natif DEPRECATED

**Ancien SDK (lufinkey/react-native-spotify):**
- Archivé et non maintenu depuis 2020
- Ne doit PAS être utilisé

**Solutions actuelles pour React Native:**

1. **Web API uniquement (RECOMMANDÉ):**
   - Utiliser Web API pour contrôle remote
   - Contrôler playback sur les devices Spotify Connect de l'utilisateur
   - Fonctionne sur iOS et Android
   - Pas de streaming direct dans l'app

2. **Web Playback SDK (Limitation):**
   - Conçu pour navigateurs web uniquement
   - Ne fonctionne PAS dans React Native
   - Nécessite Spotify Premium
   - Peut être intégré via WebView (avec limitations)

3. **Approche WebView (Hack):**
   - Embed Web Playback SDK dans WebView
   - Problèmes de compatibilité signalés (Android 11)
   - Fonctionne sur Android 14-15
   - Solution non officielle et fragile

**IMPLICATION POUR VOTRE APP:**
- Vous devrez contrôler le playback sur les devices Spotify Connect existants de l'utilisateur
- L'app ne streame PAS directement l'audio
- L'utilisateur doit avoir l'app Spotify installée ou un device Connect actif
- Cela fonctionne comme une "télécommande" pour Spotify

### 1.7 Résumé Spotify

**Points forts:**
- API gratuite et bien documentée
- OAuth PKCE moderne et sécurisé
- Endpoints complets pour recherche et métadonnées
- Support seek to position précis
- Rate limits généreux en mode Extended
- Contrôle playback via Web API
- Grande communauté de développeurs

**Points faibles:**
- SDK natif React Native deprecated
- Nécessite Spotify Premium pour playback control
- Pas de streaming audio direct dans l'app
- Quelques problèmes PKCE rapportés avec expo-auth-session
- Mode Extended quota réservé aux organisations (2025)

**Difficulté d'implémentation:** 3/5
- OAuth: Moyen (PKCE bien documenté)
- Recherche/Métadonnées: Facile
- Playback control: Moyen (nécessite device Connect)

**RECOMMANDATION:** PRIORITAIRE - Meilleure option pour commencer

---

## 2. APPLE MUSIC API

### 2.1 Vue d'ensemble

**Statut 2025:** Opérationnel, MusicKit disponible pour iOS, Android et Web
**Coût:** $99 USD/an (Apple Developer Program)
**Documentation:** Bonne mais technique
**Difficulté d'implémentation:** 4/5

### 2.2 Authentification (JWT Developer Token + User Token)

#### Architecture d'authentification à deux niveaux

**Niveau 1: Developer Token (JWT)**

Le Developer Token est un JWT que vous créez et signez côté serveur (ou client avec précautions).

**Prérequis:**
- Compte Apple Developer Program ($99/an)
- Créer un MusicKit Identifier dans Certificates, Identifiers & Profiles
- Générer une clé privée (.p8 file)
- Obtenir Key ID et Team ID (10 caractères)

**Structure JWT:**

**Header:**
```json
{
  "alg": "ES256",
  "kid": "YOUR_KEY_ID"
}
```

**Payload:**
```json
{
  "iss": "YOUR_TEAM_ID",
  "iat": 1633024800,
  "exp": 1640800800
}
```

**Signature:** Algorithme ES256 (pas tous les libs JWT le supportent)

**Implémentation:**
```javascript
// Exemple Node.js (génération côté serveur recommandée)
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('AuthKey_XXXXX.p8');

const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d',
  issuer: 'YOUR_TEAM_ID',
  header: {
    alg: 'ES256',
    kid: 'YOUR_KEY_ID'
  }
});
```

**Niveau 2: User Token (Music User Token)**

Obtenu via MusicKit JS ou SDK natif après que l'utilisateur s'authentifie.

**Flow:**
1. Charger MusicKit avec votre Developer Token
2. Appeler `authorize()` pour authentifier l'utilisateur
3. Recevoir le Music User Token
4. Utiliser ce token pour accéder aux données personnelles

### 2.3 Endpoints API nécessaires

**Base URL:** `https://api.music.apple.com/v1`

#### A. Recherche dans le catalogue

**Endpoint:** `GET /v1/catalog/{storefront}/search`

**Paramètres:**
```
term: "Hello Adele"
types: "songs"
limit: 25
offset: 0
```

**Storefront:** Code pays (ex: "fr", "us", "ca")

**Exemple:**
```bash
curl -X GET "https://api.music.apple.com/v1/catalog/us/search?term=hello&types=songs&limit=1" \
  -H "Authorization: Bearer {developer_token}"
```

**Réponse:**
```json
{
  "results": {
    "songs": {
      "data": [
        {
          "id": "1051394215",
          "type": "songs",
          "attributes": {
            "name": "Hello",
            "artistName": "Adele",
            "albumName": "25",
            "durationInMillis": 295493,
            "releaseDate": "2015-10-23",
            "artwork": {
              "width": 3000,
              "height": 3000,
              "url": "https://...{w}x{h}bb.jpg"
            },
            "previews": [
              {
                "url": "https://audio-ssl.itunes.apple.com/..."
              }
            ]
          }
        }
      ]
    }
  }
}
```

#### B. Obtenir métadonnées d'une chanson

**Endpoint:** `GET /v1/catalog/{storefront}/songs/{id}`

**Headers:**
```
Authorization: Bearer {developer_token}
```

**Données disponibles:**
- Titre, artiste, album
- Durée en millisecondes
- Date de sortie
- Artwork (URL template avec {w}x{h})
- Genre, compositeur
- ISRC
- Preview URLs (30 secondes)

**Paramètres avancés:**
- `include`: Pour inclure relations (albums, artists)
- `extend`: Pour attributs étendus

#### C. Contrôle de playback

**IMPORTANT:** Playback nécessite MusicKit natif (iOS) ou Android SDK

**MusicKit pour iOS:**
```swift
// Initialiser
let controller = ApplicationMusicPlayer.shared

// Jouer une chanson
controller.queue = [song]
try await controller.play()

// Seek to position
controller.playbackTime = TimeInterval(45.0) // 45 secondes
```

**MusicKit pour Android:**
```java
MediaPlayerController controller = MediaPlayerController.getInstance();

// Jouer
controller.play();

// Pause
controller.pause();

// Seek
controller.seekToPosition(45000); // millisecondes
```

**API REST pour playback:** Non disponible (contrairement à Spotify)

### 2.4 Limitations et Quotas

#### Rate Limits

**Header de réponse:** `X-Rate-Limit`

**Structure:**
```
X-Rate-Limit-User-Hour-Lim: 10
X-Rate-Limit-User-Hour-Rem: 8
```

**Limites:**
- Calculées par user token par heure
- Varient selon le type de requête
- Non officiellement documentées
- Rapports tiers: ~20 requêtes/seconde/user
- Limite horaire: Variable (10-100+ selon source)

**Erreur rate limit:**
```json
{
  "errors": [
    {
      "status": "429",
      "code": "RATE_LIMIT_EXCEEDED",
      "title": "Rate Limit Exceeded"
    }
  ]
}
```

**Particularité:**
- Requêtes au catalogue (cache Apple) ne comptent pas toujours dans la limite
- Requêtes personnalisées comptent toujours

### 2.5 Support Android

**MusicKit pour Android:** DISPONIBLE

**Capacités:**
- Authentification utilisateurs Apple Music
- Contrôle playback complet
- Accès à l'API Apple Music
- Playback audio natif dans l'app

**Bibliothèques:**
- SDK Java/Kotlin officiel
- `com.apple.android.music`
- MediaPlayerController pour playback
- Authentification intégrée

**React Native:**
- Pas de package officiel React Native
- Packages communautaires disponibles mais limités:
  - `@lomray/react-native-apple-music` (iOS 15+ focus)
  - `react-native-apple-music` (Lemonadd-UG) - iOS uniquement
  - `@bouncyapp/react-native-apple-music` (5+ ans, obsolète)

**DÉFI:** Intégration React Native nécessite bridges natifs personnalisés pour iOS et Android

### 2.6 Exigences et coûts

**Apple Developer Program:** $99 USD/an (OBLIGATOIRE)

**Inclus dans le membership:**
- Accès MusicKit et Apple Music API
- Génération de clés privées
- Distribution d'apps iOS et Android
- Certificats et provisioning profiles

**Exemptions possibles:**
- Organisations à but non lucratif
- Institutions éducatives
- Organismes gouvernementaux
(Sur demande, cas par cas)

**Pas de frais API additionnels** une fois le membership actif

### 2.7 SDK React Native

**Statut:** Pas de SDK officiel React Native

**Options disponibles:**

1. **@lomray/react-native-apple-music**
   - Package npm communautaire
   - Focus iOS (15.0+)
   - Support Android incertain
   - Maintenance limitée

2. **react-native-apple-music (Lemonadd-UG)**
   - iOS uniquement (déclaré dans le README)
   - Ancien (dernière mise à jour 2019)

3. **Bridges natifs personnalisés (RECOMMANDÉ si choix Apple Music)**
   - Wrapper Swift/Kotlin pour MusicKit
   - Expo-native-modules
   - Contrôle total mais développement complexe

**MusicKit JS (Web):**
- Fonctionne dans navigateurs
- Pourrait être intégré via WebView dans React Native
- Pas de solution officielle pour mobile natif

### 2.8 Résumé Apple Music

**Points forts:**
- API complète et riche en métadonnées
- Support officiel iOS ET Android
- Playback audio natif dans l'app (pas de remote control)
- Catalogue musical massif
- Qualité audio élevée

**Points faibles:**
- Coût: $99/an OBLIGATOIRE
- Pas de SDK React Native officiel
- Authentification JWT complexe (ES256)
- Rate limits peu documentés
- Nécessite développement de bridges natifs pour React Native
- Difficulté d'implémentation élevée

**Difficulté d'implémentation:** 4/5
- Authentification: Difficile (JWT ES256)
- SDK React Native: Très difficile (bridges custom)
- Playback control: Moyen (SDK natifs performants)

**RECOMMANDATION:** À ÉVITER pour l'instant
- Coût trop élevé pour démarrer
- Complexité React Native excessive
- Prioriser Spotify ou SoundCloud d'abord

---

## 3. SOUNDCLOUD API

### 3.1 Vue d'ensemble

**Statut 2025:** Opérationnel, migration OAuth 2.1 complétée
**Coût:** GRATUIT (actuellement)
**Documentation:** Correcte, en transition vers OpenAPI Spec
**Difficulté d'implémentation:** 3.5/5

### 3.2 Authentification OAuth 2.1

#### Migration OAuth 2.0 → 2.1

**Date limite migration:** 1er octobre 2024 (passée)
**Protocole actuel:** OAuth 2.1 (PKCE obligatoire)

**Changements majeurs:**

1. **PKCE obligatoire:** Tous les clients doivent utiliser Proof Key for Code Exchange
2. **Tous clients = confidentiels:** Un secret est requis pour obtenir un token
3. **Tokens expiration:** ~1 heure de vie
4. **Refresh tokens:** Obligatoire pour maintenir l'accès

#### Flow OAuth 2.1 avec PKCE

**Étape 1: Enregistrement app**

**IMPORTANT:** Le formulaire d'enregistrement public est fermé depuis plusieurs années.

**Processus actuel (2025):**
1. Créer un compte SoundCloud
2. Contacter SoundCloud Support: https://help.soundcloud.com/hc/en-us/requests/new
3. Fournir:
   - Nom de l'app
   - Description
   - Usage prévu
   - Redirect URI
4. Recevoir réponse sous 48h
5. Accéder à l'app: https://soundcloud.com/you/apps

**Credentials reçus:**
- Client ID
- Client Secret (NOUVEAU en OAuth 2.1)

**Étape 2: Authorization Request**

**Endpoint:** `https://api.soundcloud.com/connect`

**Paramètres:**
```
client_id: YOUR_CLIENT_ID
response_type: code
redirect_uri: yourapp://callback
scope: non-expiring (optionnel)
code_challenge: BASE64_URL_ENCODED_CHALLENGE
code_challenge_method: S256
```

**Étape 3: Token Exchange**

**Endpoint:** `POST https://api.soundcloud.com/oauth2/token`

**Body:**
```json
{
  "grant_type": "authorization_code",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "redirect_uri": "yourapp://callback",
  "code": "AUTHORIZATION_CODE",
  "code_verifier": "ORIGINAL_VERIFIER"
}
```

**Réponse:**
```json
{
  "access_token": "1-138878-...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "1-138878-...",
  "scope": "non-expiring"
}
```

**Étape 4: Refresh Token**

**Endpoint:** `POST https://api.soundcloud.com/oauth2/token`

**Body:**
```json
{
  "grant_type": "refresh_token",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "REFRESH_TOKEN"
}
```

#### Client Credentials Flow (accès public uniquement)

Pour recherche et lecture de contenu public SANS authentification utilisateur:

**Endpoint:** `POST https://api.soundcloud.com/oauth2/token`

**Body:**
```json
{
  "grant_type": "client_credentials",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET"
}
```

**Limites:**
- 50 tokens / 12h par app
- 30 tokens / 1h par IP

### 3.3 Endpoints API nécessaires

**Base URL:** `https://api.soundcloud.com`

**Documentation:** OpenAPI Spec Swagger UI: https://developers.soundcloud.com/docs/api/explorer/open-api

#### A. Recherche de tracks

**Endpoint:** `GET /tracks`

**Paramètres:**
```
q: "Hello Adele"
limit: 50
offset: 0
linked_partitioning: 1
```

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Exemple:**
```bash
curl -X GET "https://api.soundcloud.com/tracks?q=hello&limit=10" \
  -H "Authorization: Bearer {access_token}"
```

**Réponse:**
```json
{
  "collection": [
    {
      "id": 123456789,
      "title": "Hello",
      "user": {
        "username": "AdeleVEVO"
      },
      "duration": 295493,
      "artwork_url": "https://i1.sndcdn.com/artworks-...",
      "stream_url": "https://api.soundcloud.com/tracks/123456789/stream",
      "streamable": true,
      "permalink_url": "https://soundcloud.com/adele/hello"
    }
  ],
  "next_href": "https://api.soundcloud.com/tracks?..."
}
```

#### B. Obtenir métadonnées track

**Endpoint:** `GET /tracks/{track_id}`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Données disponibles:**
- Titre, artiste (user)
- Durée (millisecondes)
- Artwork URL
- Description, tags
- Waveform data
- Playback count, likes count
- Genre, BPM
- Licence

**Filtre `access` (nouveau):**
```
access=playable,preview,blocked
```
Permet de récupérer métadonnées même pour tracks non jouables

#### C. Streaming / Playback

**Endpoint:** `GET /tracks/{track_urn}/play`

**Response:** URLs de streaming HLS AAC

**Formats disponibles (2025):**

1. **hls_aac_160_url** (Recommandé)
   - Qualité standard
   - Format préféré
   - HLS AAC 160 kbps

2. **hls_aac_96_url** (Alternative)
   - Qualité inférieure
   - HLS AAC 96 kbps

**IMPORTANT - Dépréciation prévue:**
- Progressive HTTP: Retiré le 15 novembre 2025
- HLS MP3: Retiré le 15 novembre 2025
- HLS Opus: Retiré le 15 novembre 2025

**Utiliser uniquement HLS AAC pour de nouveaux projets**

**Exemple requête:**
```bash
curl -X GET "https://api.soundcloud.com/tracks/{urn}/play" \
  -H "Authorization: Bearer {access_token}"
```

**Réponse:**
```json
{
  "hls_aac_160_url": "https://hls-...m3u8",
  "hls_aac_96_url": "https://hls-...m3u8"
}
```

**Playback dans React Native:**

Utiliser un player HLS comme:
- `react-native-video` (recommandé)
- `expo-av` (pour Expo)

```javascript
import Video from 'react-native-video';

<Video
  source={{ uri: hls_aac_160_url }}
  audioOnly={true}
  playInBackground={true}
  playWhenInactive={true}
  onProgress={(data) => {
    // data.currentTime pour position actuelle
  }}
  onSeek={(data) => {
    // Seek completed
  }}
/>
```

**Seek to position:**
```javascript
// Utiliser ref du Video component
videoRef.current.seek(45.0); // Secondes
```

#### D. Mise à jour métadonnées (optionnel)

**Endpoint:** `PUT /tracks/{track_id}`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Body:** Propriétés à mettre à jour

### 3.4 Limitations et Quotas

#### Rate Limits

**Limite principale:**
- **15,000 requêtes / 24h** pour accès aux streams jouables
- S'applique à `/tracks/:id/stream` et `/tracks/:id/play`

**Calcul:**
- Par Client ID (pas par utilisateur ou IP)
- Fenêtre glissante de 24h
- Pas de limite globale en dehors des streams

**Token limits (Client Credentials):**
- 50 tokens / 12h par app
- 30 tokens / 1h par IP

**Erreur rate limit:**
```
HTTP 429 Too Many Requests
```

**Problème rapporté (Janvier 2025):**
- Certains devs rapportent "Rate Limit Exceeded" après 2-3 appels en 10 secondes
- Limites non documentées possibles
- Nécessite implémentation de backoff strategy

#### Accès et restrictions

**High-Tier Content:**
- Certains contenus nécessitent accords spéciaux
- Label music, contenus premium
- API retourne `streamable: false`

**Access filter:**
- `playable`: Tracks jouables directement
- `preview`: Previews uniquement
- `blocked`: Bloqués dans la région

### 3.5 Exigences et coûts

**Coût API:** GRATUIT actuellement

**Réserve de SoundCloud:**
> "Access to the SoundCloud API is currently provided free of charge, though SoundCloud reserves the right to charge at some point in the future with advance notice to developers."

**Enregistrement app:**
- Via support ticket (formulaire fermé)
- Réponse sous ~48h
- Gratuit

**Pas de coûts récurrents** tant que l'API reste gratuite

### 3.6 SDK React Native

**Statut:** Pas de SDK officiel

**Wrappers disponibles:**
- Listés sur: https://developers.soundcloud.com/docs/api/sdks
- Principalement pour web (JavaScript)
- Aucun spécifique React Native

**Solution recommandée:**

1. **Authentification:** Implémenter OAuth 2.1 avec `expo-auth-session`

2. **API calls:** Utiliser `fetch` ou `axios`

```javascript
const searchTracks = async (query, token) => {
  const response = await fetch(
    `https://api.soundcloud.com/tracks?q=${encodeURIComponent(query)}&limit=20`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};
```

3. **Playback:** `react-native-video` ou `expo-av` pour HLS streams

```javascript
import { Audio } from 'expo-av';

const sound = new Audio.Sound();
await sound.loadAsync({ uri: hls_aac_160_url });
await sound.playAsync();

// Seek
await sound.setPositionAsync(45000); // millisecondes
```

**Avantage SoundCloud vs Spotify:**
- URLs de stream directes (HLS)
- Playback natif dans l'app possible
- Pas de dépendance à un device externe

### 3.7 Résumé SoundCloud

**Points forts:**
- API gratuite (pour l'instant)
- Streaming audio direct dans l'app (HLS)
- Pas de dépendance device externe
- Seek to position natif possible
- Catalogue unique (contenus indépendants, remixes, etc.)
- OAuth 2.1 moderne avec PKCE

**Points faibles:**
- Enregistrement app via support (pas automatique)
- OAuth 2.1 avec client_secret obligatoire (complexité)
- Rate limits assez restrictifs (15K/24h pour streams)
- Dépréciation formats prévue (novembre 2025)
- Incertitude sur gratuité future
- Problèmes rate limits récents rapportés
- Pas de SDK officiel React Native
- Catalogue moins exhaustif que Spotify/Apple Music

**Difficulté d'implémentation:** 3.5/5
- Enregistrement: Moyen (via support)
- OAuth 2.1: Moyen-Difficile (PKCE + secret)
- Playback: Facile (HLS natif)

**RECOMMANDATION:** SECONDAIRE
- Bonne alternative gratuite à Spotify
- Streaming direct dans l'app = avantage
- Implémenter après Spotify
- Incertitude future (gratuité, rate limits)

---

## 4. TABLEAU COMPARATIF

| Critère | Spotify | Apple Music | SoundCloud |
|---------|---------|-------------|------------|
| **COÛT** | GRATUIT | $99/an | GRATUIT* |
| **OAuth/Auth** | PKCE (OAuth 2.0) | JWT + User Token | OAuth 2.1 + PKCE |
| **Complexité Auth** | Moyen | Difficile | Moyen-Difficile |
| **SDK React Native** | Deprecated | Aucun officiel | Aucun |
| **Streaming dans app** | NON (remote) | OUI (natif) | OUI (HLS) |
| **Seek to position** | OUI (remote) | OUI (natif) | OUI (natif) |
| **Premium requis** | OUI (playback) | OUI (abonnement) | NON |
| **Rate Limits** | 30s window | ~10-100/h/user | 15K/24h (streams) |
| **Quota Dev Mode** | 25 users | N/A | Illimité |
| **Endpoints Search** | Excellent | Excellent | Bon |
| **Métadonnées** | Riches | Très riches | Bonnes |
| **Playback Control** | Remote API | SDK natif | HLS direct |
| **Support Android** | OUI | OUI | OUI |
| **Documentation** | Excellente | Bonne | Correcte |
| **Stabilité API** | Très stable | Stable | Stable** |
| **Communauté dev** | Grande | Moyenne | Petite |
| **Difficulté totale** | 3/5 | 4/5 | 3.5/5 |
| **RECOMMANDATION** | **PRIORITAIRE** | À éviter | SECONDAIRE |

*SoundCloud: Gratuit actuellement, peut changer à l'avenir
**SoundCloud: Problèmes rate limits récents signalés

---

## 5. PLAN D'IMPLÉMENTATION RECOMMANDÉ

### Phase 1: SPOTIFY (Prioritaire)

**Durée estimée:** 2-3 semaines

**Étapes:**

1. **Setup compte développeur** (Jour 1)
   - Créer compte sur https://developer.spotify.com/
   - Créer nouvelle app
   - Configurer Redirect URI

2. **Implémentation OAuth PKCE** (Jours 2-5)
   - Installer `expo-auth-session`
   - Implémenter code verifier/challenge
   - Tester flow d'authentification
   - Gérer refresh tokens
   - Stockage sécurisé (SecureStore)

3. **Recherche et métadonnées** (Jours 6-8)
   - Implémenter endpoint `/search`
   - Parser résultats
   - Afficher thumbnails, artistes
   - Cache résultats (AsyncStorage)

4. **Playback control** (Jours 9-14)
   - Vérifier devices Spotify Connect disponibles
   - Implémenter play/pause/seek
   - Gérer états de playback
   - Error handling (Premium requis)
   - UI pour contrôles

5. **Tests et optimisations** (Jours 15-21)
   - Tests iOS et Android
   - Gestion erreurs et edge cases
   - Rate limiting strategy
   - UX polish

**Livrables Phase 1:**
- Authentification Spotify fonctionnelle
- Recherche de tracks opérationnelle
- Contrôle playback basique (sur device Connect)
- Documentation technique

### Phase 2: SOUNDCLOUD (Secondaire)

**Durée estimée:** 2-2.5 semaines

**Étapes:**

1. **Enregistrement API** (Jours 1-3)
   - Contacter SoundCloud Support
   - Attendre approbation (~48h)
   - Recevoir credentials

2. **OAuth 2.1 implementation** (Jours 4-8)
   - Implémenter PKCE flow
   - Gérer client_secret (sécurité)
   - Token refresh logic
   - Client Credentials pour contenu public

3. **Intégration API** (Jours 9-12)
   - Search endpoint
   - Métadonnées tracks
   - Récupération stream URLs

4. **Playback HLS** (Jours 13-17)
   - Intégrer `react-native-video` ou `expo-av`
   - Player HLS AAC
   - Seek implementation
   - Contrôles audio

5. **Tests et finition** (Jours 18-21)
   - Tests cross-platform
   - Gestion rate limits
   - Fallback si Spotify indisponible

**Livrables Phase 2:**
- Authentification SoundCloud
- Recherche alternative
- Playback audio natif dans l'app
- Fallback système entre APIs

### Phase 3: APPLE MUSIC (Optionnel - Si budget)

**Durée estimée:** 3-4 semaines

**Prérequis:**
- Budget $99/an validé
- Besoin confirmé pour utilisateurs Apple Music

**Étapes:**

1. **Setup Apple Developer** (Jours 1-2)
   - Inscription Apple Developer Program
   - Créer MusicKit identifier
   - Générer clés privées (.p8)

2. **JWT Developer Token** (Jours 3-5)
   - Implémenter signature JWT ES256
   - Générer tokens côté serveur
   - Distribution sécurisée vers app

3. **Bridges natifs React Native** (Jours 6-15)
   - Wrapper Swift pour iOS MusicKit
   - Wrapper Kotlin pour Android SDK
   - React Native Native Modules
   - Interface JavaScript unifiée

4. **Intégration API** (Jours 16-20)
   - Search catalog
   - Métadonnées
   - User authentication
   - Music User Token

5. **Playback natif** (Jours 21-28)
   - iOS: ApplicationMusicPlayer
   - Android: MediaPlayerController
   - Contrôles via bridge
   - Seek, play, pause

**Livrables Phase 3:**
- API Apple Music opérationnelle
- Bridges natifs iOS/Android
- Playback natif haute qualité
- Support complet 3 plateformes

---

## 6. EXEMPLES DE CODE

### 6.1 Spotify OAuth PKCE (Expo)

```javascript
// SpotifyAuth.js
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

const SPOTIFY_CLIENT_ID = 'YOUR_CLIENT_ID';
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'yourapp',
  path: 'callback'
});

const SPOTIFY_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming'
];

export const useSpotifyAuth = () => {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SCOPES,
      usePKCE: true, // Active PKCE automatiquement
      redirectUri: REDIRECT_URI,
    },
    SPOTIFY_DISCOVERY
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      exchangeCodeForToken(code);
    }
  }, [response]);

  const exchangeCodeForToken = async (code) => {
    const codeVerifier = await SecureStore.getItemAsync('codeVerifier');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }).toString(),
    });

    const tokens = await response.json();

    // Stocker tokens de manière sécurisée
    await SecureStore.setItemAsync('accessToken', tokens.access_token);
    await SecureStore.setItemAsync('refreshToken', tokens.refresh_token);

    return tokens;
  };

  const login = () => {
    promptAsync();
  };

  return { login, request };
};
```

### 6.2 Recherche Spotify

```javascript
// SpotifyAPI.js
import * as SecureStore from 'expo-secure-store';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export const searchTracks = async (query) => {
  const accessToken = await SecureStore.getItemAsync('accessToken');

  const response = await fetch(
    `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 401) {
    // Token expired, refresh it
    await refreshAccessToken();
    return searchTracks(query); // Retry
  }

  const data = await response.json();

  return data.tracks.items.map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    duration: track.duration_ms,
    thumbnail: track.album.images[0]?.url,
    uri: track.uri,
  }));
};

export const playTrack = async (trackUri, positionMs = 0) => {
  const accessToken = await SecureStore.getItemAsync('accessToken');

  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/player/play`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [trackUri],
        position_ms: positionMs,
      }),
    }
  );

  if (response.status === 403) {
    const error = await response.json();
    if (error.error.reason === 'PREMIUM_REQUIRED') {
      throw new Error('Spotify Premium required');
    }
  }

  return response.ok;
};

export const seekToPosition = async (positionMs) => {
  const accessToken = await SecureStore.getItemAsync('accessToken');

  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/player/seek?position_ms=${positionMs}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  return response.ok;
};

const refreshAccessToken = async () => {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: SPOTIFY_CLIENT_ID,
    }).toString(),
  });

  const tokens = await response.json();
  await SecureStore.setItemAsync('accessToken', tokens.access_token);

  if (tokens.refresh_token) {
    await SecureStore.setItemAsync('refreshToken', tokens.refresh_token);
  }

  return tokens.access_token;
};
```

### 6.3 Playback SoundCloud (HLS)

```javascript
// SoundCloudPlayer.js
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';

export const useSoundCloudPlayer = () => {
  const sound = useRef(new Audio.Sound());
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Configure audio mode
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });

    return () => {
      sound.current.unloadAsync();
    };
  }, []);

  const loadTrack = async (hlsUrl) => {
    try {
      await sound.current.unloadAsync();
      await sound.current.loadAsync(
        { uri: hlsUrl },
        { shouldPlay: false }
      );

      const status = await sound.current.getStatusAsync();
      setDuration(status.durationMillis);

      // Listen to playback updates
      sound.current.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setIsPlaying(status.isPlaying);
        }
      });
    } catch (error) {
      console.error('Error loading track:', error);
    }
  };

  const play = async () => {
    await sound.current.playAsync();
  };

  const pause = async () => {
    await sound.current.pauseAsync();
  };

  const seekTo = async (positionMs) => {
    await sound.current.setPositionAsync(positionMs);
  };

  const seekToSeconds = async (seconds) => {
    await seekTo(seconds * 1000);
  };

  return {
    loadTrack,
    play,
    pause,
    seekTo,
    seekToSeconds,
    isPlaying,
    position,
    duration,
  };
};

// Usage example
const TrackPlayer = ({ trackId, accessToken }) => {
  const player = useSoundCloudPlayer();

  useEffect(() => {
    fetchAndPlay();
  }, [trackId]);

  const fetchAndPlay = async () => {
    // Get stream URL
    const response = await fetch(
      `https://api.soundcloud.com/tracks/${trackId}/play`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    await player.loadTrack(data.hls_aac_160_url);
  };

  const handleSeekTo45Seconds = () => {
    player.seekToSeconds(45);
  };

  return (
    <View>
      <Button title="Play" onPress={player.play} />
      <Button title="Pause" onPress={player.pause} />
      <Button title="Seek to 45s" onPress={handleSeekTo45Seconds} />
      <Text>Position: {Math.floor(player.position / 1000)}s</Text>
      <Text>Duration: {Math.floor(player.duration / 1000)}s</Text>
    </View>
  );
};
```

---

## 7. LIENS OFFICIELS

### Spotify

**Documentation principale:**
- Developer Portal: https://developer.spotify.com/
- Web API Reference: https://developer.spotify.com/documentation/web-api/reference
- OAuth PKCE Tutorial: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
- Rate Limits: https://developer.spotify.com/documentation/web-api/concepts/rate-limits
- Scopes: https://developer.spotify.com/documentation/web-api/concepts/scopes

**React Native:**
- React Native App Auth (Spotify): https://nearform.com/open-source/react-native-app-auth/docs/providers/spotify/
- Expo Authentication Guide: https://docs.expo.dev/guides/authentication/

**Dashboard:**
- Spotify Dashboard: https://developer.spotify.com/dashboard

### Apple Music

**Documentation principale:**
- MusicKit: https://developer.apple.com/musickit/
- Apple Music API: https://developer.apple.com/documentation/applemusicapi/
- Generating Developer Tokens: https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens
- MusicKit for Android: https://developer.apple.com/musickit/android/index.html
- Search Catalog: https://developer.apple.com/documentation/applemusicapi/search_for_catalog_resources

**Vidéos:**
- WWDC22 - Meet Apple Music API: https://developer.apple.com/videos/play/wwdc2022/10148/
- WWDC21 - Explore the catalog: https://developer.apple.com/videos/play/wwdc2021/10291/

**Membership:**
- Apple Developer Program: https://developer.apple.com/programs/
- Compare Memberships: https://developer.apple.com/support/compare-memberships/

### SoundCloud

**Documentation principale:**
- Developers Home: https://developers.soundcloud.com/
- API Guide: https://developers.soundcloud.com/docs/api/guide
- API Reference: https://developers.soundcloud.com/docs/api/reference
- OpenAPI Spec Explorer: https://developers.soundcloud.com/docs/api/explorer/open-api
- Rate Limits: https://developers.soundcloud.com/docs/api/rate-limits

**Blog technique:**
- OAuth 2.1 Migration: https://developers.soundcloud.com/blog/oauth-migration/
- Security Updates: https://developers.soundcloud.com/blog/security-updates-api/
- AAC HLS Streaming: https://developers.soundcloud.com/blog/api-streaming-urls/

**Support:**
- Contact Support (pour enregistrement app): https://help.soundcloud.com/hc/en-us/requests/new
- Apps management: https://soundcloud.com/you/apps

---

## 8. RECOMMANDATIONS FINALES

### Ordre d'implémentation conseillé:

**1. SPOTIFY (PHASE 1 - Obligatoire)**
- Commencer par Spotify pour valider le concept
- API gratuite et stable
- Documentation excellente
- Grande communauté pour support
- Compromise: Nécessite device Connect (pas de streaming direct)

**2. SOUNDCLOUD (PHASE 2 - Fortement recommandé)**
- Ajouter SoundCloud comme alternative
- Streaming direct dans l'app = meilleure UX
- Catalogue complémentaire (remixes, contenus indépendants)
- Toujours gratuit
- Fallback si Spotify indisponible

**3. APPLE MUSIC (PHASE 3 - Optionnel)**
- Uniquement si budget validé ($99/an)
- Si base utilisateurs Apple Music significative
- Nécessite développement bridges natifs
- Complexité technique élevée
- ROI à évaluer

### Architecture technique recommandée:

```
App React Native (Expo)
├── Authentication Layer
│   ├── Spotify OAuth (expo-auth-session)
│   ├── SoundCloud OAuth (expo-auth-session)
│   └── Token Management (SecureStore)
├── API Layer
│   ├── SpotifyAPI.js (search, metadata, remote playback)
│   ├── SoundCloudAPI.js (search, metadata, streams)
│   └── UnifiedMusicAPI.js (abstraction layer)
├── Playback Layer
│   ├── SpotifyRemotePlayer.js (Web API controls)
│   └── SoundCloudPlayer.js (expo-av / HLS)
└── UI Layer
    ├── Search Components
    ├── Player Controls
    └── Track Metadata Display
```

### Points d'attention:

**Spotify:**
- Nécessite Premium pour playback
- Device Connect obligatoire (éduquer utilisateurs)
- Tester PKCE avec expo-auth-session (issues rapportées)

**SoundCloud:**
- Enregistrement app via support (prévoir 2-3 jours)
- Rate limits 15K/24h (surveiller usage)
- Formats streaming en transition (utiliser HLS AAC uniquement)

**Apple Music:**
- Coût $99/an non négociable
- Bridges natifs = développement long
- Tester ROI avant d'investir

### Métriques de succès à suivre:

- Taux d'authentification réussie (objectif: >95%)
- Temps de recherche moyen (objectif: <2s)
- Erreurs playback (objectif: <5%)
- Rate limit hits (objectif: 0)
- Satisfaction utilisateurs (feedback)

---

## 9. CONCLUSION

Cette recherche approfondie démontre que **Spotify API** est le choix optimal pour démarrer votre projet React Native de recherche et lecture musicale. Malgré la limitation du playback remote (nécessitant un device Spotify Connect), l'API gratuite, la documentation excellente et la stabilité en font le meilleur candidat pour une première implémentation.

**SoundCloud API** se positionne comme une alternative complémentaire attrayante, offrant l'avantage du streaming direct dans l'application (HLS) et une API toujours gratuite. L'intégrer en Phase 2 enrichira l'expérience utilisateur et offrira un fallback robuste.

**Apple Music API**, bien que techniquement capable et offrant un playback natif de qualité, présente des barrières trop élevées (coût $99/an, complexité bridges React Native) pour justifier une implémentation précoce. Cette option devrait être considérée uniquement si le budget le permet et après validation du concept avec Spotify et SoundCloud.

**Plan d'action immédiat:**
1. Créer compte Spotify Developer
2. Configurer app et obtenir credentials
3. Implémenter OAuth PKCE avec expo-auth-session
4. Développer fonctionnalités de recherche et métadonnées
5. Intégrer contrôles playback remote

Bonne chance avec l'implémentation!

---

**Rapport généré le:** 2 Octobre 2025
**Recherche effectuée par:** Research Analyst Agent
**Sources:** Documentation officielle Spotify, Apple, SoundCloud + Communautés développeurs 2025
