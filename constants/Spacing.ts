/**
 * PodCut Design System - Spacing
 * Consistent spacing system based on 8px grid
 * Optimized for touch targets and driving safety
 */

// Base unit: 8px
const BASE_UNIT = 8;

// Spacing scale (based on 8px grid)
export const Spacing = {
  // Micro spacing (for fine adjustments)
  xs2: BASE_UNIT * 0.25, // 2px
  xs: BASE_UNIT * 0.5,   // 4px

  // Small spacing
  sm: BASE_UNIT,         // 8px
  sm2: BASE_UNIT * 1.5,  // 12px

  // Medium spacing (default)
  md: BASE_UNIT * 2,     // 16px
  md2: BASE_UNIT * 2.5,  // 20px
  md3: BASE_UNIT * 3,    // 24px

  // Large spacing
  lg: BASE_UNIT * 4,     // 32px
  lg2: BASE_UNIT * 5,    // 40px
  lg3: BASE_UNIT * 6,    // 48px

  // Extra large spacing
  xl: BASE_UNIT * 8,     // 64px
  xl2: BASE_UNIT * 10,   // 80px
  xl3: BASE_UNIT * 12,   // 96px

  // XXL spacing (for major sections)
  xxl: BASE_UNIT * 16,   // 128px
  xxl2: BASE_UNIT * 20,  // 160px
};

// Container spacing (screen-level margins and paddings)
export const Container = {
  // Horizontal padding for main content
  paddingHorizontal: Spacing.md2, // 20px

  // Vertical padding for main content
  paddingVertical: Spacing.md,    // 16px

  // Section spacing
  sectionGap: Spacing.lg,         // 32px

  // Card spacing
  cardPadding: Spacing.md,        // 16px
  cardGap: Spacing.md,            // 16px

  // Screen edges
  screenPadding: Spacing.md2,     // 20px
};

// Component-specific spacing
export const Component = {
  // Touch targets (minimum 44px as per Apple guidelines)
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
    padding: Spacing.sm2, // 12px
  },

  // Buttons
  button: {
    paddingVertical: Spacing.md,    // 16px
    paddingHorizontal: Spacing.md3, // 24px
    borderRadius: Spacing.md,       // 16px
    gap: Spacing.sm,                // 8px
  },

  // Large buttons (for driving mode)
  buttonLarge: {
    paddingVertical: Spacing.md3,   // 24px
    paddingHorizontal: Spacing.lg,  // 32px
    borderRadius: Spacing.md2,      // 20px
    gap: Spacing.sm2,               // 12px
    minHeight: 80,                  // Large touch target
  },

  // Input fields
  input: {
    paddingVertical: Spacing.md,    // 16px
    paddingHorizontal: Spacing.md,  // 16px
    borderRadius: Spacing.sm2,      // 12px
    minHeight: 48,                  // Comfortable touch target
  },

  // Cards
  card: {
    padding: Spacing.md,            // 16px
    borderRadius: Spacing.md,       // 16px
    gap: Spacing.sm2,               // 12px
  },

  // List items
  listItem: {
    paddingVertical: Spacing.sm2,   // 12px
    paddingHorizontal: Spacing.md,  // 16px
    gap: Spacing.sm,                // 8px
    minHeight: 56,                  // Material Design recommendation
  },

  // Navigation
  nav: {
    padding: Spacing.sm,            // 8px
    gap: Spacing.xs,                // 4px
  },

  // Modal/Bottom sheet
  modal: {
    padding: Spacing.md3,           // 24px
    borderRadius: Spacing.md2,      // 20px
  },
};

// Layout spacing
export const Layout = {
  // Header spacing
  header: {
    height: 64,
    paddingHorizontal: Spacing.md2, // 20px
    paddingVertical: Spacing.sm,    // 8px
  },

  // Tab bar spacing
  tabBar: {
    height: 80, // Larger for easier driving use
    paddingBottom: Spacing.sm,      // 8px (for safe area)
    paddingTop: Spacing.sm,         // 8px
  },

  // Content spacing
  content: {
    paddingTop: Spacing.md,         // 16px
    paddingBottom: Spacing.lg,      // 32px
    gap: Spacing.md,                // 16px between sections
  },

  // Floating elements
  floating: {
    margin: Spacing.md,             // 16px from edges
    bottom: Spacing.xl,             // 64px from bottom (above tab bar)
  },
};

// Driving mode spacing (larger touch targets)
export const DrivingSpacing = {
  // Extra large touch targets for safety
  touchTarget: {
    minHeight: 80,
    minWidth: 80,
    padding: Spacing.md3, // 24px
  },

  // Primary action buttons
  primaryButton: {
    paddingVertical: Spacing.lg,    // 32px
    paddingHorizontal: Spacing.lg2, // 40px
    borderRadius: Spacing.md3,      // 24px
    minHeight: 96,                  // Very large touch target
  },

  // Reduced density for easier interaction
  listItem: {
    paddingVertical: Spacing.md3,   // 24px
    paddingHorizontal: Spacing.md3, // 24px
    minHeight: 72,                  // Larger than normal
  },
};

// Border radius scale
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999, // For circular elements
};

// Icon sizes
export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 40,

  // Driving mode (larger for visibility)
  driving: {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  },
};

// Utility functions
export const createSpacing = (multiplier: number) => BASE_UNIT * multiplier;

export const createMargin = (top = 0, right = 0, bottom = 0, left = 0) => ({
  marginTop: createSpacing(top),
  marginRight: createSpacing(right),
  marginBottom: createSpacing(bottom),
  marginLeft: createSpacing(left),
});

export const createPadding = (top = 0, right = 0, bottom = 0, left = 0) => ({
  paddingTop: createSpacing(top),
  paddingRight: createSpacing(right),
  paddingBottom: createSpacing(bottom),
  paddingLeft: createSpacing(left),
});

// Quick margin/padding utilities
export const MarginUtils = {
  // Horizontal margins
  mh: (value: keyof typeof Spacing) => ({ marginHorizontal: Spacing[value] }),
  mv: (value: keyof typeof Spacing) => ({ marginVertical: Spacing[value] }),
  mt: (value: keyof typeof Spacing) => ({ marginTop: Spacing[value] }),
  mb: (value: keyof typeof Spacing) => ({ marginBottom: Spacing[value] }),
  ml: (value: keyof typeof Spacing) => ({ marginLeft: Spacing[value] }),
  mr: (value: keyof typeof Spacing) => ({ marginRight: Spacing[value] }),
};

export const PaddingUtils = {
  // Horizontal paddings
  ph: (value: keyof typeof Spacing) => ({ paddingHorizontal: Spacing[value] }),
  pv: (value: keyof typeof Spacing) => ({ paddingVertical: Spacing[value] }),
  pt: (value: keyof typeof Spacing) => ({ paddingTop: Spacing[value] }),
  pb: (value: keyof typeof Spacing) => ({ paddingBottom: Spacing[value] }),
  pl: (value: keyof typeof Spacing) => ({ paddingLeft: Spacing[value] }),
  pr: (value: keyof typeof Spacing) => ({ paddingRight: Spacing[value] }),
};