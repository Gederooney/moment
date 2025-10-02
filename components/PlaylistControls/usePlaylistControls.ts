/**
 * usePlaylistControls Hook
 * Custom hook for playlist controls logic
 */

import { useMemo } from 'react';
import { usePlaylist } from '../../contexts/PlaylistContext';

export const usePlaylistControls = () => {
  const {
    currentState,
    hasNext,
    hasPrevious,
    getPlaylistProgress,
    toggleAutoPlay,
    toggleShuffle,
    toggleRepeat,
  } = usePlaylist();

  const progress = useMemo(() => getPlaylistProgress(), [getPlaylistProgress]);
  const canGoNext = useMemo(() => hasNext(), [hasNext]);
  const canGoPrevious = useMemo(() => hasPrevious(), [hasPrevious]);

  return {
    currentState,
    progress,
    canGoNext,
    canGoPrevious,
    toggleAutoPlay,
    toggleShuffle,
    toggleRepeat,
  };
};
