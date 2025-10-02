/**
 * ButtonContent Component
 * Renders button content including icon and text
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../../constants/Spacing';

interface ButtonContentProps {
  loading: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition: 'left' | 'right';
  iconSize: number;
  iconColor: string;
  title: string;
  subtitle?: string;
  textStyles: TextStyle;
  textStyle?: TextStyle;
  size: 'small' | 'medium' | 'large' | 'driving';
}

export const ButtonContent: React.FC<ButtonContentProps> = ({
  loading,
  icon,
  iconPosition,
  iconSize,
  iconColor,
  title,
  subtitle,
  textStyles,
  textStyle,
  size,
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={size === 'small' ? 'small' : 'large'} color={iconColor} />
        {size !== 'small' && (
          <Text style={[textStyles, textStyle, { marginLeft: Spacing.sm }]}>Chargement...</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.contentContainer}>
      {icon && iconPosition === 'left' && (
        <Ionicons
          name={icon}
          size={iconSize}
          color={iconColor}
          style={{ marginRight: Spacing.sm }}
        />
      )}

      <View style={subtitle ? styles.textColumn : undefined}>
        <Text style={[textStyles, textStyle]}>{title}</Text>
        {subtitle && <Text style={[textStyles, styles.subtitle, textStyle]}>{subtitle}</Text>}
      </View>

      {icon && iconPosition === 'right' && (
        <Ionicons
          name={icon}
          size={iconSize}
          color={iconColor}
          style={{ marginLeft: Spacing.sm }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
});
