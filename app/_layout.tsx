import React, { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { MomentsProvider } from '../contexts/MomentsContext';
import { TopBarProvider, useTopBarContext } from '../contexts/TopBarContext';
import { PlaylistProvider } from '../contexts/PlaylistContext';
import { AuthProvider, useAuthContext } from '../contexts/AuthContext';
import { TopBar } from '../components/TopBar';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { cleanupMetadataCache } from '../services/youtubeMetadata';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

// Loading Screen Component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingTitle}>Moments</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.loadingSpinner} />
      <Text style={styles.loadingText}>Loading your moments...</Text>
    </View>
  );
}

// Main App Content (always accessible)
function MainApp() {
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
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="player" options={{ headerShown: false }} />
          </Stack>
        </View>
      </View>
    </>
  );
}

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const { isLoading: authLoading } = useAuthContext();

  const prepare = useCallback(async () => {
    try {
      // Garder le splash screen visible pendant qu'on initialise l'app
      await SplashScreen.preventAutoHideAsync();

      // Nettoyer le cache des métadonnées au démarrage
      await cleanupMetadataCache();

      // Autres initialisations si nécessaire...
    } catch (e) {
    } finally {
      setIsReady(true);
      // Masquer le splash screen natif
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    prepare();
  }, [prepare]);

  // Afficher le splash screen natif pendant l'initialisation de l'app
  if (!isReady) {
    return null;
  }

  // Afficher le loading screen pendant la vérification de l'authentification
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Toujours afficher l'application principale - l'authentification est optionnelle
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
        <AuthProvider>
          <AppContent />
        </AuthProvider>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  loadingTitle: {
    ...Typography.display,
    color: Colors.primary,
    marginBottom: 40,
    letterSpacing: -0.5,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    ...Typography.body,
    color: '#666666',
    textAlign: 'center',
    opacity: 0.8,
  },
});
