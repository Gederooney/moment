import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useSettings } from '../../hooks/useSettings';
import { useTopBarContext } from '../../contexts/TopBarContext';
import { SettingSection } from '../../components/SettingSection';
import { SettingItem } from '../../components/SettingItem';
import { DurationPicker } from '../../components/DurationPicker';
import { formatDuration } from '../../utils/storage';

export default function SettingsScreen() {
  const {
    settings,
    isLoading,
    updateSetting,
  } = useSettings();

  // Contexte TopBar pour mettre à jour le titre
  const { setTitle } = useTopBarContext();

  // Mise à jour du titre TopBar
  React.useEffect(() => {
    setTitle('Paramètres');
  }, [setTitle]);

  const [showDurationPicker, setShowDurationPicker] = useState(false);

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
          <Ionicons name="settings" size={40} color={Colors.primary} />
          <Text style={styles.title}>Paramètres</Text>
        </View>

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
        onSelect={(duration) => updateSetting({ momentDuration: duration })}
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
});