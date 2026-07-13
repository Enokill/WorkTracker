// 8 themes × 2 modes (light/dark)

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ThemeId = 'ocean' | 'forest' | 'sunset' | 'lavender' | 'rose' | 'charcoal' | 'teal' | 'crimson';

export interface ThemeColors {
  // Brand
  primary: string;
  primaryDark: string;
  primaryMid: string;
  primaryLight: string;
  primaryContainer: string;

  // Accent/secondary
  secondary: string;
  secondaryLight: string;
  accent: string;
  accentLight: string;
  accentMid: string;

  // Status
  warning: string;
  warningLight: string;
  warningMid: string;
  error: string;
  errorLight: string;
  success: string;

  // Surfaces
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceVariant: string;
  surfaceElevated: string;

  // Text
  onPrimary: string;
  onSurface: string;
  onSurfaceVariant: string;
  onSurfaceSubtle: string;

  // Borders
  border: string;
  borderLight: string;
  borderMedium: string;

  // Calendar specific
  sunday: string;
  today: string;
  selected: string;
  markedDot: string;

  // Misc
  cardShadow: string;
  overlay: string;

  // Gradient stops
  gradientPrimaryStart: string;
  gradientPrimaryEnd: string;
  gradientAccentStart: string;
  gradientAccentEnd: string;
}

export interface ThemeDef {
  id: ThemeId;
  name: string;
  icon: string;
  light: ThemeColors;
  dark: ThemeColors;
}

// ─── 1. Ocean Blue ────────────────────────────────────────────────────────────
const ocean: ThemeDef = {
  id: 'ocean',
  name: 'Ocean Blue',
  icon: 'water',
  light: {
    primary: '#1E40AF', primaryDark: '#1E3A8A', primaryMid: '#2563EB',
    primaryLight: '#DBEAFE', primaryContainer: '#EFF6FF',
    secondary: '#0E7490', secondaryLight: '#CFFAFE',
    accent: '#059669', accentLight: '#D1FAE5', accentMid: '#10B981',
    warning: '#D97706', warningLight: '#FEF3C7', warningMid: '#F59E0B',
    error: '#DC2626', errorLight: '#FEE2E2', success: '#16A34A',
    background: '#F0F4FF', backgroundAlt: '#E8EEF9',
    surface: '#FFFFFF', surfaceVariant: '#F8FAFC', surfaceElevated: '#FFFFFF',
    onPrimary: '#FFFFFF', onSurface: '#0F172A', onSurfaceVariant: '#334155', onSurfaceSubtle: '#94A3B8',
    border: '#E2E8F0', borderLight: '#F1F5F9', borderMedium: '#CBD5E1',
    sunday: '#DC2626', today: '#1E40AF', selected: '#1E3A8A', markedDot: '#059669',
    cardShadow: 'rgba(15,23,42,0.08)', overlay: 'rgba(0,0,0,0.52)',
    gradientPrimaryStart: '#1E3A8A', gradientPrimaryEnd: '#2563EB',
    gradientAccentStart: '#059669', gradientAccentEnd: '#34D399',
  },
  dark: {
    primary: '#60A5FA', primaryDark: '#3B82F6', primaryMid: '#93C5FD',
    primaryLight: '#1E3A8A', primaryContainer: '#1E3A8A',
    secondary: '#22D3EE', secondaryLight: '#164E63',
    accent: '#34D399', accentLight: '#064E3B', accentMid: '#10B981',
    warning: '#FCD34D', warningLight: '#451A03', warningMid: '#F59E0B',
    error: '#F87171', errorLight: '#450A0A', success: '#4ADE80',
    background: '#0F172A', backgroundAlt: '#1E293B',
    surface: '#1E293B', surfaceVariant: '#273549', surfaceElevated: '#334155',
    onPrimary: '#0F172A', onSurface: '#F1F5F9', onSurfaceVariant: '#CBD5E1', onSurfaceSubtle: '#64748B',
    border: '#334155', borderLight: '#1E293B', borderMedium: '#475569',
    sunday: '#F87171', today: '#60A5FA', selected: '#3B82F6', markedDot: '#34D399',
    cardShadow: 'rgba(0,0,0,0.35)', overlay: 'rgba(0,0,0,0.7)',
    gradientPrimaryStart: '#1E3A8A', gradientPrimaryEnd: '#1D4ED8',
    gradientAccentStart: '#065F46', gradientAccentEnd: '#059669',
  },
};

