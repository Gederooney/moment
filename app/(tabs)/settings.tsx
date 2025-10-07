import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { useSettings } from '../../hooks/useSettings';
import { useTopBarContext } from '../../contexts/TopBarContext';
import { useMomentsContext } from '../../contexts/MomentsContext';
import { SettingSection } from '../../components/SettingSection';
import { SettingItem } from '../../components/SettingItem';
import { DurationPicker } from '../../components/DurationPicker';
import { formatDuration } from '../../utils/storage';
import { SpotifyIcon } from '../../components/icons/SpotifyIcon';
import { AppleMusicIcon } from '../../components/icons/AppleMusicIcon';
import { useAuth } from '../../hooks/useAuth';

export default function SettingsScreen() {
  const { settings, isLoading, updateSetting } = useSettings();
  const { setTitle, clearVideoState } = useTopBarContext();
  const { clearAllHistory, refreshMoments } = useMomentsContext();
  const {
    isRestoring,
    isSpotifyAuthenticated,
    isSoundCloudAuthenticated,
    loginSpotify,
    loginSoundCloud,
    logout,
    spotifyUser,
    soundCloudUser
  } = useAuth();

  const [showDurationPicker, setShowDurationPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      clearVideoState();
      setTitle('Paramètres');
    }, [setTitle, clearVideoState])
  );

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = '1';

  const handleClearCache = () => {
    Alert.alert(
      'Effacer le cache',
      'Tous vos moments seront perdus. Cette action est irréversible. Votre file de lecture sera préservée.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            try {
              // Sauvegarder la playlist avant de tout effacer
              const playlist = await AsyncStorage.getItem('@podcut_simple_playlist');

              // Effacer tout le cache
              await AsyncStorage.clear();

              // Restaurer la playlist
              if (playlist) {
                await AsyncStorage.setItem('@podcut_simple_playlist', playlist);
              }

              await clearAllHistory();
              await refreshMoments();
              Alert.alert('Succès', 'Cache effacé avec succès. Votre file de lecture est préservée.');
            } catch (error) {
              Alert.alert('Erreur', "Impossible d'effacer le cache");
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des paramètres...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingSection title="Comptes connectés">
          <SettingItem
            icon={<SpotifyIcon size={20} color={Colors.text.secondary} />}
            title="Spotify"
            subtitle={
              isRestoring
                ? 'Chargement...'
                : isSpotifyAuthenticated && spotifyUser
                  ? `Connecté: ${spotifyUser.display_name || spotifyUser.email}`
                  : isSpotifyAuthenticated
                    ? 'Connecté'
                    : 'Connecter votre compte Spotify'
            }
            type="action"
            disabled={isRestoring}
            onPress={async () => {
              // Empêcher le clic pendant la restauration
              if (isRestoring) {
                return;
              }

              if (isSpotifyAuthenticated) {
                Alert.alert(
                  'Déconnexion',
                  'Voulez-vous vous déconnecter de Spotify?',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Déconnecter',
                      style: 'destructive',
                      onPress: () => logout('spotify')
                    }
                  ]
                );
              } else {
                try {
                  await loginSpotify();
                } catch (error) {
                  Alert.alert('Erreur', 'Impossible de se connecter à Spotify');
                }
              }
            }}
          />
          <SettingItem
            icon={<AppleMusicIcon size={20} color={Colors.text.secondary} />}
            title="Apple Music"
            subtitle="Bientôt disponible"
            type="action"
            onPress={() => Alert.alert('Apple Music', 'Bientôt disponible')}
          />
          <SettingItem
            icon="cloud"
            title="SoundCloud"
            subtitle={
              isRestoring
                ? 'Chargement...'
                : isSoundCloudAuthenticated && soundCloudUser
                  ? `Connecté: ${soundCloudUser.username}`
                  : isSoundCloudAuthenticated
                    ? 'Connecté'
                    : 'Connecter votre compte SoundCloud'
            }
            type="action"
            disabled={isRestoring}
            onPress={async () => {
              // Empêcher le clic pendant la restauration
              if (isRestoring) {
                return;
              }

              if (isSoundCloudAuthenticated) {
                Alert.alert(
                  'Déconnexion',
                  'Voulez-vous vous déconnecter de SoundCloud?',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Déconnecter',
                      style: 'destructive',
                      onPress: () => logout('soundcloud')
                    }
                  ]
                );
              } else {
                try {
                  await loginSoundCloud();
                } catch (error) {
                  Alert.alert('Erreur', 'Impossible de se connecter à SoundCloud');
                }
              }
            }}
          />
        </SettingSection>

        <SettingSection title="Configuration des moments">
          <SettingItem
            icon="time-outline"
            title="Durée des moments"
            subtitle="Durée par défaut pour vos captures"
            type="picker"
            value={formatDuration(settings.momentDuration)}
            onPress={() => setShowDurationPicker(true)}
          />
        </SettingSection>

        <SettingSection title="À propos">
          <SettingItem
            icon="information-circle-outline"
            title="Version"
            subtitle={`${appVersion} (${buildNumber})`}
            type="info"
          />
        </SettingSection>

        <SettingSection title="Données">
          <SettingItem
            icon="trash-outline"
            title="Effacer le cache"
            subtitle="Supprimer tous vos moments"
            type="action"
            onPress={handleClearCache}
            isDestructive
          />
        </SettingSection>
      </ScrollView>

      <DurationPicker
        selectedDuration={settings.momentDuration}
        onSelect={duration => updateSetting({ momentDuration: duration })}
        visible={showDurationPicker}
        onClose={() => setShowDurationPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 8,
  },
});
