import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useSettings } from '../../hooks/useSettings';
import { useTopBarContext } from '../../contexts/TopBarContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { SettingSection } from '../../components/SettingSection';
import { SettingItem } from '../../components/SettingItem';
import { Button } from '../../components/Button';
import { DurationPicker } from '../../components/DurationPicker';
import { formatDuration } from '../../utils/storage';

export default function SettingsScreen() {
  const { settings, isLoading, updateSetting } = useSettings();

  // Contexte TopBar pour mettre à jour le titre
  const { setTitle } = useTopBarContext();

  // Auth context
  const { isAuthenticated, user, logout } = useAuthContext();

  // Router for navigation
  const router = useRouter();

  // Mise à jour du titre TopBar
  React.useEffect(() => {
    setTitle('Profil');
  }, [setTitle]);

  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
    }
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="person" size={40} color={Colors.primary} />
          <Text style={styles.title}>Profil</Text>
        </View>

        {/* Section Compte */}
        <SettingSection title="Compte">
          {isAuthenticated ? (
            <>
              <SettingItem
                icon="person-outline"
                title={user?.name || 'Utilisateur'}
                subtitle={user?.email}
                type="info"
              />
              <View style={styles.buttonContainer}>
                <Button
                  title="Se déconnecter"
                  variant="outline"
                  icon="log-out-outline"
                  onPress={handleLogout}
                  fullWidth
                />
              </View>
            </>
          ) : (
            <View style={styles.authButtons}>
              <View style={styles.buttonContainer}>
                <Button
                  title="Se connecter"
                  variant="primary"
                  icon="log-in-outline"
                  onPress={handleLogin}
                  fullWidth
                />
              </View>
              <View style={styles.buttonContainer}>
                <Button
                  title="Créer un compte"
                  variant="outline"
                  icon="person-add-outline"
                  onPress={handleRegister}
                  fullWidth
                />
              </View>
            </View>
          )}
        </SettingSection>

        {/* Configuration des moments */}
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
      </ScrollView>

      {/* Duration Picker */}
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
  authButtons: {
    gap: 12,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
});
