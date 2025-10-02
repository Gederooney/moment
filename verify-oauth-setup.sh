#!/bin/bash

# Script de vérification de l'installation OAuth PKCE
# Usage: bash verify-oauth-setup.sh

echo "========================================="
echo "  Vérification OAuth PKCE Setup"
echo "========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
SUCCESS=0
WARNINGS=0
ERRORS=0

# Fonction de vérification
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((SUCCESS++))
    else
        echo -e "${RED}✗${NC} $2 (MANQUANT: $1)"
        ((ERRORS++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((SUCCESS++))
    else
        echo -e "${RED}✗${NC} $2 (MANQUANT: $1)"
        ((ERRORS++))
    fi
}

# Vérification des dossiers
echo "1. Structure des dossiers"
echo "-------------------------"
check_dir "services/music" "Dossier services/music"
check_dir "services/music/common" "Dossier common"
check_dir "services/music/spotify" "Dossier spotify"
check_dir "services/music/soundcloud" "Dossier soundcloud"
echo ""

# Vérification des services common
echo "2. Services Common"
echo "------------------"
check_file "services/music/common/types.ts" "Types communs"
check_file "services/music/common/SecureStorage.ts" "SecureStorage"
echo ""

# Vérification des services Spotify
echo "3. Services Spotify"
echo "-------------------"
check_file "services/music/spotify/types.ts" "Types Spotify"
check_file "services/music/spotify/SpotifyAuth.ts" "SpotifyAuth"
check_file "services/music/spotify/SpotifyAPI.ts" "SpotifyAPI"
check_file "services/music/spotify/SpotifyPlayer.ts" "SpotifyPlayer"
echo ""

# Vérification des services SoundCloud
echo "4. Services SoundCloud"
echo "----------------------"
check_file "services/music/soundcloud/types.ts" "Types SoundCloud"
check_file "services/music/soundcloud/SoundCloudAuth.ts" "SoundCloudAuth"
check_file "services/music/soundcloud/SoundCloudAPI.ts" "SoundCloudAPI"
check_file "services/music/soundcloud/SoundCloudPlayer.ts" "SoundCloudPlayer"
echo ""

# Vérification des fichiers d'index
echo "5. Index et Init"
echo "----------------"
check_file "services/music/index.ts" "Export centralisé"
check_file "services/music/init.ts" "Fonction d'initialisation"
check_file "services/music/README.md" "README services"
echo ""

# Vérification des hooks
echo "6. Hooks React"
echo "--------------"
check_file "hooks/useSpotifyOAuth.ts" "useSpotifyOAuth"
check_file "hooks/useSoundCloud.ts" "useSoundCloud"
echo ""

# Vérification de la documentation
echo "7. Documentation"
echo "----------------"
check_file ".env.example" "Configuration .env.example"
check_file "OAUTH_INTEGRATION_GUIDE.md" "Guide d'intégration"
check_file "OAUTH_TECHNICAL_SUMMARY.md" "Résumé technique"
check_file "MUSIC_SERVICES_EXAMPLES.tsx" "Exemples de composants"
check_file "QUICK_START_OAUTH.md" "Quick Start"
check_file "IMPLEMENTATION_CHECKLIST.md" "Checklist"
check_file "FILES_SUMMARY.md" "Résumé des fichiers"
check_file "OAUTH_IMPLEMENTATION_COMPLETE.md" "Rapport final"
echo ""

# Vérification de la configuration
echo "8. Configuration"
echo "----------------"
if [ -f ".env" ]; then
    if grep -q "SPOTIFY_CLIENT_ID=" .env && grep -q "SOUNDCLOUD_CLIENT_ID=" .env; then
        echo -e "${GREEN}✓${NC} Fichier .env configuré"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠${NC} Fichier .env existe mais incomplet"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Fichier .env manquant (utiliser .env.example)"
    ((WARNINGS++))
fi

if [ -f "app.json" ]; then
    if grep -q '"scheme"' app.json; then
        echo -e "${GREEN}✓${NC} Scheme configuré dans app.json"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠${NC} Scheme manquant dans app.json"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗${NC} app.json manquant"
    ((ERRORS++))
fi
echo ""

# Vérification des dépendances
echo "9. Dépendances"
echo "--------------"
if [ -f "package.json" ]; then
    for dep in "axios" "expo-auth-session" "expo-crypto" "expo-secure-store" "expo-av"; do
        if grep -q "\"$dep\"" package.json; then
            echo -e "${GREEN}✓${NC} $dep installé"
            ((SUCCESS++))
        else
            echo -e "${RED}✗${NC} $dep manquant"
            ((ERRORS++))
        fi
    done
else
    echo -e "${RED}✗${NC} package.json manquant"
    ((ERRORS++))
fi
echo ""

# Résumé
echo "========================================="
echo "  RÉSUMÉ"
echo "========================================="
echo -e "${GREEN}Succès: $SUCCESS${NC}"
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}Avertissements: $WARNINGS${NC}"
fi
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}Erreurs: $ERRORS${NC}"
fi
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Installation OAuth PKCE complète!${NC}"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Configurer le fichier .env avec vos credentials"
    echo "2. Initialiser les services dans app/_layout.tsx"
    echo "3. Tester le flow OAuth"
    echo ""
    echo "Documentation: QUICK_START_OAUTH.md"
    exit 0
else
    echo -e "${RED}✗ Des fichiers sont manquants${NC}"
    echo "Veuillez vérifier l'installation"
    exit 1
fi
