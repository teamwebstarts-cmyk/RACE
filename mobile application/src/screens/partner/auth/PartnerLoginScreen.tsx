import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArrowLeft, ChevronDown, Shield } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthToast, { AuthLoadingOverlay } from '../../../components/auth/AuthToast';
import GoogleIcon from '../../../components/auth/GoogleIcon';
import PartnerBrandLogo from '../../../components/partner/PartnerBrandLogo';
import { useAppSelector } from '../../../redux/hooks';
import {
  getApiErrorMessage,
  useSendOtpMutation,
} from '../../../services/auth/useAuthMutations';
import { usePartnerOnboardingStore } from '../../../store/partnerOnboardingStore';
import type { PartnerAuthStackParamList } from '../../../types/partnerNavigation';
import { colors, layout, radius, spacing, typography } from '../../../theme';

type Props = NativeStackScreenProps<PartnerAuthStackParamList, 'PartnerLogin'>;

const MOBILE_REGEX = /^[6-9]\d{9}$/;

export default function PartnerLoginScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
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
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.md, paddingHorizontal: layout.screenPadding },
          ]}>
          <PartnerBrandLogo maxWidth={200} />

          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Enter your mobile number to continue</Text>
          {roleLabel ? <Text style={styles.roleHint}>Continuing as {roleLabel}</Text> : null}

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
            <Shield size={16} color={colors.partnerRed} strokeWidth={2.2} />
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

          <Text style={styles.legalText}>
            By continuing, you agree to our{' '}
            <Text style={styles.legalLink}>Terms & Conditions</Text> and{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>

        <AuthLoadingOverlay visible={loading} label="Sending OTP..." />
      </KeyboardAvoidingView>
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
    flexGrow: 1,
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
  roleHint: {
    marginTop: spacing.sm,
    color: colors.partnerRed,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  phoneField: {
    marginTop: spacing.xl,
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
    backgroundColor: colors.partnerRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonLabel: {
    color: colors.background,
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
    marginTop: spacing.xl,
    color: colors.grey,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed,
  },
  legalLink: {
    color: colors.partnerRed,
    fontWeight: typography.weights.semibold,
  },
  pressed: {
    opacity: 0.9,
  },
});
