import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '../../theme';

export default function Screen({
  children,
  style,
  backgroundColor = colors.backgroundSoft,
}) {
  return (
    <View style={[styles.screen, { backgroundColor }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});

export function ScreenContent({ children, style }) {
  return (
    <View style={[screenContentStyles.content, style]}>{children}</View>
  );
}

const screenContentStyles = StyleSheet.create({
  content: {
    padding: layout.screenPadding,
    paddingBottom: spacing.xxxl,
  },
});

export function SectionTitle({ title, highlight, subtitle }) {
  return (
    <View style={sectionStyles.wrap}>
      <Text style={sectionStyles.title}>
        {highlight ? (
          <>
            {title}
            <Text style={sectionStyles.highlight}> {highlight}</Text>
          </>
        ) : (
          title
        )}
      </Text>
      {subtitle ? <Text style={sectionStyles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extrabold,
    color: colors.textDark,
    textTransform: 'capitalize',
  },
  highlight: {
    color: colors.primary,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: typography.lineHeights.normal,
  },
});

export function Card({ children, style, dark = false }) {
  return (
    <View
      style={[
        cardStyles.card,
        dark ? cardStyles.dark : cardStyles.light,
        style,
      ]}>
      {children}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  light: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dark: {
    backgroundColor: colors.surfaceDark,
  },
});
