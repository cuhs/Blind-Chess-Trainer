/**
 * Design tokens synced from Google Stitch.
 * Project: MindBoard: Blindfold Chess Academy (3837939560019732420)
 * Design system: Playful Tactile Minimalism
 * Do not edit manually — re-sync via stitch-designs skill.
 */

export const colors = {
  background: '#faf9f8',
  surface: '#faf9f8',
  surfaceDim: '#dadad9',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f4f3f2',
  surfaceContainer: '#eeeeec',
  surfaceContainerHigh: '#e9e8e7',
  surfaceContainerHighest: '#e3e2e1',
  onSurface: '#1a1c1b',
  onSurfaceVariant: '#3f4a36',
  outline: '#6f7b64',
  outlineVariant: '#becbb1',

  primary: '#2b6c00',
  onPrimary: '#ffffff',
  primaryContainer: '#58cc02',
  onPrimaryContainer: '#1e5000',

  secondary: '#755b00',
  onSecondary: '#ffffff',
  secondaryContainer: '#fec700',
  onSecondaryContainer: '#6e5400',
  secondaryFixed: '#ffdf92',
  onSecondaryFixedVariant: '#594400',

  tertiary: '#006590',
  onTertiary: '#ffffff',
  tertiaryContainer: '#4abdff',
  onTertiaryContainer: '#004a6b',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Semantic aliases (Stitch designMd)
  success: '#58cc02',
  ahaYellow: '#fec700',
  actionBlue: '#4abdff',
  fogStone: '#afafae',
  cardStroke: '#e5e5e5',
  recessedBg: '#f7f7f7',
  contrastInk: '#4b4b4b',
  streak: '#fec700',
} as const;

export const spacing = {
  unit: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  gutter: 16,
  marginMobile: 20,
  sectionGap: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
  boardSquare: 4,
} as const;

export const typography = {
  displayLg: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800' as const,
    letterSpacing: -0.64,
  },
  displayLgMobile: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800' as const,
    letterSpacing: -0.56,
  },
  headlineLg: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800' as const,
  },
  headlineMd: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
  bodyLg: {
    fontFamily: 'BeVietnamPro-Medium',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500' as const,
  },
  bodyMd: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  labelBold: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700' as const,
    letterSpacing: 0.7,
  },
  button: {
    fontFamily: 'BeVietnamPro-Medium',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  statValue: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800' as const,
  },
  statLabel: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

export const touch = {
  min: 44,
  inputHeight: 56,
  buttonOffset: 4,
  strokeWidth: 2,
  progressBarHeight: 12,
} as const;

export const motion = {
  buttonPress: 4,
  pieceHoverOffset: 2,
} as const;

export const layout = {
  headerHeight: 64,
  tabBarHeight: 72,
  tabIconSize: 24,
  // tabBarHeight + default bottom inset (spacing.md) + breathing room (40).
  tabBarClearance: 128,
} as const;

export const stitchMeta = {
  projectId: '3837939560019732420',
  projectTitle: 'MindBoard: Blindfold Chess Academy',
  designSystem: 'Playful Tactile Minimalism',
  colorMode: 'LIGHT',
  deviceType: 'MOBILE',
} as const;
