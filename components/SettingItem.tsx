import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap | React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string | number | boolean;
  type?: 'button' | 'switch' | 'picker' | 'info' | 'action';
  destructive?: boolean;
  isDestructive?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  showChevron?: boolean;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  value,
  type = 'button',
  destructive = false,
  isDestructive = false,
  disabled = false,
  onPress,
  onToggle,
  showChevron = true,
}) => {
  const isDestructiveStyle = destructive || isDestructive;

  const handlePress = () => {
    if (disabled) return;

    if (type === 'switch' && onToggle && typeof value === 'boolean') {
      onToggle(!value);
    } else if (onPress) {
      onPress();
    }
  };

  const renderRightContent = () => {
    switch (type) {
      case 'switch':
        return (
          <Switch
            value={value as boolean}
            onValueChange={onToggle}
            disabled={disabled}
            trackColor={{
              false: Colors.border.medium,
              true: Colors.primary,
            }}
            thumbColor={Platform.OS === 'ios' ? undefined : Colors.background.white}
          />
        );

      case 'picker':
      case 'info':
        return (
          <View style={styles.valueContainer}>
            {value !== undefined && (
              <Text style={[styles.valueText, isDestructiveStyle && styles.valueTextDestructive]}>
                {value}
              </Text>
            )}
            {showChevron && type === 'picker' && (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.text.light}
                style={styles.chevron}
              />
            )}
          </View>
        );

      case 'action':
        return showChevron ? (
          <Ionicons name="chevron-forward" size={16} color={Colors.text.light} />
        ) : null;

      default:
        return showChevron ? (
          <Ionicons name="chevron-forward" size={16} color={Colors.text.light} />
        ) : null;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.containerDisabled]}
      onPress={handlePress}
      disabled={disabled || type === 'info'}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isDestructiveStyle && styles.iconContainerDestructive]}>
        {typeof icon === 'string' ? (
          <Ionicons
            name={icon}
            size={20}
            color={isDestructiveStyle ? Colors.error : Colors.text.secondary}
          />
        ) : (
          icon
        )}
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            isDestructiveStyle && styles.titleDestructive,
            disabled && styles.titleDisabled,
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, disabled && styles.subtitleDisabled]}>{subtitle}</Text>
        )}
      </View>

      {renderRightContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background.white,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  titleDestructive: {
    color: Colors.error,
  },
  titleDisabled: {
    color: Colors.text.light,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  subtitleDisabled: {
    color: Colors.text.light,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 4,
  },
  valueTextDestructive: {
    color: Colors.error,
  },
  chevron: {
    marginLeft: 4,
  },
});
