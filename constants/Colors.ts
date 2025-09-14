/**
 * Aarogya Color Palette
 * Based on context.md specifications - warm, pastel-first design
 */

export const Colors = {
  // Primary palette (pastels)
  background: '#FFF8F3',        // Background (soft cream)
  primary: '#A8E6CF',           // Primary (soft teal) - success/positive accents
  secondary: '#FFD1DC',         // Secondary (pastel pink) - warm maternal accent
  warning: '#FFE9A8',           // Warning (pastel amber)
  danger: '#FFB4AB',            // Danger (muted coral) - red-flag highlights
  success: '#A8E6CF',           // Success (same as primary for consistency)
  
  // Text colors
  textPrimary: '#2F2F2F',       // Text primary
  textMuted: '#6B6B6B',         // Muted text
  textLight: '#FFFFFF',         // Light text for dark backgrounds
  
  // Additional colors for gradients and effects
  primaryLight: '#B8F0D7',      // Lighter version of primary
  secondaryLight: '#FFE1E8',    // Lighter version of secondary
  
  // Gradient colors for background animation
  gradientStart: '#FFF8F3',     // Soft cream
  gradientMiddle: '#F8F4F0',    // Slightly darker cream
  gradientEnd: '#F5F0EB',       // Even darker cream for subtle shift
};

export const Typography = {
  // Font families (using system fonts for demo)
  heading: 'System',             // Headlines: rounded, friendly
  headingMedium: 'System',
  headingRegular: 'System',
  
  body: 'System',                // Body text
  bodyMedium: 'System',
  bodySemiBold: 'System',
  
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export default Colors;
