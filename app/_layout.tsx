import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MomentsProvider } from '../contexts/MomentsContext';
import { TopBarProvider, useTopBarContext } from '../contexts/TopBarContext';
import { PlaylistProvider } from '../contexts/PlaylistContext';
import { TopBar } from '../components/TopBar';
import { View, StyleSheet } from 'react-native';
import { cleanupMetadataCache } from '../services/youtubeMetadata';

function AppContent() {
  // Nettoyer le cache des métadonnées au démarrage
  useEffect(() => {
    cleanupMetadataCache().catch(error => {
      console.warn('Failed to cleanup metadata cache:', error);
    });
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <View style={styles.container}>
        {/* TopBar fixe au-dessus de tout */}
        <TopBar title="PodCut" />

        {/* Navigation Stack */}
        <View style={styles.stackContainer}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="player" options={{ headerShown: false }} />
          </Stack>
        </View>
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TopBarProvider>
        <MomentsProvider>
          <PlaylistProvider>
            <AppContent />
          </PlaylistProvider>
        </MomentsProvider>
      </TopBarProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stackContainer: {
    flex: 1,
  },
});