/**
 * Cascadex Design Tokens — Spacing, Radius, Shadows
 * Biopunk v2 glow-centric design system
 */

export const TOKENS = {
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
    xxl: 64,
  },
  shadow: {
    glowTeal: {
      shadowColor: '#00FFB2',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    glowMagenta: {
      shadowColor: '#FF0066',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 8,
    },
    glowViolet: {
      shadowColor: '#A855F7',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
    },
    glowAmber: {
      shadowColor: '#FFB800',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
} as const;

export type TokenSet = typeof TOKENS;
