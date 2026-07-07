import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthToast, { AuthLoadingOverlay } from '../../components/auth/AuthToast';
import OtpInput from '../../components/auth/OtpInput';
import BrandLogo from '../../components/ui/BrandLogo';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearSignupPath } from '../../redux/onboarding/onboardingSlice';
import {
  getApiErrorMessage,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '../../services/auth/useAuthMutations';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

const RESEND_SECONDS = 60;

export default function OtpVerificationScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const { mobileNumber, isExistingUser = false } = route.params;
  const loading = useAppSelector((state) => state.auth.loading);
  const partnerSignupRequired = useAppSelector((state) => state.onboarding.partnerSignupRequired);
  const signupVendorType = useAppSelector((state) => state.onboarding.signupVendorType);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [verified, setVerified] = useState(false);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const otpDigits = Array.from({ length: 6 }, (_, i) => otp[i] ?? '');
  const px = (n: number) => n;

  const verifyOtpMutation = useVerifyOtpMutation();
  const sendOtpMutation = useSendOtpMutation();

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

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
      const result = await verifyOtpMutation.mutateAsync({ mobileNumber, otp });
      setVerified(true);
      setSuccess(isExistingUser ? 'Login successful' : 'OTP verified');

      if (isExistingUser || result.user.isProfileCompleted) {
        dispatch(clearSignupPath());
      }
      if (result.onboardingRequired && !result.user.isProfileCompleted) {
        navigation.replace('ProfileWizard');
        return;
      }
      if (partnerSignupRequired && signupVendorType && result.user.isProfileCompleted) {
        navigation.replace('VendorWizard', { vendorType: signupVendorType });
        return;
      }
      // Returning users: RootNavigator switches to Main/Partner when isAuthenticated updates
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
      if (result.isExistingUser !== undefined) {
        navigation.setParams({ isExistingUser: result.isExistingUser });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to resend OTP'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <View style={styles.header}>
            <BrandLogo size="medium" />
            <Text style={styles.title}>{isExistingUser ? 'Welcome Back' : 'Verify OTP'}</Text>
            <Text style={styles.subtitle}>
              {isExistingUser
                ? `Enter the OTP sent to +91 ${mobileNumber} to login.`
                : `Enter the OTP sent to +91 ${mobileNumber} to create your account.`}
            </Text>
          </View>

          <View style={styles.card}>
            <OtpInput
              digits={otpDigits}
              activeIndex={activeOtpIndex}
              onActiveIndexChange={setActiveOtpIndex}
              onChange={(digits) => setOtp(digits.join(''))}
              px={px}
            />

            <View style={styles.timerRow}>
              {secondsLeft > 0 ? (
                <Text style={styles.timerText}>Resend OTP in {secondsLeft}s</Text>
              ) : (
                <Pressable onPress={handleResend}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </Pressable>
              )}
            </View>

            <AuthToast message={error} type="error" />
            <AuthToast message={success} type="success" />

            <PrimaryButton
              label={
                verified
                  ? 'Success!'
                  : loading
                    ? 'Verifying...'
                    : isExistingUser
                      ? 'Login'
                      : 'Verify & Sign Up'
              }
              onPress={handleVerify}
              disabled={otp.length !== 6 || loading || verified}
            />
          </View>
        </ScrollView>
        <AuthLoadingOverlay visible={loading} label="Verifying OTP..." />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceDarker,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  backText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    marginTop: spacing.md,
    color: colors.textLight,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  mobile: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 195, 38, 0.25)',
    gap: spacing.lg,
  },
  timerRow: {
    alignItems: 'center',
  },
  timerText: {
    color: colors.text,
    fontSize: typography.sizes.sm,
  },
  resendText: {
    color: colors.accentRed,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
