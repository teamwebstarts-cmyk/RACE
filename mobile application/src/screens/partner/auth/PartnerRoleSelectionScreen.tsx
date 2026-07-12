import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Info } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { images } from '../../../assets';
import PartnerProgressBar from '../../../components/partner/PartnerProgressBar';
import PartnerRoleCard from '../../../components/partner/PartnerRoleCard';
import PartnerScreenLayout from '../../../components/partner/PartnerScreenLayout';
import { useAppDispatch } from '../../../redux/hooks';
import { setSignupPath } from '../../../redux/onboarding/onboardingSlice';
import {
  usePartnerOnboardingStore,
  type PartnerRole,
} from '../../../store/partnerOnboardingStore';
import { PARTNER_WAITING_ADMIN_APPROVAL } from '../../../constants/partnerCopy';
import type { PartnerAuthStackParamList } from '../../../types/partnerNavigation';
import { colors, radius, spacing, typography } from '../../../theme';

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
    accentColor: colors.primary,
    idleBackground: colors.goldLight,
    idleBorder: '#F5D98A',
  },
  {
    role: 'driver',
    title: 'Driver',
    description:
      'Accept delivery assignments, navigate routes, complete services, and earn through RACE Service.',
    badge: 'For tow truck and roadside partners',
    illustration: images.homePopularDriver,
    accentColor: colors.primaryDark,
    idleBackground: colors.goldLight,
    idleBorder: '#F5D98A',
  },
];

export default function PartnerRoleSelectionScreen({ navigation }: Props) {
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
    <PartnerScreenLayout
      title="Choose Your Role"
      subtitle="Select how you want to partner with RACE Service."
      onBack={() => navigation.goBack()}
      keyboardAvoiding={false}
      headerExtra={<PartnerProgressBar total={4} activeIndex={1} />}
      footer={
        <Pressable
          disabled={!selectedRole}
          onPress={() => {
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
          }}
          style={({ pressed }) => [
            styles.footerLink,
            !selectedRole && styles.footerLinkDisabled,
            pressed && selectedRole && styles.pressed,
          ]}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.footerLinkText}>Login</Text>
          </Text>
        </Pressable>
      }>
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
        <Info size={20} color={colors.primary} strokeWidth={2.2} />
        <Text style={styles.infoText}>{PARTNER_WAITING_ADMIN_APPROVAL}</Text>
      </View>

      <Pressable
        disabled={!selectedRole}
        onPress={handleContinue}
        style={({ pressed }) => [
          styles.continueButton,
          !selectedRole && styles.continueButtonDisabled,
          pressed && selectedRole && styles.pressed,
        ]}>
        <Text style={[styles.continueLabel, !selectedRole && styles.continueLabelDisabled]}>
          Continue
        </Text>
      </Pressable>
    </PartnerScreenLayout>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.lightGrey,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.border,
  },
  continueLabel: {
    color: colors.dark,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  continueLabelDisabled: {
    color: colors.grey,
  },
  footerLink: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  footerLinkDisabled: {
    opacity: 0.45,
  },
  footerText: {
    color: colors.dark,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  footerLinkText: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  pressed: {
    opacity: 0.9,
  },
});