// ─── 2. Forest Green ──────────────────────────────────────────────────────────
const forest: ThemeDef = {
  id: 'forest',
  name: 'Forest',
  icon: 'park',
  light: {
    primary: '#166534', primaryDark: '#14532D', primaryMid: '#16A34A',
    primaryLight: '#DCFCE7', primaryContainer: '#F0FDF4',
    secondary: '#0F766E', secondaryLight: '#CCFBF1',
    accent: '#CA8A04', accentLight: '#FEF9C3', accentMid: '#EAB308',
    warning: '#DC2626', warningLight: '#FEE2E2', warningMid: '#EF4444',
    error: '#DC2626', errorLight: '#FEE2E2', success: '#16A34A',
    background: '#F0FDF4', backgroundAlt: '#DCFCE7',
    surface: '#FFFFFF', surfaceVariant: '#F7FEF9', surfaceElevated: '#FFFFFF',
    onPrimary: '#FFFFFF', onSurface: '#052E16', onSurfaceVariant: '#166534', onSurfaceSubtle: '#86EFAC',
    border: '#BBF7D0', borderLight: '#DCFCE7', borderMedium: '#86EFAC',
    sunday: '#DC2626', today: '#166534', selected: '#14532D', markedDot: '#CA8A04',
    cardShadow: 'rgba(5,46,22,0.08)', overlay: 'rgba(0,0,0,0.52)',
    gradientPrimaryStart: '#14532D', gradientPrimaryEnd: '#16A34A',
    gradientAccentStart: '#CA8A04', gradientAccentEnd: '#FDE047',
  },
  dark: {
    primary: '#4ADE80', primaryDark: '#22C55E', primaryMid: '#86EFAC',
    primaryLight: '#14532D', primaryContainer: '#052E16',
    secondary: '#2DD4BF', secondaryLight: '#134E4A',
    accent: '#FDE047', accentLight: '#422006', accentMid: '#EAB308',
    warning: '#FCA5A5', warningLight: '#450A0A', warningMid: '#EF4444',
    error: '#F87171', errorLight: '#450A0A', success: '#4ADE80',
    background: '#052E16', backgroundAlt: '#14532D',
    surface: '#14532D', surfaceVariant: '#166534', surfaceElevated: '#15803D',
    onPrimary: '#052E16', onSurface: '#DCFCE7', onSurfaceVariant: '#BBF7D0', onSurfaceSubtle: '#4ADE80',
    border: '#166534', borderLight: '#052E16', borderMedium: '#15803D',
    sunday: '#FCA5A5', today: '#4ADE80', selected: '#22C55E', markedDot: '#FDE047',
    cardShadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.7)',
    gradientPrimaryStart: '#052E16', gradientPrimaryEnd: '#166534',
    gradientAccentStart: '#78350F', gradientAccentEnd: '#CA8A04',
  },
};

