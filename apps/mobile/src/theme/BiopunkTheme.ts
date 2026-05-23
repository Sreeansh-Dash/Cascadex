export const BiopunkTheme = {
  name: 'biopunk',
  label: 'Biopunk Luminescence',
  dark: true,

  colors: {
    bgPrimary:      '#080D14',
    bgSurface:      '#0E1521',
    bgElevated:     '#141E2E',
    bgBorder:       '#1E2E42',

    dangerStrong:   '#FF4500',
    dangerGlow:     'rgba(255, 69, 0, 0.25)',
    dangerSurface:  '#1A0800',
    warnStrong:     '#F59E0B',
    warnGlow:       'rgba(245, 158, 11, 0.20)',
    warnSurface:    '#1A1000',
    safeStrong:     '#00E5B4',
    safeGlow:       'rgba(0, 229, 180, 0.18)',
    safeSurface:    '#001A14',

    textPrimary:    '#E8EFF8',
    textSecondary:  '#7A90A8',
    textMuted:      '#3D5470',
    textInverse:    '#080D14',

    nodeDrug:       '#4A9EFF',
    nodeEnzyme:     '#A78BFA',
    nodeMetabolite: '#34D399',
    nodeReceptor:   '#F472B6',

    accent:         '#4A9EFF',
    accentGlow:     'rgba(74, 158, 255, 0.20)',
    accentSurface:  '#0A1830',

    cardBg:         '#0E1521',
    inputBg:        '#111B29',
    inputBorder:    '#1E2E42',
    inputFocus:     '#4A9EFF',
    tabBar:         '#080D14',
    tabBarBorder:   '#1E2E42',
    tabActive:      '#4A9EFF',
    tabInactive:    '#3D5470',
    switchTrack:    '#1E2E42',
    switchThumb:    '#4A9EFF',

    btnPrimaryBg:   '#4A9EFF',
    btnPrimaryText: '#080D14',
    btnSecBg:       'transparent',
    btnSecBorder:   '#4A9EFF',
    btnSecText:     '#4A9EFF',
    btnDestructive: '#FF4500',
    
    statusBar:      'light-content',
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
    dangerEdgePaint: { color: '#FF4500', strokeWidth: 3, blur: 6 },
    warnEdgePaint:   { color: '#F59E0B', strokeWidth: 2, blur: 4 },
    safeEdgePaint:   { color: '#00E5B4', strokeWidth: 1.5, blur: 0 },
    nodeShadowRadius: 10,
  },

  gradients: {
    screenBg:    ['#080D14', '#0A1020'],
    cardHover:   ['#0E1521', '#141E2E'],
    dangerCard:  ['#1A0800', '#0E1521'],
    heroText:    ['#4A9EFF', '#A78BFA'],
    splash:      ['#050A10', '#0A1830', '#080D14'],
  },

  shadows: {
    glowDanger: {
      shadowColor: '#FF4500',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      elevation: 10,
    },
    glowSafe: {
      shadowColor: '#00E5B4',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    glowAccent: {
      shadowColor: '#4A9EFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.30,
      shadowRadius: 10,
      elevation: 7,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.40,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};
