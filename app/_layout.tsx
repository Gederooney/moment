import React, { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { MomentsProvider } from '../contexts/MomentsContext';
import { TopBarProvider, useTopBarContext } from '../contexts/TopBarContext';
import { PlaylistProvider } from '../contexts/PlaylistContext';
import { TopBar } from '../components/TopBar';
import { View, StyleSheet } from 'react-native';
import { cleanupMetadataCache } from '../services/youtubeMetadata';

function AppContent() {
  const [isReady, setIsReady] = useState(false);

  const prepare = useCallback(async () => {
    try {
      // Garder le splash screen visible pendant qu'on initialise l'app
      await SplashScreen.preventAutoHideAsync();

      // Nettoyer le cache des métadonnées au démarrage
      await cleanupMetadataCache();

      // Autres initialisations si nécessaire...

    } catch (e) {
      console.warn('Failed to initialize app:', e);
    } finally {
      setIsReady(true);
      // Masquer le splash screen natif
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    prepare();
  }, [prepare]);

  // Afficher le splash screen natif pendant l'initialisation
  if (!isReady) {
    return null;
  }

  return (
    <>
      <StatusBar style="auto" />
      <View style={styles.container}>
        {/* TopBar fixe au-dessus de tout */}
        <TopBar title="Moments" />

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TopBarProvider>
          <MomentsProvider>
            <PlaylistProvider>
              <AppContent />
            </PlaylistProvider>
          </MomentsProvider>
        </TopBarProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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