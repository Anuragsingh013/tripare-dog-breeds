// Design System – colours, spacing, typography
export const Colors = {
  // Primary palette
  primary: '#6C63FF',
  primaryLight: '#9D96FF',
  primaryDark: '#4A42CC',
  // Accent
  accent: '#FF6B6B',
  accentLight: '#FF9B9B',
  // Neutral
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceElevated: '#252545',
  card: '#1E1E35',
  // Text
  textPrimary: '#F0EEFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  // Borders
  border: '#2A2A4A',
  borderLight: '#3A3A5A',
  // Status
  success: '#4ECDC4',
  warning: '#FFE66D',
  error: '#FF6B6B',
  errorBg: 'rgba(255,107,107,0.15)',
  // Trait colours
  traitHigh: '#4ECDC4',
  traitMid: '#FFE66D',
  traitLow: '#FF6B6B',
  // Size badge colours
  small: '#A8E6CF',
  medium: '#FFD3B6',
  large: '#FFAAA5',
  giant: '#FF8B94',
  // Overlay
  overlay: 'rgba(0,0,0,0.6)',
  // Tab bar
  tabActive: '#6C63FF',
  tabInactive: '#606080',
};

export const Typography = {
  display: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h1: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.2 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  h4: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.4 },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
};
