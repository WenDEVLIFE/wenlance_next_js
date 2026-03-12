/**
 * AppColors utility class converted from Flutter.
 * Colors from darkest to lightest:
 * 03045E → 023E8A → 0077B6 → 0096C7 → 00B4D8 → 48CAE4 → 90E0EF → ADE8F4 → CAF0F8
 */
export const AppColors = {
  // Primary Blue Palette
  blue900: '#03045E',
  blue800: '#023E8A',
  blue700: '#0077B6',
  blue600: '#0096C7',
  blue500: '#00B4D8',
  blue400: '#48CAE4',
  blue300: '#90E0EF',
  blue200: '#ADE8F4',
  blue100: '#CAF0F8',

  // Semantic Colors
  primary: '#023E8A',
  primaryDark: '#03045E',
  primaryLight: '#0096C7',
  secondary: '#00B4D8',
  accent: '#48CAE4',

  // Status Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#00B4D8',

  // Text Colors
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textOnPrimary: '#FFFFFF',

  // Background Colors
  background: '#FFFFFF',
  softBackground: '#F5F7FA',

  // Gradients (CSS class names or raw strings)
  gradients: {
    primary: 'linear-gradient(to bottom right, #023E8A, #00B4D8, #90E0EF)',
    background: 'linear-gradient(to bottom, #CAF0F8, #FFFFFF)',
    softBackground: 'linear-gradient(to bottom, #F5F7FA, #F8FAFC)',
    darkBackground: 'linear-gradient(to bottom, #03045E, #023E8A)',
  }
} as const;

export default AppColors;
