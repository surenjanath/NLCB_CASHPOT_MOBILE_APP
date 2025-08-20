export const lightTheme = {
  colors: {
    // Modern primary palette
    primary: '#7C3AED', // Vibrant purple
    primaryLight: '#A78BFA',
    primaryDark: '#5B21B6',
    
    // Sophisticated secondary palette
    secondary: '#F59E0B', // Warm amber
    secondaryLight: '#FBBF24',
    secondaryDark: '#D97706',
    
    // Accent colors
    accent: '#10B981', // Emerald green
    accentLight: '#34D399',
    accentDark: '#059669',
    
    // Neutral backgrounds
    background: '#FAFAFA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    
    // Text hierarchy
    text: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    
    // Borders and dividers
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.08)',
    
    // Modern gradients
    gradient: {
      primary: ['#7C3AED', '#A78BFA'],
      secondary: ['#F59E0B', '#FBBF24'],
      accent: ['#10B981', '#34D399'],
      success: ['#10B981', '#059669'],
      warning: ['#F59E0B', '#D97706'],
      error: ['#EF4444', '#DC2626'],
      info: ['#3B82F6', '#1D4ED8'],
      // Special gradients
      premium: ['#8B5CF6', '#EC4899'],
      sunset: ['#F59E0B', '#EF4444'],
      ocean: ['#06B6D4', '#3B82F6'],
      forest: ['#10B981', '#059669'],
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  typography: {
    h1: { fontSize: 36, fontWeight: '900', lineHeight: 44, letterSpacing: -0.5 },
    h2: { fontSize: 32, fontWeight: '800', lineHeight: 40, letterSpacing: -0.25 },
    h3: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
    h4: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
    h5: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodyLarge: { fontSize: 18, fontWeight: '400', lineHeight: 28 },
    bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
    label: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
    button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
      elevation: 12,
    },
    // Special shadows
    glow: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 8,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    // Dark mode primary palette
    primary: '#A78BFA',
    primaryLight: '#C4B5FD',
    primaryDark: '#7C3AED',
    
    // Dark mode secondary palette
    secondary: '#FBBF24',
    secondaryLight: '#FCD34D',
    secondaryDark: '#F59E0B',
    
    // Dark mode accent colors
    accent: '#34D399',
    accentLight: '#6EE7B7',
    accentDark: '#10B981',
    
    // Dark backgrounds
    background: '#0F172A',
    surface: '#1E293B',
    card: '#334155',
    
    // Dark text hierarchy
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    
    // Dark borders
    border: '#475569',
    borderLight: '#334155',
    
    // Dark status colors
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    
    // Dark shadows
    shadow: 'rgba(0, 0, 0, 0.4)',
    
    // Dark gradients
    gradient: {
      primary: ['#A78BFA', '#C4B5FD'],
      secondary: ['#FBBF24', '#FCD34D'],
      accent: ['#34D399', '#6EE7B7'],
      success: ['#34D399', '#10B981'],
      warning: ['#FBBF24', '#F59E0B'],
      error: ['#F87171', '#EF4444'],
      info: ['#60A5FA', '#3B82F6'],
      premium: ['#C4B5FD', '#F9A8D4'],
      sunset: ['#FBBF24', '#F87171'],
      ocean: ['#22D3EE', '#60A5FA'],
      forest: ['#34D399', '#10B981'],
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 6,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 12,
    },
    glow: {
      shadowColor: '#A78BFA',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 8,
    },
  },
};

export type Theme = typeof lightTheme;