/**
 * Script de test pour l'intégration Spotify
 * Usage: npx ts-node scripts/test-spotify-integration.ts
 */

import { SpotifyAuth, SpotifyAPI, SpotifyPlayer } from '../services/audio/spotify';
import { SPOTIFY_CONFIG, validateSpotifyConfig } from '../config/spotify.config';
import { Logger } from '../services/logger/Logger';

async function testSpotifyIntegration() {
  console.log('=== Test Intégration Spotify ===\n');

  // 1. Valider la configuration
  console.log('1. Validation configuration...');
  const isValid = validateSpotifyConfig();
  if (!isValid) {
    console.error('❌ Configuration invalide. Vérifiez votre .env');
    return;
  }
  console.log('✅ Configuration valide\n');

  // 2. Initialiser les services
  console.log('2. Initialisation services...');
  const auth = SpotifyAuth.getInstance(SPOTIFY_CONFIG);
  const api = SpotifyAPI.getInstance(auth);
  const player = SpotifyPlayer.getInstance(auth, api);
  console.log('✅ Services initialisés\n');

  // 3. Vérifier l'authentification
  console.log('3. Vérification authentification...');
  const isAuth = await auth.isAuthenticated();
  console.log(`   Authentifié: ${isAuth ? '✅' : '❌'}`);

  if (!isAuth) {
    console.log('\n   Pour tester complètement:');
    console.log('   1. Lancez l\'app mobile');
    console.log('   2. Utilisez SpotifyAuthExample');
    console.log('   3. Connectez-vous avec Spotify');
    console.log('   4. Relancez ce script\n');
    return;
  }

  // 4. Tester récupération token
  console.log('\n4. Test récupération token...');
  try {
    const token = await auth.getValidAccessToken();
    console.log('✅ Token récupéré:', token.substring(0, 20) + '...');
  } catch (error) {
    console.error('❌ Erreur token:', error);
    return;
  }

  // 5. Tester profil utilisateur
  console.log('\n5. Test profil utilisateur...');
  try {
    const profile = await api.getUserProfile();
    console.log('✅ Profil récupéré:');
    console.log('   Nom:', profile.display_name);
    console.log('   Email:', profile.email);
    console.log('   Pays:', profile.country);
    console.log('   Type:', profile.product);
  } catch (error) {
    console.error('❌ Erreur profil:', error);
  }

  // 6. Tester recherche
  console.log('\n6. Test recherche...');
  try {
    const tracks = await api.search('The Beatles', 5);
    console.log(`✅ Recherche réussie: ${tracks.length} résultats`);
    tracks.forEach((track, i) => {
      console.log(`   ${i + 1}. ${track.name} - ${track.artists[0].name}`);
    });
  } catch (error) {
    console.error('❌ Erreur recherche:', error);
  }

  // 7. Tester statut Premium
  console.log('\n7. Test statut Premium...');
  try {
    const isPremium = await api.checkPremiumStatus();
    console.log(`   Premium: ${isPremium ? '✅ Oui' : '❌ Non'}`);
    if (!isPremium) {
      console.log('   Note: La lecture nécessite un compte Premium');
    }
  } catch (error) {
    console.error('❌ Erreur Premium check:', error);
  }

  // 8. Afficher les logs
  console.log('\n8. Logs récents:');
  const logs = Logger.getLogs();
  console.log(`   Total: ${logs.length} logs`);
  logs.slice(-5).forEach((log) => {
    console.log(`   [${log.level}] ${log.context}: ${log.message}`);
  });

  console.log('\n=== Tests Terminés ===\n');
}

// Exécuter les tests
testSpotifyIntegration().catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