// ─── 3. Sunset Orange ─────────────────────────────────────────────────────────
const sunset: ThemeDef = {
  id: 'sunset',
  name: 'Sunset',
  icon: 'wb-sunny',
  light: {
    primary: '#C2410C', primaryDark: '#9A3412', primaryMid: '#EA580C',
    primaryLight: '#FFEDD5', primaryContainer: '#FFF7ED',
    secondary: '#B45309', secondaryLight: '#FEF3C7',
    accent: '#7C3AED', accentLight: '#EDE9FE', accentMid: '#8B5CF6',
    warning: '#DC2626', warningLight: '#FEE2E2', warningMid: '#EF4444',
    error: '#DC2626', errorLight: '#FEE2E2', success: '#16A34A',
    background: '#FFF7ED', backgroundAlt: '#FFEDD5',
    surface: '#FFFFFF', surfaceVariant: '#FFFBF7', surfaceElevated: '#FFFFFF',
    onPrimary: '#FFFFFF', onSurface: '#431407', onSurfaceVariant: '#7C2D12', onSurfaceSubtle: '#FDBA74',
    border: '#FED7AA', borderLight: '#FFEDD5', borderMedium: '#FDBA74',
    sunday: '#DC2626', today: '#C2410C', selected: '#9A3412', markedDot: '#7C3AED',
    cardShadow: 'rgba(67,20,7,0.08)', overlay: 'rgba(0,0,0,0.52)',
    gradientPrimaryStart: '#9A3412', gradientPrimaryEnd: '#F97316',
    gradientAccentStart: '#7C3AED', gradientAccentEnd: '#A78BFA',
  },
  dark: {
    primary: '#FB923C', primaryDark: '#F97316', primaryMid: '#FDBA74',
    primaryLight: '#7C2D12', primaryContainer: '#431407',
    secondary: '#FCD34D', secondaryLight: '#451A03',
    accent: '#A78BFA', accentLight: '#2E1065', accentMid: '#8B5CF6',
    warning: '#FCA5A5', warningLight: '#450A0A', warningMid: '#EF4444',
    error: '#F87171', errorLight: '#450A0A', success: '#4ADE80',
    background: '#1C0A00', backgroundAlt: '#431407',
    surface: '#2C1006', surfaceVariant: '#431407', surfaceElevated: '#7C2D12',
    onPrimary: '#1C0A00', onSurface: '#FED7AA', onSurfaceVariant: '#FDBA74', onSurfaceSubtle: '#9A3412',
    border: '#7C2D12', borderLight: '#431407', borderMedium: '#9A3412',
    sunday: '#FCA5A5', today: '#FB923C', selected: '#F97316', markedDot: '#A78BFA',
    cardShadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.7)',
    gradientPrimaryStart: '#431407', gradientPrimaryEnd: '#9A3412',
    gradientAccentStart: '#2E1065', gradientAccentEnd: '#7C3AED',
  },
};

// ─── 4. Lavender Purple ───────────────────────────────────────────────────────
const lavender: ThemeDef = {
  id: 'lavender',
  name: 'Lavender',
  icon: 'auto-awesome',
  light: {
    primary: '#7C3AED', primaryDark: '#6D28D9', primaryMid: '#8B5CF6',
    primaryLight: '#EDE9FE', primaryContainer: '#F5F3FF',
    secondary: '#BE185D', secondaryLight: '#FCE7F3',
    accent: '#0891B2', accentLight: '#CFFAFE', accentMid: '#06B6D4',
    warning: '#D97706', warningLight: '#FEF3C7', warningMid: '#F59E0B',
    error: '#DC2626', errorLight: '#FEE2E2', success: '#16A34A',
    background: '#F5F3FF', backgroundAlt: '#EDE9FE',
    surface: '#FFFFFF', surfaceVariant: '#FDFCFF', surfaceElevated: '#FFFFFF',
    onPrimary: '#FFFFFF', onSurface: '#2E1065', onSurfaceVariant: '#4C1D95', onSurfaceSubtle: '#A78BFA',
    border: '#DDD6FE', borderLight: '#EDE9FE', borderMedium: '#C4B5FD',
    sunday: '#DC2626', today: '#7C3AED', selected: '#6D28D9', markedDot: '#0891B2',
    cardShadow: 'rgba(46,16,101,0.08)', overlay: 'rgba(0,0,0,0.52)',
    gradientPrimaryStart: '#4C1D95', gradientPrimaryEnd: '#8B5CF6',
    gradientAccentStart: '#0E7490', gradientAccentEnd: '#22D3EE',
  },
  dark: {
    primary: '#A78BFA', primaryDark: '#8B5CF6', primaryMid: '#C4B5FD',
    primaryLight: '#4C1D95', primaryContainer: '#2E1065',
    secondary: '#F472B6', secondaryLight: '#500724',
    accent: '#22D3EE', accentLight: '#164E63', accentMid: '#06B6D4',
    warning: '#FCD34D', warningLight: '#451A03', warningMid: '#F59E0B',
    error: '#F87171', errorLight: '#450A0A', success: '#4ADE80',
    background: '#0D0520', backgroundAlt: '#1A0B3A',
    surface: '#1A0B3A', surfaceVariant: '#2E1065', surfaceElevated: '#4C1D95',
    onPrimary: '#0D0520', onSurface: '#EDE9FE', onSurfaceVariant: '#DDD6FE', onSurfaceSubtle: '#7C3AED',
    border: '#4C1D95', borderLight: '#2E1065', borderMedium: '#6D28D9',
    sunday: '#FCA5A5', today: '#A78BFA', selected: '#8B5CF6', markedDot: '#22D3EE',
    cardShadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.7)',
    gradientPrimaryStart: '#2E1065', gradientPrimaryEnd: '#4C1D95',
    gradientAccentStart: '#164E63', gradientAccentEnd: '#0E7490',
  },
};

