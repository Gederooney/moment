/**
 * PodCut EmptyState Component
 * Informative empty states with illustrations and actions
 * Designed to guide users and maintain engagement
 */

import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, IconSize } from '../constants/Spacing';
import { Button } from './Button';

type EmptyStateVariant = 'default' | 'search' | 'error' | 'loading' | 'success';

interface EmptyStateProps {
  // Content
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  illustration?: ReactNode;

  // Actions
  primaryAction?: {
    title: string;
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
  };
  secondaryAction?: {
    title: string;
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
  };

  // Appearance
  variant?: EmptyStateVariant;
  isDark?: boolean;

  // Layout
  compact?: boolean;

  // Custom styles
  style?: ViewStyle;

  // Accessibility
  accessibilityLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  illustration,
  primaryAction,
  secondaryAction,
  variant = 'default',
  isDark = false,
  compact = false,
  style,
  accessibilityLabel,
}) => {
  const colors = getColors(isDark);

  // Get icon and colors based on variant
  const getVariantConfig = () => {
    switch (variant) {
      case 'search':
        return {
          defaultIcon: 'search-outline' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.text.tertiary,
          titleColor: colors.text.primary,
          descriptionColor: colors.text.secondary,
        };

      case 'error':
        return {
          defaultIcon: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.error,
          titleColor: colors.text.primary,
          descriptionColor: colors.text.secondary,
        };

      case 'loading':
        return {
          defaultIcon: 'hourglass-outline' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.accent,
          titleColor: colors.text.primary,
          descriptionColor: colors.text.secondary,
        };

      case 'success':
        return {
          defaultIcon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.success,
          titleColor: colors.text.primary,
          descriptionColor: colors.text.secondary,
        };

      case 'default':
      default:
        return {
          defaultIcon: 'document-outline' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.text.tertiary,
          titleColor: colors.text.primary,
          descriptionColor: colors.text.secondary,
        };
    }
  };

  const variantConfig = getVariantConfig();
  const iconName = icon || variantConfig.defaultIcon;
  const iconSize = compact ? IconSize.xl : IconSize.xxl * 1.5;

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        style,
      ]}
      accessibilityLabel={accessibilityLabel || title}
    >
      {/* Illustration or Icon */}
      <View style={styles.visualContainer}>
        {illustration || (
          <Ionicons
            name={iconName}
            size={iconSize}
            color={variantConfig.iconColor}
          />
        )}
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text
          style={[
            compact ? styles.titleCompact : styles.title,
            { color: variantConfig.titleColor },
          ]}
        >
          {title}
        </Text>

        {description && (
          <Text
            style={[
              compact ? styles.descriptionCompact : styles.description,
              { color: variantConfig.descriptionColor },
            ]}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <View style={styles.actionsContainer}>
          {primaryAction && (
            <Button
              title={primaryAction.title}
              onPress={primaryAction.onPress}
              icon={primaryAction.icon}
              variant="primary"
              size={compact ? 'medium' : 'large'}
              fullWidth={!secondaryAction}
              isDark={isDark}
            />
          )}

          {secondaryAction && (
            <Button
              title={secondaryAction.title}
              onPress={secondaryAction.onPress}
              icon={secondaryAction.icon}
              variant="outline"
              size={compact ? 'medium' : 'large'}
              fullWidth={!primaryAction}
              isDark={isDark}
              style={primaryAction && styles.secondaryButton}
            />
          )}
        </View>
      )}
    </View>
  );
};

// Specialized empty state components

// No videos in history
export const NoVideosEmptyState: React.FC<{
  onGoHome: () => void;
  isDark?: boolean;
}> = ({ onGoHome, isDark = false }) => (
  <EmptyState
    icon="time-outline"
    title="Aucun historique"
    description="Les vidéos que vous regardez apparaîtront ici avec vos moments capturés"
    primaryAction={{
      title: "Aller à l'accueil",
      onPress: onGoHome,
      icon: 'home-outline',
    }}
    variant="default"
    isDark={isDark}
  />
);

// No search results
export const NoSearchResultsEmptyState: React.FC<{
  searchQuery: string;
  onClearSearch: () => void;
  isDark?: boolean;
}> = ({ searchQuery, onClearSearch, isDark = false }) => (
  <EmptyState
    icon="search-outline"
    title="Aucun résultat"
    description={`Aucune vidéo ne correspond à "${searchQuery}"`}
    primaryAction={{
      title: "Effacer la recherche",
      onPress: onClearSearch,
      icon: 'close-outline',
    }}
    variant="search"
    isDark={isDark}
    compact
  />
);

// No moments for a video
export const NoMomentsEmptyState: React.FC<{
  onCaptureMoment?: () => void;
  isDark?: boolean;
  compact?: boolean;
}> = ({ onCaptureMoment, isDark = false, compact = false }) => (
  <EmptyState
    icon="radio-button-off-outline"
    title="Aucun moment capturé"
    description="Capturez vos moments préférés pendant la lecture de la vidéo"
    primaryAction={onCaptureMoment ? {
      title: "Capturer maintenant",
      onPress: onCaptureMoment,
      icon: 'radio-button-on-outline',
    } : undefined}
    variant="default"
    isDark={isDark}
    compact={compact}
  />
);

// Error loading video
export const VideoErrorEmptyState: React.FC<{
  onRetry: () => void;
  onGoBack: () => void;
  isDark?: boolean;
}> = ({ onRetry, onGoBack, isDark = false }) => (
  <EmptyState
    icon="alert-circle-outline"
    title="Erreur de chargement"
    description="Impossible de charger cette vidéo. Vérifiez votre connexion internet."
    primaryAction={{
      title: "Réessayer",
      onPress: onRetry,
      icon: 'refresh-outline',
    }}
    secondaryAction={{
      title: "Retour",
      onPress: onGoBack,
      icon: 'arrow-back-outline',
    }}
    variant="error"
    isDark={isDark}
  />
);

// Loading state
export const LoadingEmptyState: React.FC<{
  message?: string;
  isDark?: boolean;
  compact?: boolean;
}> = ({ message = "Chargement...", isDark = false, compact = false }) => (
  <EmptyState
    icon="hourglass-outline"
    title={message}
    description="Veuillez patienter quelques instants"
    variant="loading"
    isDark={isDark}
    compact={compact}
  />
);

// Success state
export const SuccessEmptyState: React.FC<{
  title: string;
  description?: string;
  onContinue?: () => void;
  isDark?: boolean;
}> = ({ title, description, onContinue, isDark = false }) => (
  <EmptyState
    icon="checkmark-circle-outline"
    title={title}
    description={description}
    primaryAction={onContinue ? {
      title: "Continuer",
      onPress: onContinue,
      icon: 'arrow-forward-outline',
    } : undefined}
    variant="success"
    isDark={isDark}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  containerCompact: {
    paddingVertical: Spacing.lg,
  },
  visualContainer: {
    marginBottom: Spacing.lg,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  titleCompact: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  descriptionCompact: {
    ...Typography.small,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    width: '100%',
    gap: Spacing.sm2,
  },
  secondaryButton: {
    marginTop: Spacing.sm,
  },
});