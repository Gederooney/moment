/**
 * PodCut Design System - Shadows
 * Consistent shadow system for depth and elevation
 * Optimized for both iOS and Android platforms
 */

import { Platform, ViewStyle } from 'react-native';
import { Colors } from './Colors';

// Shadow presets based on Material Design elevation levels
export const Shadows = {
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,

  // Level 1 - Subtle depth (buttons, cards)
  xs: Platform.select({
    ios: {
      shadowColor: Colors.shadow?.light || 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: Colors.shadow?.light || 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 2,
    },
  }) as ViewStyle,

  // Level 2 - Light elevation (input fields, small cards)
  sm: Platform.select({
    ios: {
      shadowColor: Colors.shadow?.light || 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: Colors.shadow?.light || 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
    },
  }) as ViewStyle,

  // Level 3 - Medium elevation (raised cards, FAB)
  md: Platform.select({
    ios: {
      shadowColor: Colors.shadow?.medium || 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
    default: {
      shadowColor: Colors.shadow?.medium || 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 6,
    },
  }) as ViewStyle,

  // Level 4 - High elevation (navigation drawer, modal)
  lg: Platform.select({
    ios: {
      shadowColor: Colors.shadow?.medium || 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 16,
    },
    android: {
      elevation: 12,
    },
    default: {
      shadowColor: Colors.shadow?.medium || 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 12,
    },
  }) as ViewStyle,

  // Level 5 - Maximum elevation (dialogs, dropdowns)
  xl: Platform.select({
    ios: {
      shadowColor: Colors.shadow?.dark || 'rgba(0, 0, 0, 0.25)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 24,
    },
    android: {
      elevation: 16,
    },
    default: {
      shadowColor: Colors.shadow?.dark || 'rgba(0, 0, 0, 0.25)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 16,
    },
  }) as ViewStyle,
};

// Colored shadows for special elements
export const ColoredShadows = {
  // Primary color shadows (for CTAs)
  primary: Platform.select({
    ios: {
      shadowColor: Colors.primary || '#FF0000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: Colors.primary || '#FF0000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  }) as ViewStyle,

  // Success shadows
  success: Platform.select({
    ios: {
      shadowColor: Colors.success || '#4CAF50',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: Colors.success || '#4CAF50',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
  }) as ViewStyle,

  // Error shadows
  error: Platform.select({
    ios: {
      shadowColor: Colors.error || '#F44336',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: Colors.error || '#F44336',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
  }) as ViewStyle,

  // Warning shadows
  warning: Platform.select({
    ios: {
      shadowColor: Colors.warning || '#FF9800',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: Colors.warning || '#FF9800',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
  }) as ViewStyle,
};

// Inset shadows (for pressed states)
export const InsetShadows = {
  // Subtle inset for pressed buttons
  pressed: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    // Note: inset shadows don't work on Android elevation
  } as ViewStyle,
};

// Glow effects (for focused elements)
export const GlowShadows = {
  // Focus glow
  focus: Platform.select({
    ios: {
      shadowColor: Colors.accent || '#1E88E5',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: Colors.accent || '#1E88E5',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
  }) as ViewStyle,

  // Capture button glow
  capture: Platform.select({
    ios: {
      shadowColor: Colors.primary || '#FF0000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: Colors.primary || '#FF0000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
  }) as ViewStyle,
};

// Component-specific shadows
export const ComponentShadows = {
  // Card shadows
  card: Shadows.sm,
  cardHover: Shadows.md,

  // Button shadows
  button: Shadows.xs,
  buttonPressed: InsetShadows.pressed,
  buttonPrimary: ColoredShadows.primary,

  // Input shadows
  input: Shadows.xs,
  inputFocused: GlowShadows.focus,

  // Navigation shadows
  tabBar: Shadows.lg,
  header: Shadows.sm,

  // Modal shadows
  modal: Shadows.xl,
  bottomSheet: Shadows.lg,

  // Floating elements
  fab: Shadows.md,
  tooltip: Shadows.md,

  // Special elements
  captureButton: GlowShadows.capture,
};

// Utility function to create custom shadows
export const createShadow = (
  color = 'rgba(0, 0, 0, 0.1)',
  offsetY = 2,
  shadowRadius = 4,
  shadowOpacity = 1,
  elevation = 4
) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity,
      shadowRadius,
    },
    android: {
      elevation,
    },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity,
      shadowRadius,
      elevation,
    },
  }) as ViewStyle;

// Utility to get shadow based on theme
export const getShadow = (shadowName: keyof typeof Shadows, isDark = false) => {
  const baseShadow = Shadows[shadowName];

  if (!isDark) return baseShadow;

  // Adjust shadows for dark theme
  return {
    ...baseShadow,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOpacity: Platform.OS === 'ios' ? 1 : baseShadow.shadowOpacity || 1,
  };
};
