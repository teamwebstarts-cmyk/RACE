export const colors = {
  primary: '#F5A800',
  primaryDark: '#D99400',
  background: '#FFFFFF',
  dark: '#1A1A1A',
  grey: '#666666',
  lightGrey: '#F5F5F5',
  border: '#E8E8E8',
  success: '#22C55E',
  error: '#EF4444',
  cardBg: '#FFFFFF',
  goldLight: '#FFF8E7',
  textMuted: '#999999',
  secondary: '#00BAC6',
  accentOrange: '#F4A115',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const categoryThemes = {
  towing: { background: '#FFF8E7', accent: '#F5A800', iconBackground: '#1A1A1A' },
  driver: { background: '#E6FAFC', accent: '#00BAC6', iconBackground: '#004E72' },
  roadside: { background: '#FFF4E5', accent: '#F4A115', iconBackground: '#1A1A1A' },
  future: { background: '#F5F5F5', accent: '#666666', iconBackground: '#333333' },
} as const;
