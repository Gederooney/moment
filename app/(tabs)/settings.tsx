import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useSettings } from '../../hooks/useSettings';
import { useTopBarContext } from '../../contexts/TopBarContext';
import { SettingSection } from '../../components/SettingSection';
import { SettingItem } from '../../components/SettingItem';
import { DurationPicker } from '../../components/DurationPicker';
import { QualityPicker } from '../../components/QualityPicker';
import { StorageIndicator } from '../../components/StorageIndicator';
import { formatBytes, formatDuration, getQualityLabel } from '../../utils/storage';

export default function SettingsScreen() {
  const {
    settings,
    storageStats,
    isLoading,
    updateSetting,
    clearCache,
    clearAllData,
    refreshStorageStats,
    exportMoments,
    importMoments,
    openTermsOfService,
    openPrivacyPolicy,
    reportBug,
    rateApp,
  } = useSettings();

  // Contexte TopBar pour mettre à jour le titre
  const { setTitle } = useTopBarContext();

  // Mise à jour du titre TopBar
  React.useEffect(() => {
    setTitle('Paramètres');
  }, [setTitle]);

  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showQualityPicker, setShowQualityPicker] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      'Effacer le cache',
      'Êtes-vous sûr de vouloir effacer le cache ? Cela peut libérer de l\'espace de stockage.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: clearCache,
        },
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="settings" size={40} color={Colors.primary} />
          <Text style={styles.title}>Paramètres</Text>
          <Text style={styles.subtitle}>
            Gérez vos préférences et données
          </Text>
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

        {/* Préférences d'affichage */}
        <SettingSection title="Préférences d'affichage">
          <SettingItem
            icon="sparkles-outline"
            title="Animations"
            subtitle="Activer les animations de l'interface"
            type="switch"
            value={settings.enableAnimations}
            onToggle={(value) => updateSetting({ enableAnimations: value })}
            showChevron={false}
          />
          <SettingItem
            icon="phone-portrait-outline"
            title="Retour haptique"
            subtitle="Vibrations pour les interactions"
            type="switch"
            value={settings.enableHapticFeedback}
            onToggle={(value) => updateSetting({ enableHapticFeedback: value })}
            showChevron={false}
          />
        </SettingSection>

        {/* Qualité vidéo */}
        <SettingSection title="Vidéo YouTube">
          <SettingItem
            icon="videocam-outline"
            title="Qualité par défaut"
            subtitle="Qualité de lecture des vidéos"
            type="picker"
            value={getQualityLabel(settings.videoQuality)}
            onPress={() => setShowQualityPicker(true)}
          />
          <SettingItem
            icon="download-outline"
            title="Chargement automatique"
            subtitle="Charger automatiquement les vidéos"
            type="switch"
            value={settings.autoLoadVideos}
            onToggle={(value) => updateSetting({ autoLoadVideos: value })}
            showChevron={false}
          />
        </SettingSection>

        {/* Stockage et cache */}
        <SettingSection title="Stockage et cache">
          <View style={styles.storageContainer}>
            <StorageIndicator
              used={storageStats.totalSpace}
              total={0} // We don't have device total space info
              label="Données de l'app"
            />
            <StorageIndicator
              used={storageStats.cacheSize}
              total={0}
              label="Cache"
            />
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                {storageStats.videoCount} vidéo(s) • {storageStats.momentCount} moment(s)
              </Text>
            </View>
          </View>
          <SettingItem
            icon="refresh-outline"
            title="Actualiser les statistiques"
            subtitle="Recalculer l'espace utilisé"
            onPress={refreshStorageStats}
          />
          <SettingItem
            icon="trash-outline"
            title="Effacer le cache"
            subtitle={`Cache: ${formatBytes(storageStats.cacheSize)}`}
            onPress={handleClearCache}
            destructive
          />
          <SettingItem
            icon="nuclear-outline"
            title="Effacer toutes les données"
            subtitle="Supprimer tout l'historique et les moments"
            onPress={clearAllData}
            destructive
          />
        </SettingSection>

        {/* Import/Export */}
        <SettingSection title="Sauvegarde des données">
          <SettingItem
            icon="cloud-upload-outline"
            title="Exporter les moments"
            subtitle="Sauvegarder vos données"
            onPress={exportMoments}
          />
          <SettingItem
            icon="cloud-download-outline"
            title="Importer les moments"
            subtitle="Restaurer des données sauvegardées"
            onPress={importMoments}
          />
        </SettingSection>

        {/* À propos */}
        <SettingSection title="À propos de l'application">
          <SettingItem
            icon="information-circle-outline"
            title="Version"
            subtitle="1.0.0"
            type="info"
            showChevron={false}
          />
          <SettingItem
            icon="document-text-outline"
            title="Conditions d'utilisation"
            onPress={openTermsOfService}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Politique de confidentialité"
            onPress={openPrivacyPolicy}
          />
          <SettingItem
            icon="bug-outline"
            title="Signaler un bug"
            onPress={reportBug}
          />
          <SettingItem
            icon="star-outline"
            title="Noter l'application"
            onPress={rateApp}
          />
        </SettingSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            PodCut - Capturez vos moments préférés
          </Text>
          <Text style={styles.footerSubtext}>
            Version 1.0.0 • Fait avec ❤️
          </Text>
        </View>
      </ScrollView>

      {/* Pickers */}
      <DurationPicker
        selectedDuration={settings.momentDuration}
        onSelect={(duration) => updateSetting({ momentDuration: duration })}
        visible={showDurationPicker}
        onClose={() => setShowDurationPicker(false)}
      />

      <QualityPicker
        selectedQuality={settings.videoQuality}
        onSelect={(quality) => updateSetting({ videoQuality: quality })}
        visible={showQualityPicker}
        onClose={() => setShowQualityPicker(false)}
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
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.light,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.text.light,
    textAlign: 'center',
  },
  storageContainer: {
    padding: 16,
    backgroundColor: Colors.background.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.light,
  },
  statsRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border.light,
  },
  statsText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});