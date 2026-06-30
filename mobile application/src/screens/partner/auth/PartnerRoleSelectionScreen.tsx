import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { images } from '../../../assets';
import PartnerBrandLogo from '../../../components/partner/PartnerBrandLogo';
import PartnerProgressBar from '../../../components/partner/PartnerProgressBar';
import PartnerRoleCard from '../../../components/partner/PartnerRoleCard';
import { useAppDispatch } from '../../../redux/hooks';
import { setSignupPath } from '../../../redux/onboarding/onboardingSlice';
import {
  usePartnerOnboardingStore,
  type PartnerRole,
} from '../../../store/partnerOnboardingStore';
import type { PartnerAuthStackParamList } from '../../../types/partnerNavigation';
import { colors, layout, radius, spacing, typography } from '../../../theme';

type Props = NativeStackScreenProps<PartnerAuthStackParamList, 'PartnerRoleSelection'>;

const ROLE_OPTIONS: Array<{
  role: PartnerRole;
  title: string;
  description: string;
  badge: string;
  illustration: number;
  accentColor: string;
  idleBackground: string;
  idleBorder: string;
}> = [
  {
    role: 'vendor',
    title: 'Vendor',
    description:
      'Manage customer orders, assign drivers, track earnings, manage services and grow your business.',
    badge: 'For business owners and service providers',
    illustration: images.homeHeroTruck,
    accentColor: colors.partnerRed,
    idleBackground: '#FFF5F5',
    idleBorder: '#FECACA',
  },
  {
    role: 'driver',
    title: 'Driver',
    description:
      'Accept delivery assignments, navigate routes, complete services, and earn through RACE Service.',
    badge: 'For tow truck and roadside partners',
    illustration: images.homePopularDriver,
    accentColor: colors.accentOrange,
    idleBackground: colors.partnerOrangeLight,
    idleBorder: '#FCD34D',
  },
];

export default function PartnerRoleSelectionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const setSelectedRole = usePartnerOnboardingStore((state) => state.setSelectedRole);
  const [selectedRole, setLocalRole] = useState<PartnerRole | null>(null);

  const goToLogin = (role?: PartnerRole) => {
    navigation.navigate('PartnerLogin', role ? { role } : undefined);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      return;
    }

    setSelectedRole(selectedRole);
    dispatch(
      setSignupPath({
        accountType: selectedRole,
        vendorType: null,
      }),
    );
    goToLogin(selectedRole);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={[styles.headerBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ArrowLeft size={22} color={colors.dark} strokeWidth={2.5} />
        </Pressable>
      </View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + spacing.xl,
            paddingHorizontal: layout.screenPadding,
          },
        ]}>
        <PartnerBrandLogo maxWidth={200} />

        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>
          Select how you want to partner with RACE Service.
        </Text>

        <View style={styles.progressWrap}>
          <PartnerProgressBar total={4} activeIndex={1} />
        </View>

        {ROLE_OPTIONS.map((option) => (
          <PartnerRoleCard
            key={option.role}
            role={option.role}
            title={option.title}
            description={option.description}
            badge={option.badge}
            illustration={option.illustration}
            accentColor={option.accentColor}
            idleBackground={option.idleBackground}
            idleBorder={option.idleBorder}
            selected={selectedRole === option.role}
            onPress={() => setLocalRole(option.role)}
          />
        ))}

        <View style={styles.infoCard}>
          <Info size={20} color={colors.partnerRed} strokeWidth={2.2} />
          <Text style={styles.infoText}>
            Your account will be verified by the Admin after registration and document
            submission before you can start using the Partner App.
          </Text>
        </View>

        <Pressable
          disabled={!selectedRole}
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.continueButton,
            !selectedRole && styles.continueButtonDisabled,
            pressed && selectedRole && styles.pressed,
          ]}>
          <Text
            style={[
              styles.continueLabel,
              !selectedRole && styles.continueLabelDisabled,
            ]}>
            Continue
          </Text>
        </Pressable>

        <Pressable
          onPress={() => goToLogin()}
          style={({ pressed }) => [styles.footerLink, pressed && styles.pressed]}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.footerLinkText}>Login</Text>
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
  headerBar: {
    paddingHorizontal: layout.screenPadding,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: spacing.sm,
  },
  title: {
    marginTop: spacing.lg,
    color: colors.dark,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.grey,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed,
  },
  progressWrap: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.lightGrey,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoText: {
    flex: 1,
    color: colors.dark,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.relaxed,
  },
  continueButton: {
    minHeight: 52,
    borderRadius: radius.button,
    backgroundColor: colors.partnerRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.border,
  },
  continueLabel: {
    color: colors.background,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  continueLabelDisabled: {
    color: colors.grey,
  },
  footerLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  footerText: {
    color: colors.dark,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  footerLinkText: {
    color: colors.partnerRed,
    fontWeight: typography.weights.bold,
  },
  pressed: {
    opacity: 0.9,
  },
});
