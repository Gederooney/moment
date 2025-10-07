import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MomentsList } from '../../components/MomentsList';
import { CapturedMoment } from '../../types/moment';

interface PlayerMomentsProps {
  moments: CapturedMoment[];
  onPlayMoment: (timestamp: number) => void;
  onDeleteMoment: (momentId: string) => void;
  onEditMoment: (moment: CapturedMoment) => void;
}

export function PlayerMoments({ moments, onPlayMoment, onDeleteMoment, onEditMoment }: PlayerMomentsProps) {
  return (
    <View style={styles.container}>
      <MomentsList
        moments={moments}
        onPlayMoment={onPlayMoment}
        onDeleteMoment={onDeleteMoment}
        onEditMoment={onEditMoment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    minHeight: 200,
  },
});
