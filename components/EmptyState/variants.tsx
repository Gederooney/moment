/**
 * EmptyState Variants
 * Specialized empty state components
 */

import React from 'react';
import { EmptyStateBase } from './EmptyStateBase';

// No videos in history
export const NoVideosEmptyState: React.FC<{
  onGoHome: () => void;
  isDark?: boolean;
}> = ({ onGoHome, isDark = false }) => (
  <EmptyStateBase
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
  <EmptyStateBase
    icon="search-outline"
    title="Aucun résultat"
    description={`Aucune vidéo ne correspond à "${searchQuery}"`}
    primaryAction={{
      title: 'Effacer la recherche',
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
  <EmptyStateBase
    icon="radio-button-off-outline"
    title="Aucun moment capturé"
    description="Capturez vos moments préférés pendant la lecture de la vidéo"
    primaryAction={
      onCaptureMoment
        ? {
            title: 'Capturer maintenant',
            onPress: onCaptureMoment,
            icon: 'radio-button-on-outline',
          }
        : undefined
    }
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
  <EmptyStateBase
    icon="alert-circle-outline"
    title="Erreur de chargement"
    description="Impossible de charger cette vidéo. Vérifiez votre connexion internet."
    primaryAction={{
      title: 'Réessayer',
      onPress: onRetry,
      icon: 'refresh-outline',
    }}
    secondaryAction={{
      title: 'Retour',
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
}> = ({ message = 'Chargement...', isDark = false, compact = false }) => (
  <EmptyStateBase
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
  <EmptyStateBase
    icon="checkmark-circle-outline"
    title={title}
    description={description}
    primaryAction={
      onContinue
        ? {
            title: 'Continuer',
            onPress: onContinue,
            icon: 'arrow-forward-outline',
          }
        : undefined
    }
    variant="success"
    isDark={isDark}
  />
);
