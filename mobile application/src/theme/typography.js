export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  sizes: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    hero: 28,
    display: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    tight: 18,
    normal: 22,
    relaxed: 26,
  },
};

export function headingStyle(size = 'xl') {
  return {
    fontSize: typography.sizes[size],
    fontWeight: typography.weights.bold,
    color: '#232323',
  };
}

export function bodyStyle(size = 'md') {
  return {
    fontSize: typography.sizes[size],
    fontWeight: typography.weights.regular,
    color: '#787878',
    lineHeight: typography.lineHeights.normal,
  };
}