// ─── 5. Rose Pink ─────────────────────────────────────────────────────────────
const rose: ThemeDef = {
  id: 'rose',
  name: 'Rose',
  icon: 'favorite',
  light: {
    primary: '#BE123C', primaryDark: '#9F1239', primaryMid: '#E11D48',
    primaryLight: '#FFE4E6', primaryContainer: '#FFF1F2',
    secondary: '#9D174D', secondaryLight: '#FCE7F3',
    accent: '#F59E0B', accentLight: '#FEF3C7', accentMid: '#D97706',
    warning: '#D97706', warningLight: '#FEF3C7', warningMid: '#F59E0B',
    error: '#DC2626', errorLight: '#FEE2E2', success: '#16A34A',
    background: '#FFF1F2', backgroundAlt: '#FFE4E6',
    surface: '#FFFFFF', surfaceVariant: '#FFFAFB', surfaceElevated: '#FFFFFF',
    onPrimary: '#FFFFFF', onSurface: '#4C0519', onSurfaceVariant: '#881337', onSurfaceSubtle: '#FDA4AF',
    border: '#FECDD3', borderLight: '#FFE4E6', borderMedium: '#FDA4AF',
    sunday: '#DC2626', today: '#BE123C', selected: '#9F1239', markedDot: '#F59E0B',
    cardShadow: 'rgba(76,5,25,0.08)', overlay: 'rgba(0,0,0,0.52)',
    gradientPrimaryStart: '#881337', gradientPrimaryEnd: '#F43F5E',
    gradientAccentStart: '#B45309', gradientAccentEnd: '#FCD34D',
  },
  dark: {
    primary: '#FB7185', primaryDark: '#F43F5E', primaryMid: '#FDA4AF',
    primaryLight: '#881337', primaryContainer: '#4C0519',
    secondary: '#F9A8D4', secondaryLight: '#500724',
    accent: '#FCD34D', accentLight: '#451A03', accentMid: '#EAB308',
    warning: '#FCD34D', warningLight: '#451A03', warningMid: '#F59E0B',
    error: '#F87171', errorLight: '#450A0A', success: '#4ADE80',
    background: '#1A0008', backgroundAlt: '#4C0519',
    surface: '#2D0014', surfaceVariant: '#4C0519', surfaceElevated: '#881337',
    onPrimary: '#1A0008', onSurface: '#FFE4E6', onSurfaceVariant: '#FECDD3', onSurfaceSubtle: '#BE123C',
    border: '#881337', borderLight: '#4C0519', borderMedium: '#9F1239',
    sunday: '#FCA5A5', today: '#FB7185', selected: '#F43F5E', markedDot: '#FCD34D',
    cardShadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.7)',
    gradientPrimaryStart: '#4C0519', gradientPrimaryEnd: '#881337',
    gradientAccentStart: '#451A03', gradientAccentEnd: '#B45309',
  },
};

