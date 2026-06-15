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
  textInverse: '#FFFFFF',
  borderLight: 'rgba(0, 0, 0, 0.06)',
  success: '#0EA012',
  warning: sharedColors.primary,
  error: sharedColors.accentRed,
  overlay: 'rgba(35, 35, 35, 0.92)',
  shadow: 'rgba(0, 0, 0, 0.12)',
  categories: categoryThemes,
};

export function getCategoryTheme(categoryId: string): CategoryTheme {
  return (
    colors.categories[categoryId as CategoryId] ?? colors.categories.future
  );
}
