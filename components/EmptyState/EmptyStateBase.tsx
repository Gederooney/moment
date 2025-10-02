/**
 * EmptyStateBase Component
 * Base empty state component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, IconSize } from '../../constants/Spacing';
import { Button } from '../Button';
import { EmptyStateProps } from './types';

export const EmptyStateBase: React.FC<EmptyStateProps> = ({
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

  const getVariantConfig = () => {
    const configs = {
      search: {
        defaultIcon: 'search-outline' as const,
        iconColor: colors.text.tertiary,
      },
      error: {
        defaultIcon: 'alert-circle-outline' as const,
        iconColor: colors.error,
      },
      loading: {
        defaultIcon: 'hourglass-outline' as const,
        iconColor: colors.accent,
      },
      success: {
        defaultIcon: 'checkmark-circle-outline' as const,
        iconColor: colors.success,
      },
      default: {
        defaultIcon: 'document-outline' as const,
        iconColor: colors.text.tertiary,
      },
    };

    return {
      ...configs[variant],
      titleColor: colors.text.primary,
      descriptionColor: colors.text.secondary,
    };
  };

  const variantConfig = getVariantConfig();
  const iconName = icon || variantConfig.defaultIcon;
  const iconSize = compact ? IconSize.xl : IconSize.xxl * 1.5;

  return (
    <View
      style={[styles.container, compact && styles.containerCompact, style]}
      accessibilityLabel={accessibilityLabel || title}
    >
      <View style={styles.visualContainer}>
        {illustration || (
          <Ionicons name={iconName} size={iconSize} color={variantConfig.iconColor} />
        )}
      </View>

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