// ─── 6. Charcoal Dark ─────────────────────────────────────────────────────────
const charcoal: ThemeDef = {
  id: 'charcoal',
  name: 'Charcoal',
  icon: 'nights-stay',
  light: {
    primary: '#374151', primaryDark: '#1F2937', primaryMid: '#4B5563',
    primaryLight: '#F3F4F6', primaryContainer: '#F9FAFB',
    secondary: '#6B7280', secondaryLight: '#F3F4F6',
    accent: '#10B981', accentLight: '#D1FAE5', accentMid: '#059669',
    warning: '#D97706', warningLight: '#FEF3C7', warningMid: '#F59E0B',
    error: '#DC2626', errorLight: '#FEE2E2', success: '#16A34A',
    background: '#F9FAFB', backgroundAlt: '#F3F4F6',
    surface: '#FFFFFF', surfaceVariant: '#F9FAFB', surfaceElevated: '#FFFFFF',
    onPrimary: '#FFFFFF', onSurface: '#111827', onSurfaceVariant: '#374151', onSurfaceSubtle: '#9CA3AF',
    border: '#E5E7EB', borderLight: '#F3F4F6', borderMedium: '#D1D5DB',
    sunday: '#DC2626', today: '#374151', selected: '#1F2937', markedDot: '#10B981',
    cardShadow: 'rgba(17,24,39,0.08)', overlay: 'rgba(0,0,0,0.52)',
    gradientPrimaryStart: '#111827', gradientPrimaryEnd: '#4B5563',
    gradientAccentStart: '#059669', gradientAccentEnd: '#34D399',
  },
  dark: {
    primary: '#D1D5DB', primaryDark: '#9CA3AF', primaryMid: '#E5E7EB',
    primaryLight: '#374151', primaryContainer: '#1F2937',
    secondary: '#9CA3AF', secondaryLight: '#374151',
    accent: '#34D399', accentLight: '#064E3B', accentMid: '#10B981',
    warning: '#FCD34D', warningLight: '#451A03', warningMid: '#F59E0B',
    error: '#F87171', errorLight: '#450A0A', success: '#4ADE80',
    background: '#030712', backgroundAlt: '#111827',
    surface: '#111827', surfaceVariant: '#1F2937', surfaceElevated: '#374151',
    onPrimary: '#030712', onSurface: '#F9FAFB', onSurfaceVariant: '#D1D5DB', onSurfaceSubtle: '#6B7280',
    border: '#374151', borderLight: '#1F2937', borderMedium: '#4B5563',
    sunday: '#FCA5A5', today: '#D1D5DB', selected: '#9CA3AF', markedDot: '#34D399',
    cardShadow: 'rgba(0,0,0,0.5)', overlay: 'rgba(0,0,0,0.75)',
    gradientPrimaryStart: '#030712', gradientPrimaryEnd: '#1F2937',
    gradientAccentStart: '#064E3B', gradientAccentEnd: '#059669',
  },
};

// ─── 7. Teal Cyan ─────────────────────────────────────────────────────────────
const teal: ThemeDef = {
  id: 'teal',
  name: 'Teal',
  icon: 'waves',
  light: {
    primary: '#0F766E', primaryDark: '#115E59', primaryMid: '#0D9488',
    primaryLight: '#CCFBF1', primaryContainer: '#F0FDFA',
    secondary: '#0369A1', secondaryLight: '#E0F2FE',
    accent: '#D97706', accentLight: '#FEF3C7', accentMid: '#F59E0B',
    warning: '#D97706', warningLight: '#FEF3C7', warningMid: '#F59E0B',
    error: '#DC2626', errorLight: '#FEE2E2', success: '#16A34A',
    background: '#F0FDFA', backgroundAlt: '#CCFBF1',
    surface: '#FFFFFF', surfaceVariant: '#F7FDFC', surfaceElevated: '#FFFFFF',
    onPrimary: '#FFFFFF', onSurface: '#042F2E', onSurfaceVariant: '#0F766E', onSurfaceSubtle: '#5EEAD4',
    border: '#99F6E4', borderLight: '#CCFBF1', borderMedium: '#5EEAD4',
    sunday: '#DC2626', today: '#0F766E', selected: '#115E59', markedDot: '#D97706',
    cardShadow: 'rgba(4,47,46,0.08)', overlay: 'rgba(0,0,0,0.52)',
    gradientPrimaryStart: '#134E4A', gradientPrimaryEnd: '#0D9488',
    gradientAccentStart: '#B45309', gradientAccentEnd: '#FCD34D',
  },
  dark: {
    primary: '#2DD4BF', primaryDark: '#14B8A6', primaryMid: '#5EEAD4',
    primaryLight: '#134E4A', primaryContainer: '#042F2E',
    secondary: '#38BDF8', secondaryLight: '#0C4A6E',
    accent: '#FCD34D', accentLight: '#451A03', accentMid: '#EAB308',
    warning: '#FCD34D', warningLight: '#451A03', warningMid: '#F59E0B',
    error: '#F87171', errorLight: '#450A0A', success: '#4ADE80',
    background: '#021714', backgroundAlt: '#042F2E',
    surface: '#042F2E', surfaceVariant: '#134E4A', surfaceElevated: '#115E59',
    onPrimary: '#021714', onSurface: '#CCFBF1', onSurfaceVariant: '#99F6E4', onSurfaceSubtle: '#0F766E',
    border: '#134E4A', borderLight: '#042F2E', borderMedium: '#115E59',
    sunday: '#FCA5A5', today: '#2DD4BF', selected: '#14B8A6', markedDot: '#FCD34D',
    cardShadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.7)',
    gradientPrimaryStart: '#021714', gradientPrimaryEnd: '#134E4A',
    gradientAccentStart: '#451A03', gradientAccentEnd: '#92400E',
  },
};

