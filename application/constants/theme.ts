export const theme = {
  colors: {
    // Blue color palette (primary)
    primary: '#1976D2',       // Medium blue
    primaryLight: '#64B5F6',  // Light blue
    primaryDark: '#0D47A1',   // Dark blue

    // Complementary secondary (deep blue)
    secondary: '#1565C0',     
    secondaryLight: '#42A5F5',
    secondaryDark: '#0D3C6B',

    // Status colors
    success: '#4CAF50',       // Green
    successLight: '#81C784',
    successDark: '#388E3C',

    accent: '#2196F3',        // Bright blue accent
    warning: '#FFA000',       // Amber
    warningLight: '#FFC107',
    warningDark: '#FF8F00',

    error: '#D32F2F',         // Red
    errorLight: '#F44336',
    errorDark: '#B71C1C',

    // Gray scale (cool tones)
    gray: {
      100: '#F5F7FA',
      200: '#E3E9EF',
      300: '#CCD4DB',
      400: '#9EA7B3',
      500: '#6B778C',
      600: '#4D5666',
      700: '#353F4F',
      800: '#212B36',
      900: '#1A222D',
    },

    black: '#121212',         // Soft black
    white: '#FFFFFF',

    background: {
      light: '#F8FAFC',       // Very light blue-gray
      dark: '#0F172A',        // Navy dark mode
    },
  },

  // Spacing system (unchanged)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius (unchanged)
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },

  // Typography (unchanged)
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Enhanced shadows with blue undertones
  shadow: {
    small: {
      shadowColor: '#0D47A1',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#0D47A1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    large: {
      shadowColor: '#0D47A1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};