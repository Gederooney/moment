/**
 * Basic tests for the playlist system
 * These are not automated unit tests but rather manual test scenarios
 * to validate the playlist functionality during development.
 */

import { PlaylistStorage } from '../services/playlistStorage';
import { Playlist, PlaylistVideo } from '../types/playlist';
import { generateId } from '../utils/generateId';

// Test data
const createTestPlaylist = (): Playlist => ({
  id: generateId(),
  name: 'Test Road Trip Playlist',
  description: 'A test playlist for long drives',
  videos: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  currentIndex: 0,
  isActive: false,
  settings: {
    autoPlay: true,
    shuffle: false,
    repeat: 'none',
  },
});

const createTestVideo = (title: string, videoId: string): Omit<PlaylistVideo, 'id' | 'order' | 'addedAt'> => ({
  videoId,
  title,
  author: 'Test Author',
  thumbnail: 'https://img.youtube.com/vi/' + videoId + '/default.jpg',
  url: 'https://youtube.com/watch?v=' + videoId,
  duration: 300, // 5 minutes
});

/**
 * Test playlist creation and storage
 */
export async function testPlaylistCreation(): Promise<boolean> {
  console.log('🧪 Testing playlist creation...');

  try {
    const playlist = createTestPlaylist();
    await PlaylistStorage.savePlaylists([playlist]);

    const loadedPlaylists = await PlaylistStorage.loadPlaylists();
    const found = loadedPlaylists.find(p => p.id === playlist.id);

    if (!found) {
      console.error('❌ Playlist not found after save/load');
      return false;
    }

    if (found.name !== playlist.name) {
      console.error('❌ Playlist name mismatch');
      return false;
    }

    console.log('✅ Playlist creation test passed');
    return true;
  } catch (error) {
    console.error('❌ Playlist creation test failed:', error);
    return false;
  }
}

/**
 * Test video management in playlist
 */
export async function testVideoManagement(): Promise<boolean> {
  console.log('🧪 Testing video management...');

  try {
    const playlist = createTestPlaylist();

    // Add videos
    const video1 = createTestVideo('Test Video 1', 'dQw4w9WgXcQ');
    const video2 = createTestVideo('Test Video 2', 'oHg5SJYRHA0');

    const playlistVideo1: PlaylistVideo = {
      ...video1,
      id: generateId(),
      order: 0,
      addedAt: new Date(),
    };

    const playlistVideo2: PlaylistVideo = {
      ...video2,
      id: generateId(),
      order: 1,
      addedAt: new Date(),
    };

    playlist.videos = [playlistVideo1, playlistVideo2];
    playlist.updatedAt = new Date();

    await PlaylistStorage.savePlaylists([playlist]);

    const loadedPlaylists = await PlaylistStorage.loadPlaylists();
    const found = loadedPlaylists.find(p => p.id === playlist.id);

    if (!found || found.videos.length !== 2) {
      console.error('❌ Videos not saved correctly');
      return false;
    }

    if (found.videos[0].title !== 'Test Video 1') {
      console.error('❌ Video data mismatch');
      return false;
    }

    console.log('✅ Video management test passed');
    return true;
  } catch (error) {
    console.error('❌ Video management test failed:', error);
    return false;
  }
}

/**
 * Test playlist navigation logic
 */
export function testPlaylistNavigation(): boolean {
  console.log('🧪 Testing playlist navigation...');

  try {
    const playlist = createTestPlaylist();

    // Add 3 test videos
    for (let i = 0; i < 3; i++) {
      const video: PlaylistVideo = {
        id: generateId(),
        videoId: `video${i}`,
        title: `Test Video ${i + 1}`,
        url: `https://youtube.com/watch?v=video${i}`,
        order: i,
        addedAt: new Date(),
      };
      playlist.videos.push(video);
    }

    // Test normal navigation
    if (getNextIndex(playlist, 0) !== 1) {
      console.error('❌ Next navigation failed');
      return false;
    }

    if (getPreviousIndex(playlist, 1) !== 0) {
      console.error('❌ Previous navigation failed');
      return false;
    }

    // Test repeat all
    playlist.settings.repeat = 'all';
    if (getNextIndex(playlist, 2) !== 0) {
      console.error('❌ Repeat all navigation failed');
      return false;
    }

    if (getPreviousIndex(playlist, 0) !== 2) {
      console.error('❌ Repeat all backward navigation failed');
      return false;
    }

    // Test repeat one
    playlist.settings.repeat = 'one';
    if (getNextIndex(playlist, 1) !== 1) {
      console.error('❌ Repeat one navigation failed');
      return false;
    }

    console.log('✅ Playlist navigation test passed');
    return true;
  } catch (error) {
    console.error('❌ Playlist navigation test failed:', error);
    return false;
  }
}

/**
 * Test shuffle functionality
 */
