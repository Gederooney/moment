/**
 * Moments Design System - Colors
 * Optimized for driving safety and YouTube familiarity
 * Supports both light and dark themes
 */

const lightColors = {
  // Primary YouTube-inspired colors
  primary: '#FF0000', // YouTube Red - for primary actions
  primaryLight: '#FF3333', // Lighter red for hover states
  primaryDark: '#CC0000', // Darker red for pressed states

  // Secondary brand colors
  secondary: '#282828', // YouTube dark gray
  secondaryLight: '#3F3F3F',

  // Accent colors
  accent: '#1E88E5', // Blue for links and info
  accentLight: '#42A5F5',

  // Semantic colors
  success: '#4CAF50', // Green for confirmations
  successLight: '#66BB6A',
  warning: '#FF9800', // Orange for warnings
  warningLight: '#FFB74D',
  error: '#F44336', // Red for errors
  errorLight: '#EF5350',

  // Text colors optimized for readability
  text: {
    primary: '#212121', // High contrast for main text
    secondary: '#757575', // Medium contrast for secondary text
    tertiary: '#BDBDBD', // Low contrast for disabled text
    white: '#FFFFFF',
    inverse: '#FFFFFF', // White text on dark backgrounds
    link: '#1E88E5',
    error: '#F44336',
    success: '#4CAF50',
    light: '#757575', // Added for compatibility
  },

  // Background colors
  background: {
    primary: '#FFFFFF', // Main app background
    secondary: '#FAFAFA', // Card backgrounds
    tertiary: '#F5F5F5', // Input backgrounds
    overlay: 'rgba(0, 0, 0, 0.6)', // Modal overlays
    surface: '#FFFFFF', // Elevated surfaces
    disabled: '#F5F5F5',
    white: '#FFFFFF', // Added for compatibility
    dark: '#121212', // Added for compatibility
  },

  // Border and divider colors
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#757575',
    focus: '#1E88E5', // Blue for focused inputs
    error: '#F44336',
    success: '#4CAF50',
  },

  // Shadow colors for depth
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(0, 0, 0, 0.25)',
  },
};

const darkColors = {
  // Primary colors remain the same for brand consistency
  primary: '#FF0000',
  primaryLight: '#FF3333',
  primaryDark: '#CC0000',

  secondary: '#FFFFFF',
  secondaryLight: '#F5F5F5',

  accent: '#2196F3', // Slightly brighter blue for dark mode
  accentLight: '#42A5F5',

  success: '#66BB6A',
  successLight: '#81C784',
  warning: '#FFB74D',
  warningLight: '#FFCC02',
  error: '#EF5350',
  errorLight: '#E57373',

  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#757575',
    white: '#FFFFFF',
    inverse: '#212121',
    link: '#2196F3',
    error: '#EF5350',
    success: '#66BB6A',
    light: '#B0B0B0', // Added for compatibility
  },

  background: {
    primary: '#121212', // Material Design dark background
    secondary: '#1E1E1E', // Elevated surfaces
    tertiary: '#2C2C2C', // Input backgrounds
    overlay: 'rgba(0, 0, 0, 0.8)',
    surface: '#1E1E1E',
    disabled: '#2C2C2C',
    white: '#FFFFFF', // Added for compatibility
    dark: '#121212', // Added for compatibility
  },

  border: {
    light: '#2C2C2C',
    medium: '#404040',
    dark: '#757575',
    focus: '#2196F3',
    error: '#EF5350',
    success: '#66BB6A',
  },

  shadow: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.4)',
    dark: 'rgba(0, 0, 0, 0.6)',
  },
};

// Main Colors object that can be switched based on theme
export const Colors = {
  light: lightColors,
  dark: darkColors,

  // Default export for backward compatibility (light theme)
  ...lightColors,

  // Special colors for driving mode (high contrast, large targets)
  driving: {
    primary: '#FF0000', // High visibility red
    background: '#000000', // Pure black for night driving
    text: '#FFFFFF', // Pure white for maximum contrast
    accent: '#00FF00', // High visibility green for success
    warning: '#FFFF00', // High visibility yellow
  },
};

// Theme switching utility
export const getColors = (isDark: boolean = false) => {
  return isDark ? Colors.dark : Colors.light;
};

// Driving mode colors for maximum safety
export const getDrivingColors = () => Colors.driving;
