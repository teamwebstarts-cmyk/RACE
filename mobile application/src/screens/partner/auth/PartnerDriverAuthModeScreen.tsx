import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CircleUser,
  KeyRound,
  Smartphone,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAppDispatch } from '../../../redux/hooks';
import { setSignupPath } from '../../../redux/onboarding/onboardingSlice';
import { usePartnerOnboardingStore } from '../../../store/partnerOnboardingStore';
import type { PartnerAuthStackParamList } from '../../../types/partnerNavigation';
import { colors, layout, radius, shadows, spacing, typography } from '../../../theme';

type Props = NativeStackScreenProps<PartnerAuthStackParamList, 'PartnerDriverAuthMode'>;

type DriverAuthMode = 'self' | 'vendor';

const REF_W = 390;
const PAGE_BG = '#F7F7F5';

const OPTIONS = [
  {
    mode: 'self' as const,
    title: 'Self driver',
    description: 'Independent drivers sign in with mobile number and OTP.',
    Icon: CircleUser,
    features: [
      { label: 'OTP login', Icon: Smartphone },
      { label: 'Own account', Icon: CircleUser },
    ],
  },
  {
    mode: 'vendor' as const,
    title: 'Vendor driver',
    description: 'Drivers added by a vendor sign in with Login ID and password.',
    Icon: Building2,
    features: [
      { label: 'Login ID', Icon: KeyRound },
      { label: 'Assigned by vendor', Icon: Building2 },
    ],
  },
];

export default function PartnerDriverAuthModeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = width / REF_W;
  const px = (value: number) => Math.max(1, Math.round(value * scale));
  const setSelectedRole = usePartnerOnboardingStore(state => state.setSelectedRole);

  const [mode, setMode] = useState<DriverAuthMode>('self');

  const handleContinue = () => {
    setSelectedRole('driver');
    dispatch(setSignupPath({ accountType: 'driver', vendorType: null }));

    if (mode === 'vendor') {
      navigation.navigate('PartnerVendorDriverLogin');
      return;
    }
    navigation.navigate('PartnerLogin', { role: 'driver' });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />

      <View style={[styles.topBar, { paddingHorizontal: px(layout.screenPadding) }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <ArrowLeft size={22} color={colors.dark} strokeWidth={2.5} />
        </Pressable>
        <View style={styles.brandBlock}>
          <Text style={[styles.brandRace, { fontSize: px(18) }]}>RACE</Text>
          <Text style={[styles.brandPartner, { fontSize: px(11) }]}>PARTNER</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: px(layout.screenPadding),
          paddingBottom: insets.bottom + px(spacing.xl),
        }}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { fontSize: px(26), lineHeight: px(32) }]}>
          How do you drive?
        </Text>
        <Text style={[styles.subtitle, { fontSize: px(14), lineHeight: px(21) }]}>
          Choose self driver for OTP login, or vendor driver if your company gave you a Login ID.
        </Text>

        <View style={{ marginTop: px(spacing.xl), gap: px(12) }}>
          {OPTIONS.map(option => {
            const selected = mode === option.mode;
            return (
              <Pressable
                key={option.mode}
                onPress={() => setMode(option.mode)}
                style={({ pressed }) => [
                  styles.card,
                  shadows.card,
                  selected && styles.cardSelected,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
                    <option.Icon
                      size={22}
                      color={selected ? colors.dark : colors.primary}
                      strokeWidth={2.2}
                    />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{option.title}</Text>
                    <Text style={styles.cardDescription}>{option.description}</Text>
                  </View>
                </View>
                <View style={styles.featureRow}>
                  {option.features.map(feature => (
                    <View key={feature.label} style={styles.featureChip}>
                      <feature.Icon size={14} color={colors.primaryDark} strokeWidth={2.2} />
                      <Text style={styles.featureLabel}>{feature.label}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.continueBtn,
            { minHeight: px(54), marginTop: px(spacing.xxl) },
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.continueLabel, { fontSize: px(16) }]}>Continue</Text>
          <ArrowRight size={18} color={colors.dark} strokeWidth={2.4} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBlock: { alignItems: 'center' },
  brandRace: {
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 0.5,
  },
  brandPartner: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.6,
  },
  title: {
    marginTop: spacing.md,
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.grey,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.goldLight,
  },
  cardHeader: { flexDirection: 'row', gap: spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: {
    backgroundColor: colors.primary,
  },
  cardText: { flex: 1 },
  cardTitle: {
    color: colors.dark,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  cardDescription: {
    marginTop: 4,
    color: colors.grey,
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  featureLabel: {
    color: colors.dark,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.button,
  },
  continueLabel: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  pressed: { opacity: 0.9 },
});
