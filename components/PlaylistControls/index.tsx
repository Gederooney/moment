/**
 * PlaylistControls Component
 * Controls for playlist navigation and management
 */

import React from 'react';
import { PlaylistControlsProps } from './types';
import { usePlaylistControls } from './usePlaylistControls';
import { CompactControls } from './CompactControls';
import { FullControls } from './FullControls';

export function PlaylistControls({
  onAddToPlaylist,
  onNext,
  onPrevious,
  isLoading = false,
  isDark = false,
  compact = false,
}: PlaylistControlsProps) {
  const {
    currentState,
    progress,
    canGoNext,
    canGoPrevious,
    toggleAutoPlay,
    toggleShuffle,
    toggleRepeat,
  } = usePlaylistControls();

  const handleNext = () => {
    if (canGoNext && onNext) {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious && onPrevious) {
      onPrevious();
    }
  };

  if (compact) {
    return (
      <CompactControls
        progress={progress ?? undefined}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isLoading={isLoading}
        isDark={isDark}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onAddToPlaylist={onAddToPlaylist}
      />
    );
  }

  return (
    <FullControls
      currentPlaylist={currentState.currentPlaylist ?? undefined}
      progress={progress ?? undefined}
      autoPlay={currentState.autoPlay}
      shuffle={currentState.shuffle}
      repeat={currentState.repeat}
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
      isLoading={isLoading}
      isDark={isDark}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onAddToPlaylist={onAddToPlaylist}
      onToggleAutoPlay={toggleAutoPlay}
      onToggleShuffle={toggleShuffle}
      onToggleRepeat={toggleRepeat}
    />
  );
}

export type { PlaylistControlsProps } from './types';
