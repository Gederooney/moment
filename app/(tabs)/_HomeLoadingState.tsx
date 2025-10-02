import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { styles } from './_index.styles';

interface HomeLoadingStateProps {
  colors: any;
}

export const HomeLoadingState: React.FC<HomeLoadingStateProps> = ({ colors }) => {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
        Ouverture du lecteur...
      </Text>
    </View>
  );
};
