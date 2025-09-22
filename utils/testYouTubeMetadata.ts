/**
 * Script de test pour vérifier le service de métadonnées YouTube
 * À utiliser pour tester l'intégration pendant le développement
 */

import { fetchYouTubeMetadata, fetchYouTubeMetadataWithFallback } from '../services/youtubeMetadata';

// URLs de test YouTube
const TEST_URLS = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll (vidéo populaire)
  'https://youtu.be/dQw4w9WgXcQ', // Format court
  'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Autre vidéo populaire
  'https://www.youtube.com/watch?v=invalid_id', // URL invalide pour tester le fallback
];

/**
 * Teste la récupération des métadonnées pour une URL
 */
async function testSingleUrl(url: string) {
  console.log(`\n🧪 Test pour: ${url}`);

  try {
    // Test du service principal
    console.log('📡 Récupération des métadonnées...');
    const metadata = await fetchYouTubeMetadata(url);

    console.log('✅ Succès!');
    console.log(`📝 Titre: ${metadata.title}`);
    console.log(`👤 Auteur: ${metadata.author_name}`);
    console.log(`🖼️ Thumbnail: ${metadata.thumbnail_url}`);
    console.log(`📏 Dimensions: ${metadata.thumbnail_width}x${metadata.thumbnail_height}`);

    return { success: true, metadata };
  } catch (error) {
    console.log('❌ Échec du service principal');
    console.log(`🚨 Erreur: ${error instanceof Error ? error.message : String(error)}`);

    // Test du fallback
    try {
      console.log('🔄 Test du fallback...');
      const fallback = await fetchYouTubeMetadataWithFallback(url);

      console.log('✅ Fallback réussi!');
      console.log(`📝 Titre: ${fallback.title}`);
      console.log(`👤 Auteur: ${fallback.author_name}`);
      console.log(`🖼️ Thumbnail: ${fallback.thumbnail_url}`);
      console.log(`🔗 Source API: ${fallback.isFromApi ? 'Oui' : 'Non'}`);

      return { success: false, fallback };
    } catch (fallbackError) {
      console.log('❌ Échec du fallback aussi');
      const errorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      console.log(`🚨 Erreur fallback: ${errorMessage}`);

      return { success: false, error: errorMessage };
    }
  }
}

/**
 * Lance tous les tests
 */
export async function runYouTubeMetadataTests() {
  console.log('🚀 Début des tests du service YouTube Metadata');
  console.log('================================================');

  const results = [];

  for (const url of TEST_URLS) {
    const result = await testSingleUrl(url);
    results.push({ url, ...result });

    // Petite pause entre les tests pour éviter les rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Résumé des tests:');
  console.log('====================');

  const successCount = results.filter(r => r.success).length;
  const fallbackCount = results.filter(r => !r.success && r.fallback).length;
  const errorCount = results.filter(r => !r.success && !r.fallback).length;

  console.log(`✅ Succès API: ${successCount}/${TEST_URLS.length}`);
  console.log(`🔄 Fallback: ${fallbackCount}/${TEST_URLS.length}`);
  console.log(`❌ Erreurs: ${errorCount}/${TEST_URLS.length}`);

  if (successCount + fallbackCount === TEST_URLS.length) {
    console.log('\n🎉 Tous les tests passent! Le service est opérationnel.');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez la connectivité et les URLs.');
  }

  return results;
}

/**
 * Test rapide avec une seule URL
 */
export async function quickTest(url?: string) {
  const testUrl = url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  console.log('⚡ Test rapide du service YouTube Metadata');
  console.log('==========================================');

  const result = await testSingleUrl(testUrl);

  if (result.success) {
    console.log('\n🎉 Test rapide réussi! Le service fonctionne.');
  } else if (result.fallback) {
    console.log('\n⚠️ L\'API a échoué mais le fallback fonctionne.');
  } else {
    console.log('\n❌ Le service ne fonctionne pas correctement.');
  }

  return result;
}

/**
 * Test de performance
 */
export async function performanceTest() {
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  console.log('⏱️ Test de performance');
  console.log('=====================');

  // Premier appel (sans cache)
  console.log('📡 Premier appel (sans cache)...');
  const start1 = Date.now();
  try {
    await fetchYouTubeMetadata(testUrl);
    const duration1 = Date.now() - start1;
    console.log(`✅ Durée: ${duration1}ms`);

    // Deuxième appel (avec cache)
    console.log('📡 Deuxième appel (avec cache)...');
    const start2 = Date.now();
    await fetchYouTubeMetadata(testUrl);
    const duration2 = Date.now() - start2;
    console.log(`✅ Durée: ${duration2}ms`);

    const improvement = duration1 - duration2;
    const improvementPercent = Math.round((improvement / duration1) * 100);

    console.log(`🚀 Amélioration du cache: ${improvement}ms (${improvementPercent}%)`);

    return { firstCall: duration1, secondCall: duration2, improvement, improvementPercent };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`❌ Erreur pendant le test de performance: ${errorMessage}`);
    return null;
  }
}