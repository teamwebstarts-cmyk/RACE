import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

import type { BookingTheme } from './bookingTheme';
import { colors, typography } from '../../theme';

interface BookingFlowHeaderProps {
  title: string;
  step: number;
  onBack?: () => void;
  theme: BookingTheme;
  variant?: 'centered' | 'inline';
  accentColor?: string;
  showStep?: boolean;
}

export default function BookingFlowHeader({
  title,
  step,
  onBack,
  theme: t,
  variant = 'centered',
  accentColor = colors.primary,
  showStep = true,
}: BookingFlowHeaderProps) {
  if (variant === 'inline') {
    return (
      <View style={[styles.wrap, { marginBottom: t.headerBottom }]}>
        <View style={styles.row}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={12} style={styles.side}>
              <ArrowLeft size={t.iconMd} color={colors.dark} strokeWidth={2.5} />
            </Pressable>
          ) : (
            <View style={styles.side} />
          )}
          <Text style={[styles.inlineTitle, { fontSize: t.screenTitle }]} numberOfLines={2}>
            {title}
          </Text>
          <View
            style={[
              styles.badge,
              {
                width: t.stepCircle,
                height: t.stepCircle,
                borderRadius: t.stepCircle / 2,
                backgroundColor: accentColor,
              },
            ]}>
            <Text style={[styles.badgeTextDark, { fontSize: t.stepNumber }]}>{step}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.centeredWrap, { marginBottom: t.headerBottom, paddingTop: t.px(4) }]}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={styles.backFloating}>
          <ArrowLeft size={t.iconMd} color={colors.dark} strokeWidth={2.5} />
        </Pressable>
      ) : null}
      {showStep ? (
        <View
          style={[
            styles.stepCircle,
            {
              width: t.stepCircle,
              height: t.stepCircle,
              borderRadius: t.stepCircle / 2,
              marginBottom: t.px(12),
              backgroundColor: accentColor,
            },
          ]}>
          <Text style={[styles.stepNumber, { fontSize: t.stepNumber }]}>{step}</Text>
        </View>
      ) : null}
      <Text style={[styles.centeredTitle, { fontSize: t.screenTitle }]}>{title}</Text>
    </View>
  );
}

interface BookingScreenShellProps {
  title: string;
  step: number;
  onBack?: () => void;
  theme: BookingTheme;
  children: ReactNode;
  footer?: ReactNode;
  headerVariant?: 'centered' | 'inline';
  accentColor?: string;
  showStep?: boolean;
}

export function BookingScreenShell({
  title,
  step,
  onBack,
  theme,
  children,
  footer,
  headerVariant = 'centered',
  accentColor,
  showStep = true,
}: BookingScreenShellProps) {
  return (
    <View style={styles.shell}>
      <BookingFlowHeader
        title={title}
        step={step}
        onBack={onBack}
        theme={theme}
        variant={headerVariant}
        accentColor={accentColor}
        showStep={showStep}
      />
      <View style={[styles.body, { paddingTop: theme.contentTop }]}>{children}</View>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  centeredWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  backFloating: {
    position: 'absolute',
    zIndex: 2,
    left: 0,
    top: 4,
    padding: 4,
  },
  stepCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  centeredTitle: {
    fontWeight: typography.weights.extrabold,
    color: colors.dark,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: {
    width: 32,
    alignItems: 'flex-start',
  },
  inlineTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: typography.weights.extrabold,
    color: colors.dark,
    paddingHorizontal: 8,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTextDark: {
    fontWeight: typography.weights.bold,
    color: colors.dark,
  },
  shell: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
});
