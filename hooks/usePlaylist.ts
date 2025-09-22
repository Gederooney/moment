import { useMemo } from 'react';
import { usePlaylistContext } from '../contexts/PlaylistContext';
import { Playlist, PlaylistVideo, PlaylistMetrics } from '../types/playlist';

export function usePlaylist() {
  const context = usePlaylistContext();

  // Derived state and calculations
  const derivedState = useMemo(() => {
    const { playlists, activePlaylist, currentVideoIndex } = context;

    // Current video being played
    const currentVideo = activePlaylist?.videos[currentVideoIndex];

    // Playlist metrics
    const getPlaylistMetrics = (playlist: Playlist): PlaylistMetrics => {
      const totalVideos = playlist.videos.length;
      const totalDuration = playlist.videos.reduce((sum, video) => sum + (video.duration || 0), 0);

      const watchedVideos = playlist.currentIndex;
      const remainingVideos = Math.max(0, totalVideos - playlist.currentIndex);

      const watchedDuration = playlist.videos
        .slice(0, playlist.currentIndex)
        .reduce((sum, video) => sum + (video.duration || 0), 0);

      const remainingDuration = totalDuration - watchedDuration;

      const completionPercentage = totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0;

      return {
        totalDuration,
        totalVideos,
        remainingDuration,
        remainingVideos,
        completionPercentage,
      };
    };

    // Active playlist metrics
    const activePlaylistMetrics = activePlaylist ? getPlaylistMetrics(activePlaylist) : null;

    // Has next video
    const hasNextVideo = activePlaylist ?
      (activePlaylist.settings.repeat !== 'none' || currentVideoIndex < activePlaylist.videos.length - 1) : false;

    // Has previous video
    const hasPreviousVideo = activePlaylist ?
      (activePlaylist.settings.repeat !== 'none' || currentVideoIndex > 0) : false;

    // Can shuffle
    const canShuffle = activePlaylist ? activePlaylist.videos.length > 1 : false;

    // Next video preview
    const getNextVideoIndex = (playlist: Playlist, index: number): number => {
      if (playlist.videos.length === 0) return 0;

      const { shuffle, repeat } = playlist.settings;

      if (repeat === 'one') return index;

      if (shuffle) {
        const availableIndices = playlist.videos
          .map((_, i) => i)
          .filter(i => i !== index);
        return availableIndices.length > 0
          ? availableIndices[Math.floor(Math.random() * availableIndices.length)]
          : index;
      }

      const nextIndex = index + 1;
      return nextIndex >= playlist.videos.length
        ? (repeat === 'all' ? 0 : index)
        : nextIndex;
    };

    const nextVideoIndex = activePlaylist ? getNextVideoIndex(activePlaylist, currentVideoIndex) : -1;
    const nextVideo = activePlaylist?.videos[nextVideoIndex];

    return {
      currentVideo,
      activePlaylistMetrics,
      hasNextVideo,
      hasPreviousVideo,
      canShuffle,
      nextVideo,
      getPlaylistMetrics,
    };
  }, [context]);

  // Utility functions
  const utils = useMemo(() => ({
    // Find playlist by ID
    findPlaylistById: (id: string): Playlist | undefined => {
      return context.playlists.find(p => p.id === id);
    },

    // Find video in playlist
    findVideoInPlaylist: (playlistId: string, videoId: string): PlaylistVideo | undefined => {
      const playlist = context.playlists.find(p => p.id === playlistId);
      return playlist?.videos.find(v => v.id === videoId);
    },

    // Check if video exists in any playlist
    isVideoInAnyPlaylist: (videoId: string): boolean => {
      return context.playlists.some(playlist =>
        playlist.videos.some(video => video.videoId === videoId)
      );
    },

    // Check if video exists in specific playlist
    isVideoInPlaylist: (playlistId: string, videoId: string): boolean => {
      const playlist = context.playlists.find(p => p.id === playlistId);
      return playlist ? playlist.videos.some(v => v.videoId === videoId) : false;
    },

    // Get playlists containing a specific video
    getPlaylistsWithVideo: (videoId: string): Playlist[] => {
      return context.playlists.filter(playlist =>
        playlist.videos.some(video => video.videoId === videoId)
      );
    },

    // Format duration (seconds to mm:ss or hh:mm:ss)
    formatDuration: (seconds: number): string => {
      if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
      } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    },

    // Get recent playlists (last 5 updated)
    getRecentPlaylists: (limit: number = 5): Playlist[] => {
      return [...context.playlists]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, limit);
    },

    // Get empty playlists
    getEmptyPlaylists: (): Playlist[] => {
      return context.playlists.filter(p => p.videos.length === 0);
    },

    // Get playlists by video count
    getPlaylistsByVideoCount: (ascending: boolean = false): Playlist[] => {
      return [...context.playlists].sort((a, b) => {
        const diff = a.videos.length - b.videos.length;
        return ascending ? diff : -diff;
      });
    },

    // Search playlists by name
    searchPlaylists: (query: string): Playlist[] => {
      const searchTerm = query.toLowerCase().trim();
      if (!searchTerm) return context.playlists;

      return context.playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(searchTerm) ||
        (playlist.description && playlist.description.toLowerCase().includes(searchTerm))
      );
    },

    // Search videos in playlist
    searchVideosInPlaylist: (playlistId: string, query: string): PlaylistVideo[] => {
      const playlist = context.playlists.find(p => p.id === playlistId);
      if (!playlist) return [];

      const searchTerm = query.toLowerCase().trim();
      if (!searchTerm) return playlist.videos;

      return playlist.videos.filter(video =>
        video.title.toLowerCase().includes(searchTerm) ||
        (video.author && video.author.toLowerCase().includes(searchTerm))
      );
    },

    // Duplicate playlist
    duplicatePlaylist: async (playlistId: string, newName?: string): Promise<string> => {
      const original = context.playlists.find(p => p.id === playlistId);
      if (!original) {
        throw new Error('Playlist not found');
      }

      const duplicatedPlaylistId = await context.createPlaylist(
        newName || `${original.name} (Copy)`,
        original.description
      );

      // Add all videos from original playlist
      for (const video of original.videos) {
        await context.addVideoToPlaylist(duplicatedPlaylistId, {
          videoId: video.videoId,
          title: video.title,
          author: video.author,
          thumbnail: video.thumbnail,
          url: video.url,
          duration: video.duration,
        });
      }

      return duplicatedPlaylistId;
    },

    // Merge playlists
    mergePlaylists: async (sourcePlaylistIds: string[], targetName: string): Promise<string> => {
      const sourcePlaylists = sourcePlaylistIds
        .map(id => context.playlists.find(p => p.id === id))
        .filter(Boolean) as Playlist[];

      if (sourcePlaylists.length === 0) {
        throw new Error('No valid source playlists found');
      }

      const mergedPlaylistId = await context.createPlaylist(targetName);

      // Collect all videos, avoiding duplicates
      const allVideos: PlaylistVideo[] = [];
      const seenVideoIds = new Set<string>();

      for (const playlist of sourcePlaylists) {
        for (const video of playlist.videos) {
          if (!seenVideoIds.has(video.videoId)) {
            allVideos.push(video);
            seenVideoIds.add(video.videoId);
          }
        }
      }

      // Add all unique videos to the new playlist
      for (const video of allVideos) {
        await context.addVideoToPlaylist(mergedPlaylistId, {
          videoId: video.videoId,
          title: video.title,
          author: video.author,
          thumbnail: video.thumbnail,
          url: video.url,
          duration: video.duration,
        });
      }

      return mergedPlaylistId;
    },

    // Export playlist to shareable format
    exportPlaylistData: (playlistId: string): string => {
      const playlist = context.playlists.find(p => p.id === playlistId);
      if (!playlist) {
        throw new Error('Playlist not found');
      }

      const exportData = {
        name: playlist.name,
        description: playlist.description,
        videos: playlist.videos.map(video => ({
          videoId: video.videoId,
          title: video.title,
          author: video.author,
          url: video.url,
          duration: video.duration,
        })),
        settings: playlist.settings,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };

      return JSON.stringify(exportData, null, 2);
    },

    // Validate playlist data before import
    validatePlaylistData: (data: string): boolean => {
      try {
        const parsed = JSON.parse(data);
        return (
          typeof parsed.name === 'string' &&
          Array.isArray(parsed.videos) &&
          parsed.videos.every((video: any) =>
            typeof video.videoId === 'string' &&
            typeof video.title === 'string' &&
            typeof video.url === 'string'
          )
        );
      } catch {
        return false;
      }
    },
  }), [context]);

  // Enhanced actions with error handling and validation
  const actions = useMemo(() => ({
    // Create playlist with validation
    createPlaylistSafe: async (name: string, description?: string): Promise<string> => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error('Playlist name cannot be empty');
      }

      if (context.playlists.some(p => p.name === trimmedName)) {
        throw new Error('A playlist with this name already exists');
      }

      return context.createPlaylist(trimmedName, description);
    },

    // Add video with duplicate check
    addVideoSafe: async (playlistId: string, videoData: any): Promise<void> => {
      if (!videoData.videoId || !videoData.title || !videoData.url) {
        throw new Error('Missing required video data');
      }

      if (utils.isVideoInPlaylist(playlistId, videoData.videoId)) {
        throw new Error('Video already exists in this playlist');
      }

      return context.addVideoToPlaylist(playlistId, videoData);
    },

    // Batch add videos
    addMultipleVideos: async (playlistId: string, videos: any[]): Promise<{ added: number; skipped: number }> => {
      let added = 0;
      let skipped = 0;

      for (const video of videos) {
        try {
          if (!utils.isVideoInPlaylist(playlistId, video.videoId)) {
            await context.addVideoToPlaylist(playlistId, video);
            added++;
          } else {
            skipped++;
          }
        } catch (error) {
          console.warn('Failed to add video:', video.title, error);
          skipped++;
        }
      }

      return { added, skipped };
    },

    // Clear all videos from playlist
    clearPlaylist: async (playlistId: string): Promise<void> => {
      const playlist = context.playlists.find(p => p.id === playlistId);
      if (!playlist) {
        throw new Error('Playlist not found');
      }

      // Remove all videos one by one (to maintain state consistency)
      for (const video of [...playlist.videos]) {
        await context.removeVideoFromPlaylist(playlistId, video.id);
      }
    },

    // Jump to specific video in active playlist
    jumpToVideo: async (videoIndex: number): Promise<void> => {
      if (!context.activePlaylist) {
        throw new Error('No active playlist');
      }

      if (videoIndex < 0 || videoIndex >= context.activePlaylist.videos.length) {
        throw new Error('Invalid video index');
      }

      // Update the current index directly
      context.setActivePlaylist(context.activePlaylist.id);
    },
  }), [context, utils]);

  return {
    // Original context
    ...context,

    // Derived state
    ...derivedState,

    // Utility functions
    ...utils,

    // Enhanced actions
    ...actions,
  };
}