export function testShuffleLogic(): boolean {
  console.log('🧪 Testing shuffle logic...');

  try {
    const playlist = createTestPlaylist();

    // Add 5 test videos
    for (let i = 0; i < 5; i++) {
      const video: PlaylistVideo = {
        id: generateId(),
        videoId: `video${i}`,
        title: `Test Video ${i + 1}`,
        url: `https://youtube.com/watch?v=video${i}`,
        order: i,
        addedAt: new Date(),
      };
      playlist.videos.push(video);
    }

    playlist.settings.shuffle = true;

    // Test that shuffle returns different indices
    const currentIndex = 2;
    const shuffledIndices = new Set<number>();

    // Run shuffle multiple times to check randomness
    for (let i = 0; i < 10; i++) {
      const nextIndex = getNextIndexWithShuffle(playlist, currentIndex);
      shuffledIndices.add(nextIndex);
    }

    // Should have some variation (not always the same index)
    if (shuffledIndices.size <= 1) {
      console.error('❌ Shuffle not working - always same index');
      return false;
    }

    // Should not include current index (except in edge cases)
    const hasCurrentIndex = shuffledIndices.has(currentIndex);
    if (hasCurrentIndex && playlist.videos.length > 1) {
      console.warn('⚠️ Shuffle included current index (might be expected in edge cases)');
    }

    console.log('✅ Shuffle logic test passed');
    return true;
  } catch (error) {
    console.error('❌ Shuffle logic test failed:', error);
    return false;
  }
}

/**
 * Test data persistence after app restart simulation
 */
export async function testPersistence(): Promise<boolean> {
  console.log('🧪 Testing data persistence...');

  try {
    // Clear existing data
    await PlaylistStorage.clearAllData();

    // Create and save playlist
    const playlist = createTestPlaylist();
    playlist.videos = [
      {
        id: generateId(),
        videoId: 'testVideo',
        title: 'Persistence Test Video',
        url: 'https://youtube.com/watch?v=testVideo',
        order: 0,
        addedAt: new Date(),
      },
    ];

    await PlaylistStorage.savePlaylists([playlist]);
    await PlaylistStorage.saveActivePlaylistId(playlist.id);

    // Simulate app restart by loading fresh data
    const loadedPlaylists = await PlaylistStorage.loadPlaylists();
    const activePlaylistId = await PlaylistStorage.loadActivePlaylistId();

    if (loadedPlaylists.length !== 1) {
      console.error('❌ Persistence failed - wrong playlist count');
      return false;
    }

    if (activePlaylistId !== playlist.id) {
      console.error('❌ Persistence failed - active playlist ID not saved');
      return false;
    }

    const loadedPlaylist = loadedPlaylists[0];
    if (loadedPlaylist.videos.length !== 1) {
      console.error('❌ Persistence failed - videos not preserved');
      return false;
    }

    if (loadedPlaylist.videos[0].title !== 'Persistence Test Video') {
      console.error('❌ Persistence failed - video data corrupted');
      return false;
    }

    console.log('✅ Persistence test passed');
    return true;
  } catch (error) {
    console.error('❌ Persistence test failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
export async function runPlaylistTests(): Promise<void> {
  console.log('🚀 Starting playlist system tests...\n');

  const results = await Promise.all([
    testPlaylistCreation(),
    testVideoManagement(),
    Promise.resolve(testPlaylistNavigation()),
    Promise.resolve(testShuffleLogic()),
    testPersistence(),
  ]);

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All playlist tests passed!');
  } else {
    console.log('❌ Some tests failed. Check the logs above.');
  }
}

// Helper functions for navigation testing
function getNextIndex(playlist: Playlist, currentIndex: number): number {
  if (playlist.videos.length === 0) return 0;

  const { repeat } = playlist.settings;

  if (repeat === 'one') {
    return currentIndex;
  }

  const nextIndex = currentIndex + 1;
  if (nextIndex >= playlist.videos.length) {
    return repeat === 'all' ? 0 : currentIndex;
  }

  return nextIndex;
}

function getPreviousIndex(playlist: Playlist, currentIndex: number): number {
  if (playlist.videos.length === 0) return 0;

  const { repeat } = playlist.settings;

  if (repeat === 'one') {
    return currentIndex;
  }

  const previousIndex = currentIndex - 1;
  if (previousIndex < 0) {
    return repeat === 'all' ? playlist.videos.length - 1 : currentIndex;
  }

  return previousIndex;
}

function getNextIndexWithShuffle(playlist: Playlist, currentIndex: number): number {
  if (playlist.videos.length === 0) return 0;

  const availableIndices = playlist.videos
    .map((_, index) => index)
    .filter(index => index !== currentIndex);

  if (availableIndices.length === 0) {
    return currentIndex;
  }

  return availableIndices[Math.floor(Math.random() * availableIndices.length)];
}