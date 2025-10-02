/**
 * PlaylistModal Types
 */

export interface VideoData {
  videoId: string;
  title: string;
  author?: string;
  thumbnail?: string;
  url: string;
}

export interface PlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  videoData: VideoData;
  isDark?: boolean;
}

export interface PlaylistFormProps {
  visible: boolean;
  newPlaylistName: string;
  isLoading: boolean;
  isDark: boolean;
  onNameChange: (name: string) => void;
  onCancel: () => void;
  onCreate: () => void;
}
