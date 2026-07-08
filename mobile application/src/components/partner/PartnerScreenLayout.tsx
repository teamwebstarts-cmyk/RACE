import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, spacing, typography } from '../../theme';

const HEADER_SIDE = 44;

interface PartnerScreenLayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  headerExtra?: ReactNode;
  footer?: ReactNode;
  bottomBar?: ReactNode;
  children: ReactNode;
  keyboardAvoiding?: boolean;
  scrollContentStyle?: StyleProp<ViewStyle>;
  showBackButton?: boolean;
  /** Extra top spacing inside the scroll area (default: comfortable offset below header). */
  contentTopSpacing?: number;
}

export default function PartnerScreenLayout({
  title,
  subtitle,
  onBack,
  headerExtra,
  footer,
  bottomBar,
  children,
  keyboardAvoiding = true,
  scrollContentStyle,
  showBackButton = true,
  contentTopSpacing = spacing.xxxl,
}: PartnerScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  const body = (
    <>
      <View
        style={[
          styles.stickyHeader,
          {
            paddingTop: insets.top + spacing.xs,
            paddingHorizontal: layout.screenPadding,
          },
        ]}>
        <View style={styles.headerRow}>
          {showBackButton && onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              style={({ pressed }) => [styles.sideSlot, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <ArrowLeft size={24} color={colors.dark} strokeWidth={2.5} />
            </Pressable>
          ) : (
            <View style={styles.sideSlot} />
          )}

          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={3}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={styles.sideSlot} />
        </View>

        {headerExtra ? <View style={styles.headerExtra}>{headerExtra}</View> : null}
      </View>

      <ScrollView
        style={styles.scroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: layout.screenPadding,
            paddingTop: contentTopSpacing,
            paddingBottom: footer || bottomBar ? spacing.lg : insets.bottom + spacing.xl,
          },
          scrollContentStyle,
        ]}>
        {children}
      </ScrollView>

      {footer ? (
        <View
          style={[
            styles.footer,
            {
              paddingBottom: bottomBar ? spacing.sm : insets.bottom + spacing.md,
              paddingHorizontal: layout.screenPadding,
            },
          ]}>
          {footer}
        </View>
      ) : null}

      {bottomBar ? (
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: insets.bottom + spacing.md,
              paddingHorizontal: layout.screenPadding,
            },
          ]}>
          {bottomBar}
        </View>
      ) : null}
    </>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>{body}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sideSlot: {
    width: HEADER_SIDE,
    height: HEADER_SIDE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: HEADER_SIDE / 2,
    backgroundColor: colors.lightGrey,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: HEADER_SIDE,
    paddingHorizontal: spacing.xs,
  },
  title: {
    color: colors.dark,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extrabold,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.grey,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal,
  },
  headerExtra: {
    marginTop: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  footer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  bottomBar: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
