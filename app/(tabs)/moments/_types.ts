export interface MomentsScreenState {
  searchQuery: string;
  expandedVideoId: string | null;
  refreshing: boolean;
  isModalVisible: boolean;
  videoUrl: string;
  isUrlValid: boolean;
  isLoadingMetadata: boolean;
}
