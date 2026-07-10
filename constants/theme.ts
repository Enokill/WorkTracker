// Design tokens — Material 3 inspired
export const Colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  primaryContainer: '#EFF6FF',

  secondary: '#0891B2',
  secondaryLight: '#CFFAFE',

  accent: '#10B981',
  accentLight: '#D1FAE5',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  error: '#EF4444',
  errorLight: '#FEE2E2',

  success: '#22C55E',

  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceVariant: '#F8FAFC',

  onPrimary: '#FFFFFF',
  onSurface: '#0F172A',
  onSurfaceVariant: '#475569',
  onSurfaceSubtle: '#94A3B8',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  sunday: '#EF4444',
  today: '#2563EB',
  selected: '#1D4ED8',
  markedDot: '#10B981',

  cardShadow: 'rgba(15, 23, 42, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const Typography = {
  displayLarge: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  displayMedium: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  headlineLarge: { fontSize: 20, fontWeight: '700' as const },
  headlineMedium: { fontSize: 18, fontWeight: '600' as const },
  headlineSmall: { fontSize: 16, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  labelLarge: { fontSize: 14, fontWeight: '600' as const },
  labelMedium: { fontSize: 12, fontWeight: '600' as const },
  labelSmall: { fontSize: 11, fontWeight: '500' as const },
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
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
