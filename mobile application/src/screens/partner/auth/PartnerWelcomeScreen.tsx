import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { images } from '../../../assets';
import PartnerBrandLogo from '../../../components/partner/PartnerBrandLogo';
import PartnerWelcomeTrustCard from '../../../components/partner/PartnerWelcomeTrustCard';
import type { PartnerAuthStackParamList } from '../../../types/partnerNavigation';
import { colors, layout, radius, spacing, typography } from '../../../theme';

type Props = NativeStackScreenProps<PartnerAuthStackParamList, 'PartnerWelcome'>;

const REF_W = 390;
const PARTNER_RED = '#C41E1E';

export default function PartnerWelcomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = width / REF_W;
  const px = (value: number) => Math.round(value * scale);

  const goToRoleSelection = () => navigation.navigate('PartnerRoleSelection');
  const goToLogin = () => navigation.navigate('PartnerLogin');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + px(spacing.md),
            paddingBottom: insets.bottom + px(spacing.lg),
            paddingHorizontal: px(layout.screenPadding),
          },
        ]}>
        <View style={styles.logoSection}>
          <PartnerBrandLogo maxWidth={px(248)} />
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.titleLead, { fontSize: px(18) }]}>Welcome to</Text>
          <Text style={[styles.titleAccent, { fontSize: px(32), lineHeight: px(40), marginTop: px(2) }]}>
            RACE Service
          </Text>
          <View style={[styles.accentLine, { width: px(48), marginTop: px(10) }]} />
          <Text style={[styles.subtitle, { fontSize: px(14), lineHeight: px(21), marginTop: px(12) }]}>
            Your trusted partner for managing your business and deliveries seamlessly.
          </Text>
        </View>

        <View style={[styles.illustrationWrap, { marginTop: px(spacing.md) }]}>
          <Image
            source={images.partnerWelcomeIllustration}
            style={[styles.illustration, { height: px(220) }]}
            resizeMode="contain"
            accessibilityLabel="RACE partner and customer service illustration"
          />
        </View>

        <View style={{ marginTop: px(spacing.lg) }}>
          <PartnerWelcomeTrustCard />
        </View>

        <View style={[styles.actions, { marginTop: px(spacing.xl), gap: px(12) }]}>
          <Pressable
            onPress={goToRoleSelection}
            style={({ pressed }) => [
              styles.primaryButton,
              { borderRadius: px(10), minHeight: px(52) },
              pressed && styles.buttonPressed,
            ]}>
            <Text style={[styles.primaryButtonLabel, { fontSize: px(17) }]}>Get Started</Text>
          </Pressable>

          <Pressable
            onPress={goToLogin}
            style={({ pressed }) => [
              styles.outlineButton,
              { borderRadius: px(10), minHeight: px(52) },
              pressed && styles.buttonPressed,
            ]}>
            <Text style={[styles.outlineButtonLabel, { fontSize: px(17) }]}>Login</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={goToRoleSelection}
          style={({ pressed }) => [styles.footerLink, pressed && styles.buttonPressed]}>
          <Text style={[styles.footerText, { fontSize: px(14) }]}>
            New here?{' '}
            <Text style={styles.footerLinkText}>Create an account ›</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoSection: {
    alignItems: 'center',
    width: '100%',
  },
  titleSection: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  titleLead: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  titleAccent: {
    color: PARTNER_RED,
    fontWeight: typography.weights.extrabold,
    textAlign: 'center',
  },
  accentLine: {
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  subtitle: {
    color: colors.grey,
    fontWeight: typography.weights.regular,
    textAlign: 'center',
    maxWidth: 300,
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  illustration: {
    width: '100%',
  },
  actions: {},
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PARTNER_RED,
    borderWidth: 1,
    borderColor: PARTNER_RED,
  },
  primaryButtonLabel: {
    color: colors.background,
    fontWeight: typography.weights.bold,
  },
  outlineButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: PARTNER_RED,
  },
  outlineButtonLabel: {
    color: PARTNER_RED,
    fontWeight: typography.weights.bold,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  footerLink: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  footerText: {
    color: colors.dark,
    textAlign: 'center',
  },
  footerLinkText: {
    color: PARTNER_RED,
    fontWeight: typography.weights.bold,
  },
});