// ─── 8. Crimson Red ───────────────────────────────────────────────────────────
const crimson: ThemeDef = {
  id: 'crimson',
  name: 'Crimson',
  icon: 'local-fire-department',
  light: {
    primary: '#991B1B', primaryDark: '#7F1D1D', primaryMid: '#DC2626',
    primaryLight: '#FEE2E2', primaryContainer: '#FFF5F5',
    secondary: '#9D174D', secondaryLight: '#FCE7F3',
    accent: '#1D4ED8', accentLight: '#DBEAFE', accentMid: '#2563EB',
    warning: '#D97706', warningLight: '#FEF3C7', warningMid: '#F59E0B',
    error: '#DC2626', errorLight: '#FEE2E2', success: '#16A34A',
    background: '#FFF5F5', backgroundAlt: '#FEE2E2',
    surface: '#FFFFFF', surfaceVariant: '#FFFAFA', surfaceElevated: '#FFFFFF',
    onPrimary: '#FFFFFF', onSurface: '#450A0A', onSurfaceVariant: '#7F1D1D', onSurfaceSubtle: '#FCA5A5',
    border: '#FECACA', borderLight: '#FEE2E2', borderMedium: '#FCA5A5',
    sunday: '#DC2626', today: '#991B1B', selected: '#7F1D1D', markedDot: '#1D4ED8',
    cardShadow: 'rgba(69,10,10,0.08)', overlay: 'rgba(0,0,0,0.52)',
    gradientPrimaryStart: '#7F1D1D', gradientPrimaryEnd: '#EF4444',
    gradientAccentStart: '#1D4ED8', gradientAccentEnd: '#60A5FA',
  },
  dark: {
    primary: '#F87171', primaryDark: '#EF4444', primaryMid: '#FCA5A5',
    primaryLight: '#7F1D1D', primaryContainer: '#450A0A',
    secondary: '#F9A8D4', secondaryLight: '#500724',
    accent: '#60A5FA', accentLight: '#1E3A8A', accentMid: '#3B82F6',
    warning: '#FCD34D', warningLight: '#451A03', warningMid: '#F59E0B',
    error: '#F87171', errorLight: '#450A0A', success: '#4ADE80',
    background: '#1A0000', backgroundAlt: '#450A0A',
    surface: '#2D0000', surfaceVariant: '#450A0A', surfaceElevated: '#7F1D1D',
    onPrimary: '#1A0000', onSurface: '#FEE2E2', onSurfaceVariant: '#FECACA', onSurfaceSubtle: '#991B1B',
    border: '#7F1D1D', borderLight: '#450A0A', borderMedium: '#991B1B',
    sunday: '#FCA5A5', today: '#F87171', selected: '#EF4444', markedDot: '#60A5FA',
    cardShadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.7)',
    gradientPrimaryStart: '#450A0A', gradientPrimaryEnd: '#7F1D1D',
    gradientAccentStart: '#1E3A8A', gradientAccentEnd: '#1D4ED8',
  },
};

export const THEMES: ThemeDef[] = [ocean, forest, sunset, lavender, rose, charcoal, teal, crimson];

export function getThemeColors(themeId: ThemeId, isDark: boolean): ThemeColors {
  const theme = THEMES.find(t => t.id === themeId) || ocean;
  return isDark ? theme.dark : theme.light;
}
