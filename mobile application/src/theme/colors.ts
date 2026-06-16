import sharedColors from '../data/colors.json';
import type { CategoryId, CategoryTheme } from '../types/models';

const categoryThemes: Record<CategoryId, CategoryTheme> = {
  towing: {
    background: '#FFF8E1',
    accent: sharedColors.primary,
    iconBackground: sharedColors.surfaceDark,
  },
  driver: {
    background: '#E6FAFC',
    accent: sharedColors.secondary,
    iconBackground: '#004E72',
  },
  roadside: {
    background: '#FFF4E5',
    accent: sharedColors.accentOrange,
    iconBackground: sharedColors.surfaceDark,
  },
  future: {
    background: sharedColors.backgroundSoft,
    accent: sharedColors.text,
    iconBackground: sharedColors.surfaceDarker,
  },
};

export const colors = {
  ...sharedColors,
  surface: sharedColors.background,
  card: sharedColors.surfaceCard ?? '#1A1A1A',
  textInverse: '#FFFFFF',
  subtext: sharedColors.textMuted,
  borderLight: 'rgba(255, 255, 255, 0.08)',
  success: '#16A34A',
  warning: sharedColors.secondary,
  error: sharedColors.accentRed,
  overlay: 'rgba(11, 11, 11, 0.92)',
  shadow: 'rgba(0, 0, 0, 0.35)',
  glass: {
    background: sharedColors.glassBackground ?? 'rgba(26, 26, 26, 0.85)',
    border: sharedColors.glassBorder ?? 'rgba(255, 255, 255, 0.12)',
  },
  categories: categoryThemes,
};

export function getCategoryTheme(categoryId: string): CategoryTheme {
  return (
    colors.categories[categoryId as CategoryId] ?? colors.categories.future
  );
}
