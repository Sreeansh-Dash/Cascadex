export const PastelTheme = {
  name: 'pastel',
  label: 'Pastel Clarity',
  dark: false,

  colors: {
    bgPrimary:      '#F8F5F2',
    bgSurface:      '#FFFFFF',
    bgElevated:     '#FEF9F6',
    bgBorder:       '#E8DDD6',

    dangerStrong:   '#C0392B',
    dangerGlow:     'rgba(192, 57, 43, 0.12)',
    dangerSurface:  '#FDF0EE',
    warnStrong:     '#D97706',
    warnGlow:       'rgba(217, 119, 6, 0.12)',
    warnSurface:    '#FEF8EC',
    safeStrong:     '#059669',
    safeGlow:       'rgba(5, 150, 105, 0.12)',
    safeSurface:    '#F0FDF8',

    textPrimary:    '#2D2420',
    textSecondary:  '#7C6B63',
    textMuted:      '#B5A69E',
    textInverse:    '#FFFFFF',

    nodeDrug:       '#5B8DEF',
    nodeEnzyme:     '#9B7FD4',
    nodeMetabolite: '#3DAA84',
    nodeReceptor:   '#D4637A',

    accent:         '#7C5CBF',
    accentGlow:     'rgba(124, 92, 191, 0.12)',
    accentSurface:  '#F4EFFC',

    cardBg:         '#FFFFFF',
    inputBg:        '#F8F5F2',
    inputBorder:    '#D8CFC8',
    inputFocus:     '#7C5CBF',
    tabBar:         '#FFFFFF',
    tabBarBorder:   '#E8DDD6',
    tabActive:      '#7C5CBF',
    tabInactive:    '#B5A69E',
    switchTrack:    '#D8CFC8',
    switchThumb:    '#7C5CBF',

    btnPrimaryBg:   '#7C5CBF',
    btnPrimaryText: '#FFFFFF',
    btnSecBg:       'transparent',
    btnSecBorder:   '#7C5CBF',
    btnSecText:     '#7C5CBF',
    btnDestructive: '#C0392B',

    statusBar:      'dark-content',
  },

  typography: {
    display:  'Syne_800ExtraBold',
    heading:  'Syne_700Bold',
    subhead:  'Syne_600SemiBold',
    body:     'IBMPlexSans_400Regular',
    bodyMed:  'IBMPlexSans_500Medium',
    mono:     'IBMPlexMono_400Regular',
    monoMed:  'IBMPlexMono_500Medium',
  },

  graph: {
    dangerEdgePaint: { color: '#C0392B', strokeWidth: 2.5, blur: 0 },
    warnEdgePaint:   { color: '#D97706', strokeWidth: 2, blur: 0 },
    safeEdgePaint:   { color: '#059669', strokeWidth: 1.5, blur: 0 },
    nodeShadowRadius: 6,
  },

  gradients: {
    screenBg:    ['#F8F5F2', '#F2EDE8'],
    cardHover:   ['#FFFFFF', '#FDF9F6'],
    dangerCard:  ['#FDF0EE', '#FFFFFF'],
    heroText:    ['#7C5CBF', '#D4637A'],
    splash:      ['#F8F5F2', '#EDE8F2', '#F5F0F8'],
  },

  shadows: {
    glowDanger: {
      shadowColor: '#C0392B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    glowSafe: {
      shadowColor: '#059669',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    glowAccent: {
      shadowColor: '#7C5CBF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    card: {
      shadowColor: '#2D2420',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
  },
};
