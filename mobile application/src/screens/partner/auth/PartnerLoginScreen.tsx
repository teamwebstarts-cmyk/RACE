import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronDown, Shield } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthToast, { AuthLoadingOverlay } from '../../../components/auth/AuthToast';
import GoogleIcon from '../../../components/auth/GoogleIcon';
import PartnerScreenLayout from '../../../components/partner/PartnerScreenLayout';
import { useAppSelector } from '../../../redux/hooks';
import {
  getApiErrorMessage,
  useSendOtpMutation,
} from '../../../services/auth/useAuthMutations';
import { usePartnerOnboardingStore } from '../../../store/partnerOnboardingStore';
import type { PartnerAuthStackParamList } from '../../../types/partnerNavigation';
import { colors, radius, spacing, typography } from '../../../theme';

type Props = NativeStackScreenProps<PartnerAuthStackParamList, 'PartnerLogin'>;

const MOBILE_REGEX = /^[6-9]\d{9}$/;

export default function PartnerLoginScreen({ navigation, route }: Props) {
  const loading = useAppSelector((state) => state.auth.loading);
  const signupAccountType = useAppSelector((state) => state.onboarding.signupAccountType);
  const setSelectedRole = usePartnerOnboardingStore((state) => state.setSelectedRole);

  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');

  const sendOtpMutation = useSendOtpMutation();
  const isValid = useMemo(() => MOBILE_REGEX.test(mobileNumber), [mobileNumber]);

  useEffect(() => {
    if (route.params?.role) {
      setSelectedRole(route.params.role);
    }
  }, [route.params?.role, setSelectedRole]);

  const roleLabel =
    signupAccountType === 'vendor'
      ? 'Vendor'
      : signupAccountType === 'driver'
        ? 'Driver'
        : null;

  const handleSendOtp = async () => {
    setError('');

    if (!isValid) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }

    try {
      const result = await sendOtpMutation.mutateAsync({ mobileNumber });
      navigation.navigate('PartnerOtpVerification', {
        mobileNumber,
        devOtp: result.devOtp,
        isExistingUser: result.isExistingUser ?? false,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to send OTP'));
    }
  };

  return (
    <>
      <PartnerScreenLayout
        title="Login"
        subtitle="Enter your mobile number to continue"
        onBack={() => navigation.goBack()}
        headerExtra={
          roleLabel ? <Text style={styles.roleHint}>Continuing as {roleLabel}</Text> : null
        }
        footer={
          <Text style={styles.legalText}>
            By continuing, you agree to our{' '}
            <Text style={styles.legalLink}>Terms & Conditions</Text> and{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        }>
        <View style={styles.phoneField}>
          <View style={styles.countryPicker}>
            <Text style={styles.flag}>🇮🇳</Text>
            <Text style={styles.countryCode}>+91</Text>
            <ChevronDown size={16} color={colors.grey} strokeWidth={2.5} />
          </View>
          <View style={styles.phoneDivider} />
          <TextInput
            value={mobileNumber}
            onChangeText={(text) => {
              setMobileNumber(text.replace(/\D/g, '').slice(0, 10));
              if (error) setError('');
            }}
            keyboardType="number-pad"
            placeholder="Enter mobile number"
            placeholderTextColor={colors.grey}
            maxLength={10}
            style={styles.phoneInput}
          />
        </View>

        <View style={styles.otpNotice}>
          <Shield size={16} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.otpNoticeText}>
            We'll send you a One Time Password (OTP) to verify your number
          </Text>
        </View>

        <AuthToast message={error} type="error" />

        <Pressable
          disabled={!isValid || loading}
          onPress={() => void handleSendOtp()}
          style={({ pressed }) => [
            styles.primaryButton,
            (!isValid || loading) && styles.primaryButtonDisabled,
            pressed && isValid && !loading && styles.pressed,
          ]}>
          <Text style={styles.primaryButtonLabel}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
          onPress={() => Alert.alert('Google Sign-In', 'Google sign-in coming soon')}>
          <GoogleIcon size={22} />
          <Text style={styles.googleButtonLabel}>Continue with Google</Text>
        </Pressable>
      </PartnerScreenLayout>

      <AuthLoadingOverlay visible={loading} label="Sending OTP..." />
    </>
  );
}

const styles = StyleSheet.create({
  roleHint: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  phoneField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  flag: {
    fontSize: 18,
  },
  countryCode: {
    color: colors.dark,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  phoneDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginRight: spacing.md,
  },
  phoneInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.dark,
    paddingVertical: spacing.md,
  },
  otpNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  otpNoticeText: {
    flex: 1,
    color: colors.grey,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.normal,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonLabel: {
    color: colors.dark,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  googleButton: {
    minHeight: 52,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  googleButtonLabel: {
    color: colors.dark,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  legalText: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed,
  },
  legalLink: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  pressed: {
    opacity: 0.9,
  },
});
