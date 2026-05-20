/**
 * Cascadex Typography System
 * Syne (headlines), IBM Plex Sans (body), Space Mono (HUD/labels)
 */

export const FONTS = {
  syne: {
    regular: 'Syne_400Regular',
    semiBold: 'Syne_600SemiBold',
    bold: 'Syne_700Bold',
    extraBold: 'Syne_800ExtraBold',
  },
  body: {
    light: 'IBMPlexSans_300Light',
    regular: 'IBMPlexSans_400Regular',
    medium: 'IBMPlexSans_500Medium',
    semiBold: 'IBMPlexSans_600SemiBold',
  },
  mono: {
    regular: 'SpaceMono_400Regular',
    bold: 'SpaceMono_700Bold',
  },
} as const;

export const TYPE_SCALE = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: FONTS.syne.bold,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: FONTS.syne.bold,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONTS.syne.semiBold,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: FONTS.syne.semiBold,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FONTS.body.regular,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONTS.body.regular,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FONTS.body.medium,
  },
  hud: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: FONTS.mono.regular,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONTS.mono.regular,
  },
} as const;

export type TypeScaleKey = keyof typeof TYPE_SCALE;
