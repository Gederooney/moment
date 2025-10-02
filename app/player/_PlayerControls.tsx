import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { CaptureButton } from '../../components/CaptureButton';

interface PlayerControlsProps {
  onCapture: () => void;
  disabled: boolean;
  currentTime: number;
}

export function PlayerControls({ onCapture, disabled, currentTime }: PlayerControlsProps) {
  return (
    <View style={styles.container}>
      <CaptureButton onCapture={onCapture} disabled={disabled} currentTime={currentTime} modern={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
