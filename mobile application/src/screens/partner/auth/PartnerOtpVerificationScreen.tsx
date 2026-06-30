import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthToast, { AuthLoadingOverlay } from '../../../components/auth/AuthToast';
import OtpInput from '../../../components/auth/OtpInput';
import PartnerBrandLogo from '../../../components/partner/PartnerBrandLogo';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { clearSignupPath } from '../../../redux/onboarding/onboardingSlice';
import {
  getApiErrorMessage,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '../../../services/auth/useAuthMutations';
import type {
  PartnerAuthStackParamList,
  PartnerRootStackParamList,
} from '../../../types/partnerNavigation';
import { colors, layout, radius, spacing, typography } from '../../../theme';

type Props = NativeStackScreenProps<PartnerAuthStackParamList, 'PartnerOtpVerification'>;

const RESEND_SECONDS = 60;

export default function PartnerOtpVerificationScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { mobileNumber, devOtp, isExistingUser = false } = route.params;
  const loading = useAppSelector((state) => state.auth.loading);

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [verified, setVerified] = useState(false);

  const verifyOtpMutation = useVerifyOtpMutation();
  const sendOtpMutation = useSendOtpMutation();

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const goToPartnerMain = () => {
    const rootNavigation = navigation.getParent<NativeStackScreenProps<PartnerRootStackParamList>['navigation']>();
    rootNavigation?.reset({
      index: 0,
      routes: [{ name: 'PartnerMain' }],
    });
  };

  const handleVerify = async () => {
    if (verified || loading) {
      return;
    }

    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }

    try {
      await verifyOtpMutation.mutateAsync({ mobileNumber, otp });
      setVerified(true);
      setSuccess(isExistingUser ? 'Login successful' : 'OTP verified');
      dispatch(clearSignupPath());
      goToPartnerMain();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid OTP'));
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await sendOtpMutation.mutateAsync({ mobileNumber });
      setSuccess('OTP resent successfully');
      setSecondsLeft(RESEND_SECONDS);
      setOtp('');
      navigation.setParams({
        devOtp: result.devOtp,
        isExistingUser: result.isExistingUser,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to resend OTP'));
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
            {
              paddingBottom: insets.bottom + spacing.xl,
              paddingHorizontal: layout.screenPadding,
            },
          ]}>
          <PartnerBrandLogo maxWidth={200} />

          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the OTP sent to{' '}
            <Text style={styles.mobile}>+91 {mobileNumber}</Text>
          </Text>

          {__DEV__ && devOtp ? (
            <View style={styles.devOtpBox}>
              <Text style={styles.devOtpLabel}>Dev OTP</Text>
              <Text style={styles.devOtpCode}>{devOtp}</Text>
            </View>
          ) : null}

          <OtpInput value={otp} onChange={setOtp} disabled={loading} />

          <View style={styles.timerRow}>
            {secondsLeft > 0 ? (
              <Text style={styles.timerText}>Resend OTP in {secondsLeft}s</Text>
            ) : (
              <Pressable onPress={() => void handleResend()}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </Pressable>
            )}
          </View>

          <AuthToast message={error} type="error" />
          <AuthToast message={success} type="success" />

          <Pressable
            disabled={otp.length !== 6 || loading || verified}
            onPress={() => void handleVerify()}
            style={({ pressed }) => [
              styles.primaryButton,
              (otp.length !== 6 || loading || verified) && styles.primaryButtonDisabled,
              pressed && otp.length === 6 && !loading && !verified && styles.pressed,
            ]}>
            <Text style={styles.primaryButtonLabel}>
              {verified ? 'Success!' : loading ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          </Pressable>
        </ScrollView>

        <AuthLoadingOverlay visible={loading} label="Verifying OTP..." />
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
    marginBottom: spacing.xl,
    color: colors.grey,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed,
  },
  mobile: {
    color: colors.partnerRed,
    fontWeight: typography.weights.bold,
  },
  devOtpBox: {
    backgroundColor: colors.partnerRedLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  devOtpLabel: {
    color: colors.dark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  devOtpCode: {
    marginTop: spacing.xs,
    color: colors.partnerRed,
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 6,
  },
  timerRow: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  timerText: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
  },
  resendText: {
    color: colors.partnerRed,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
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
  pressed: {
    opacity: 0.9,
  },
});
