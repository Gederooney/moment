import React, { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { MomentsProvider } from '../contexts/MomentsContext';
import { TopBarProvider } from '../contexts/TopBarContext';
import { PlaylistProvider } from '../contexts/PlaylistContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FoldersProvider } from '../contexts/FoldersContext';
import { TopBar } from '../components/TopBar';
import { View, StyleSheet } from 'react-native';
import { cleanupMetadataCache } from '../services/youtubeMetadata';
import { MigrationService } from '../services/migrationService';

// Main App Content
function MainApp() {
  return (
    <>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <TopBar title="Moments" />
        <View style={styles.stackContainer}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="player/index" options={{ headerShown: false }} />
          </Stack>
        </View>
      </View>
    </>
  );
}

function AppContent() {
  const [isReady, setIsReady] = useState(false);

  const prepare = useCallback(async () => {
    try {
      await SplashScreen.preventAutoHideAsync();

      // Run data migrations if needed
      const needsMigration = await MigrationService.needsMigration();
      if (needsMigration) {
        console.log('[App] Running data migrations...');
        await MigrationService.runMigrations();
        console.log('[App] Migrations complete');
      }

      await cleanupMetadataCache();
    } catch (e) {
      console.error('[App] Error during app initialization:', e);
      // Handle error silently but log it
    } finally {
      setIsReady(true);
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    prepare();
  }, [prepare]);

  if (!isReady) {
    return null;
  }

  return (
    <AuthProvider autoRefresh={true}>
      <TopBarProvider>
        <FoldersProvider>
          <MomentsProvider>
            <PlaylistProvider>
              <MainApp />
            </PlaylistProvider>
          </MomentsProvider>
        </FoldersProvider>
      </TopBarProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
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
