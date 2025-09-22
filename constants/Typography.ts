/**
 * PodCut Design System - Typography
 * Mobile-first typography scale optimized for readability while driving
 * Based on iOS and Material Design guidelines
 */

import { Platform, TextStyle } from 'react-native';

// Font families
export const FontFamily = {
  // iOS System fonts
  ios: {
    regular: 'SF Pro Text',
    medium: 'SF Pro Text',
    semibold: 'SF Pro Text',
    bold: 'SF Pro Text',
    display: 'SF Pro Display',
  },
  // Android System fonts
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    display: 'Roboto',
  },
  // Fallback system fonts
  default: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',
    default: 'System',
  }),
};

// Font weights
export const FontWeight = {
  light: '300' as TextStyle['fontWeight'],
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  heavy: '800' as TextStyle['fontWeight'],
};

// Base typography scale (mobile-first)
export const Typography = {
  // Display text - for hero sections and main titles
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    fontFamily: FontFamily.default,
  } as TextStyle,

  // Headlines
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
    fontFamily: FontFamily.default,
  } as TextStyle,

  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.2,
    fontFamily: FontFamily.default,
  } as TextStyle,

  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0,
    fontFamily: FontFamily.default,
  } as TextStyle,

  h4: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: FontWeight.medium,
    letterSpacing: 0,
    fontFamily: FontFamily.default,
  } as TextStyle,

  // Body text
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
    fontFamily: FontFamily.default,
  } as TextStyle,

  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FontWeight.medium,
    letterSpacing: 0,
    fontFamily: FontFamily.default,
  } as TextStyle,

  bodySemibold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0,
    fontFamily: FontFamily.default,
  } as TextStyle,

  // Small text
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
    fontFamily: FontFamily.default,
  } as TextStyle,

  smallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FontWeight.medium,
    letterSpacing: 0,
    fontFamily: FontFamily.default,
  } as TextStyle,

  // Captions and labels
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FontWeight.regular,
    letterSpacing: 0.3,
    fontFamily: FontFamily.default,
  } as TextStyle,

  captionMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.3,
    fontFamily: FontFamily.default,
  } as TextStyle,

  // Special purpose styles

  // Button text - optimized for touch targets
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    fontFamily: FontFamily.default,
    textAlign: 'center' as TextStyle['textAlign'],
  } as TextStyle,

  // Large button text for driving mode
  buttonLarge: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    fontFamily: FontFamily.default,
    textAlign: 'center' as TextStyle['textAlign'],
  } as TextStyle,

  // Input text
  input: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
    fontFamily: FontFamily.default,
  } as TextStyle,

  // Navigation text
  nav: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FontWeight.medium,
    letterSpacing: 0,
    fontFamily: FontFamily.default,
    textAlign: 'center' as TextStyle['textAlign'],
  } as TextStyle,

  // Timestamps and technical info
  mono: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FontWeight.regular,
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'SF Mono',
      android: 'monospace',
      default: 'monospace',
    }),
  } as TextStyle,
};

// Driving-specific typography (larger, higher contrast)
export const DrivingTypography = {
  // Extra large text for primary actions while driving
  primary: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    fontFamily: FontFamily.default,
    textAlign: 'center' as TextStyle['textAlign'],
  } as TextStyle,

  // Secondary text for driving
  secondary: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    fontFamily: FontFamily.default,
    textAlign: 'center' as TextStyle['textAlign'],
  } as TextStyle,

  // Minimal info text for driving
  info: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.3,
    fontFamily: FontFamily.default,
  } as TextStyle,
};

// Utility function to get responsive typography
export const getResponsiveTypography = (baseStyle: TextStyle, scaleFactor: number = 1.2) => ({
  ...baseStyle,
  fontSize: (baseStyle.fontSize || 16) * scaleFactor,
  lineHeight: (baseStyle.lineHeight || 24) * scaleFactor,
});

// Text style utilities
export const TextStyles = {
  // Quick access to common combinations
  title: Typography.h1,
  subtitle: Typography.h3,
  body: Typography.body,
  label: Typography.small,
  caption: Typography.caption,
  button: Typography.button,

  // Semantic text styles
  error: { ...Typography.small, fontWeight: FontWeight.medium },
  success: { ...Typography.small, fontWeight: FontWeight.medium },
  warning: { ...Typography.small, fontWeight: FontWeight.medium },

  // State-specific styles
  placeholder: { ...Typography.body, fontWeight: FontWeight.regular },
  disabled: { ...Typography.body, opacity: 0.6 },

  // Link styles
  link: { ...Typography.body, fontWeight: FontWeight.medium },
  linkSmall: { ...Typography.small, fontWeight: FontWeight.medium },
};