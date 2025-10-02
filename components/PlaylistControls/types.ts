/**
 * PlaylistControls Types
 */

export interface PlaylistControlsProps {
  onAddToPlaylist: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
  isDark?: boolean;
  compact?: boolean;
}

export interface ControlButtonProps {
  icon: 'play-skip-back' | 'play-skip-forward' | 'add';
  onPress: () => void;
  disabled: boolean;
  color: string;
  size?: number;
  isLoading?: boolean;
}
