import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GoldButton from '../auth/GoldButton';
import { BookingScreenShell } from './BookingFlowHeader';
import { BOOKING_REF_W, createBookingTheme } from './bookingTheme';
import { colors, typography } from '../../theme';

interface TowingBookingLayoutProps {
  title: string;
  step: number;
  onBack?: () => void;
  children: ReactNode;
  buttonLabel?: string;
  onContinue?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryVariant?: 'outline' | 'dark-outline';
  footerNote?: ReactNode;
  footerNoteBelow?: ReactNode;
  scrollable?: boolean;
  hideFooter?: boolean;
  headerVariant?: 'centered' | 'inline';
  accentColor?: string;
}

export default function TowingBookingLayout({
  title,
  step,
  onBack,
  children,
  buttonLabel = 'Continue',
  onContinue,
  secondaryLabel,
  onSecondary,
  secondaryVariant = 'outline',
  footerNote,
  footerNoteBelow,
  scrollable = false,
  hideFooter = false,
  headerVariant = 'centered',
  accentColor = colors.primary,
}: TowingBookingLayoutProps) {
  const { width } = useWindowDimensions();
  const s = width / BOOKING_REF_W;
  const t = createBookingTheme(s);

  const footer = hideFooter ? null : (
    <View
      style={{
        gap: t.px(10),
        paddingTop: t.footerTop,
        paddingBottom: t.footerBottom,
      }}>
      {footerNote}
      {onContinue ? (
        accentColor === colors.primary ? (
          <GoldButton
            label={buttonLabel}
            onPress={onContinue}
            height={t.buttonHeight}
            borderRadius={t.cardRadius}
            labelSize={t.buttonLabel}
          />
        ) : (
          <Pressable
            onPress={onContinue}
            style={{
              minHeight: t.buttonHeight,
              borderRadius: t.cardRadius,
              backgroundColor: accentColor,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: t.px(20),
            }}>
            <Text
              style={{
                fontSize: t.buttonLabel,
                fontWeight: typography.weights.bold,
                color: colors.dark,
              }}>
              {buttonLabel}
            </Text>
          </Pressable>
        )
      ) : null}
      {secondaryLabel && onSecondary ? (
        <GoldButton
          label={secondaryLabel}
          onPress={onSecondary}
          variant={secondaryVariant}
          height={t.buttonHeight}
          borderRadius={t.cardRadius}
          labelSize={t.buttonLabel}
        />
      ) : null}
      {footerNoteBelow}
    </View>
  );

  const body = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: t.px(8) }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.flex}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.flex,
            { paddingHorizontal: t.px(24), paddingBottom: t.px(4) },
          ]}>
          <BookingScreenShell
            title={title}
            step={step}
            onBack={onBack}
            theme={t}
            footer={footer}
            headerVariant={headerVariant}
            accentColor={accentColor}>
            {body}
          </BookingScreenShell>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function useBookingTheme() {
  const { width, height } = useWindowDimensions();
  const s = width / BOOKING_REF_W;
  const t = createBookingTheme(s);
  return { t, width, height, s, px: t.px };
}

/** @deprecated use useBookingTheme */
export function useTowingPx() {
  const { t, width, height, s } = useBookingTheme();
  return { s, width, height, px: t.px };
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
});
