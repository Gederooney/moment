// Script pour débugger la playlist AsyncStorage
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function debugPlaylist() {
  try {
    // Lire la playlist
    const playlistData = await AsyncStorage.getItem('@podcut_simple_playlist');

    if (!playlistData) {
      console.log('❌ Aucune playlist trouvée dans AsyncStorage');
      console.log('La playlist a peut-être été effacée.');
      return;
    }

    const playlist = JSON.parse(playlistData);
    console.log('✅ Playlist trouvée!');
    console.log('📊 Statistiques:');
    console.log(`  - Nom: ${playlist.name}`);
    console.log(`  - Nombre de vidéos: ${playlist.videos.length}`);
    console.log(`  - Index actuel: ${playlist.currentIndex}`);
    console.log('\n📹 Vidéos dans la playlist:');

    playlist.videos.forEach((video, index) => {
      console.log(`  ${index + 1}. ${video.title}`);
      console.log(`     - ID: ${video.videoId}`);
      console.log(`     - Author: ${video.author || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

debugPlaylist();
