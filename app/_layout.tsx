import React, { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { MomentsProvider } from '../contexts/MomentsContext';
import { TopBarProvider } from '../contexts/TopBarContext';
import { PlaylistProvider } from '../contexts/PlaylistContext';
import { TopBar } from '../components/TopBar';
import { View, StyleSheet } from 'react-native';
import { cleanupMetadataCache } from '../services/youtubeMetadata';

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
      await cleanupMetadataCache();
    } catch (e) {
      // Handle error silently
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
    <TopBarProvider>
      <MomentsProvider>
        <PlaylistProvider>
          <MainApp />
        </PlaylistProvider>
      </MomentsProvider>
    </TopBarProvider>
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
