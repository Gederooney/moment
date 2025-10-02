import React from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { VideoAccordion } from '../../../components/VideoAccordion';
import { VideoWithMoments } from '../../../types/moment';

interface MomentsListProps {
  filteredVideos: VideoWithMoments[];
  expandedVideoId: string | null;
  refreshing: boolean;
  renderEmptyComponent: () => React.ReactElement | null;
  renderVideoItem: ({ item }: { item: VideoWithMoments }) => React.ReactElement;
  handleRefresh: () => void;
}

export function MomentsList({
  filteredVideos,
  refreshing,
  renderEmptyComponent,
  renderVideoItem,
  handleRefresh,
}: MomentsListProps) {
  return (
    <FlatList
      data={filteredVideos}
      renderItem={renderVideoItem}
      keyExtractor={item => item.id}
      contentContainerStyle={[
        styles.listContent,
        filteredVideos.length === 0 &&
          styles.listContentCentered,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
      ListEmptyComponent={renderEmptyComponent()}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      getItemLayout={(data, index) => ({
        length: 80,
        offset: 80 * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
