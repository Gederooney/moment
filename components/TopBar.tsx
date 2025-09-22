import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTopBarContext } from '../contexts/TopBarContext';
import { useRouter } from 'expo-router';

interface TopBarProps {
  title: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackPress?: () => void;
}

const TopBarComponent = React.memo(function TopBar({
  title,
  showBackButton = false,
  backButtonText = '',
  onBackPress,
}: TopBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useTopBarContext();

  // Auto-detect if we should show back button based on video state
  const shouldShowBackButton = showBackButton || !!state.currentVideoId;
  const displayTitle = state.currentVideoId ? state.title : title;

  // Handle back button press
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // iOS native styles
  const styles = useMemo(() => {
    return StyleSheet.create({
      container: {
        backgroundColor: '#FFFFFF',
        paddingTop: insets.top,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
      },
      content: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44, // iOS standard navigation bar height
        paddingHorizontal: 16,
      },
      backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingRight: 8,
        marginRight: 8,
      },
      backText: {
        fontSize: 17,
        color: '#007AFF', // iOS blue
        fontWeight: '400',
        marginLeft: 4,
      },
      titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center',
        ...Platform.select({
          ios: {
            fontFamily: 'San Francisco',
          },
        }),
      },
      // Placeholder to balance the layout when back button is present
      placeholder: {
        width: 80, // Approximate width of back button
      },
    });
  }, [insets.top]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Bouton retour style iOS */}
        {shouldShowBackButton ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.6}
            accessibilityLabel="Retour"
            accessibilityHint="Retourner à l'écran précédent"
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color="#007AFF" // iOS blue
            />
            <Text style={styles.backText}>{backButtonText}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* Titre centré */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {displayTitle}
          </Text>
        </View>

        {/* Placeholder pour équilibrer la layout */}
        <View style={styles.placeholder} />
      </View>
    </View>
  );
});

export const TopBar = TopBarComponent;