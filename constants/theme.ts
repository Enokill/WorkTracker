// Design tokens — Material 3 inspired, polished palette
export const Colors = {
  // Brand blues
  primary: '#1E40AF',
  primaryDark: '#1E3A8A',
  primaryMid: '#2563EB',
  primaryLight: '#DBEAFE',
  primaryContainer: '#EFF6FF',

  // Teal accent
  secondary: '#0E7490',
  secondaryLight: '#CFFAFE',

  // Emerald
  accent: '#059669',
  accentLight: '#D1FAE5',
  accentMid: '#10B981',

  // Amber
  warning: '#D97706',
  warningLight: '#FEF3C7',
  warningMid: '#F59E0B',

  // Status
  error: '#DC2626',
  errorLight: '#FEE2E2',
  success: '#16A34A',

  // Surfaces
  background: '#F0F4FF',
  backgroundAlt: '#E8EEF9',
  surface: '#FFFFFF',
  surfaceVariant: '#F8FAFC',
  surfaceElevated: '#FFFFFF',

  // Text
  onPrimary: '#FFFFFF',
  onSurface: '#0F172A',
  onSurfaceVariant: '#334155',
  onSurfaceSubtle: '#94A3B8',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderMedium: '#CBD5E1',

  // Calendar
  sunday: '#DC2626',
  today: '#1E40AF',
  selected: '#1E3A8A',
  markedDot: '#059669',

  // Gold / Carat
  gold: '#B45309',
  goldMid: '#D97706',
  goldLight: '#FEF3C7',
  goldBright: '#F59E0B',
  goldGradientStart: '#92400E',
  goldGradientEnd: '#F59E0B',

  // Misc
  cardShadow: 'rgba(15, 23, 42, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.52)',

  // Gradient stops (used with expo-linear-gradient)
  gradientPrimaryStart: '#1E3A8A',
  gradientPrimaryEnd: '#2563EB',
  gradientAccentStart: '#059669',
  gradientAccentEnd: '#34D399',
};

export const Typography = {
  displayLarge: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.8, lineHeight: 36 },
  displayMedium: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 32 },
  headlineLarge: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.2, lineHeight: 28 },
  headlineMedium: { fontSize: 19, fontWeight: '600' as const, lineHeight: 26 },
  headlineSmall: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  labelLarge: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.1 },
  labelMedium: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.2 },
  labelSmall: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.3 },
  numeric: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -1.2 },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  }),
};
