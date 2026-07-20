import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { ArrowLeft, Info, Pencil, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthToast, { AuthLoadingOverlay } from '../../components/auth/AuthToast';
import OtpInput from '../../components/auth/OtpInput';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearSignupPath } from '../../redux/onboarding/onboardingSlice';
import {
  getApiErrorMessage,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '../../services/auth/useAuthMutations';
import { getRoleMismatchMessage, isRoleMismatchError } from '../../utils/roleMismatch';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, layout, radius, shadows, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

const RESEND_SECONDS = 60;
const REF_W = 390;

function formatPhone(mobileNumber: string): string {
  const digits = mobileNumber.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return `+91 ${digits}`;
}

function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export default function OtpVerificationScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const { mobileNumber, isExistingUser = false } = route.params;
  const loading = useAppSelector(state => state.auth.loading);
  const partnerSignupRequired = useAppSelector(state => state.onboarding.partnerSignupRequired);
  const signupVendorType = useAppSelector(state => state.onboarding.signupVendorType);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = width / REF_W;
  const px = (n: number) => Math.max(1, Math.round(n * scale));

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [verified, setVerified] = useState(false);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const verifyLockRef = useRef(false);

  const otpDigits = Array.from({ length: 6 }, (_, i) => otp[i] ?? '');
  const verifyOtpMutation = useVerifyOtpMutation();
  const sendOtpMutation = useSendOtpMutation();

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleVerify = useCallback(
    async (codeOverride?: string) => {
      const code = (codeOverride ?? otp).replace(/\D/g, '').slice(0, 6);
      if (verified || loading || verifyLockRef.current || code.length !== 6) {
        return;
      }

      verifyLockRef.current = true;
      setError('');
      setSuccess('');

      try {
        const result = await verifyOtpMutation.mutateAsync({ mobileNumber, otp: code });
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
      } catch (err) {
        if (isRoleMismatchError(err)) {
          setError(
            getRoleMismatchMessage(
              err,
              'This number is registered as a partner. Use the RACE Partner app or a different number.',
            ),
          );
        } else {
          setError(getApiErrorMessage(err, 'Invalid OTP'));
        }
        setOtp('');
        setActiveOtpIndex(0);
        verifyLockRef.current = false;
      }
    },
    [
      dispatch,
      isExistingUser,
      loading,
      mobileNumber,
      navigation,
      otp,
      partnerSignupRequired,
      signupVendorType,
      verified,
      verifyOtpMutation,
    ],
  );

  const handleResend = async () => {
    if (secondsLeft > 0 || loading) return;

    setError('');
    setSuccess('');
    verifyLockRef.current = false;

    try {
      const result = await sendOtpMutation.mutateAsync({ mobileNumber });
      setSuccess('OTP resent successfully');
      setSecondsLeft(RESEND_SECONDS);
      setOtp('');
      setActiveOtpIndex(0);
      if (result.isExistingUser !== undefined) {
        navigation.setParams({ isExistingUser: result.isExistingUser });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to resend OTP'));
    }
  };

  const handleOtpChange = (digits: string[]) => {
    const next = digits.join('');
    setOtp(next);
    if (error) setError('');
    if (next.length < 6) {
      verifyLockRef.current = false;
    }
    if (next.length === 6) {
      void handleVerify(next);
    }
  };

  const isVerifying = loading && otp.length === 6;

  return (
    <>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.pageBg} />

        <View style={[styles.topBar, { paddingHorizontal: px(layout.screenPadding) }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ArrowLeft size={22} color={colors.dark} strokeWidth={2.5} />
          </Pressable>

          <View style={styles.titleBlock}>
            <Text style={[styles.title, { fontSize: px(18) }]}>
              {isExistingUser ? 'Welcome back' : 'Verify OTP'}
            </Text>
            <Text style={[styles.subtitle, { fontSize: px(12), lineHeight: px(16) }]}>
              Enter the 6-digit code sent to your mobile
            </Text>
          </View>

          <View style={styles.backButton} />
        </View>

        <View
          style={[
            styles.body,
            {
              paddingHorizontal: px(layout.screenPadding),
              paddingBottom: insets.bottom + px(spacing.lg),
            },
          ]}>
          <View style={[styles.card, { borderRadius: px(18), padding: px(spacing.xl) }]}>
            <View style={styles.phoneRow}>
              <Text style={[styles.phoneText, { fontSize: px(15) }]}>
                {formatPhone(mobileNumber)}
              </Text>
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={8}
                style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Edit mobile number">
                <Pencil size={16} color={colors.primary} strokeWidth={2.2} />
              </Pressable>
            </View>

            <OtpInput
              digits={otpDigits}
              activeIndex={activeOtpIndex}
              onActiveIndexChange={setActiveOtpIndex}
              onChange={handleOtpChange}
              px={px}
            />

            <AuthToast message={error} type="error" />
            <AuthToast message={success} type="success" />

            <Text style={[styles.timerText, { fontSize: px(13), marginTop: px(spacing.xl) }]}>
              Resend OTP in <Text style={styles.timerValue}>{formatTimer(secondsLeft)}</Text>
            </Text>

            <Pressable
              disabled={secondsLeft > 0 || loading}
              onPress={() => void handleResend()}
              style={styles.resendRow}>
              <Text style={[styles.resendPrompt, { fontSize: px(13) }]}>
                Didn't receive the code?{' '}
                <Text
                  style={[
                    styles.resendAction,
                    (secondsLeft > 0 || loading) && styles.resendActionDisabled,
                  ]}>
                  Resend OTP
                </Text>
              </Text>
            </Pressable>

            <View style={[styles.infoCard, { marginTop: px(spacing.xl) }]}>
              <Info size={18} color={colors.primary} strokeWidth={2.2} />
              <Text style={styles.infoText}>
                <Text style={styles.infoTitle}>Didn't get the code?</Text> Check your SMS inbox or
                spam folder.
              </Text>
            </View>

            <Pressable
              disabled={otp.length !== 6 || loading || verified}
              onPress={() => void handleVerify()}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  marginTop: px(spacing.xl),
                  minHeight: px(54),
                  borderRadius: px(14),
                },
                (otp.length !== 6 || verified) && !loading && styles.primaryButtonDisabled,
                pressed && otp.length === 6 && !loading && !verified && styles.pressed,
              ]}>
              {isVerifying ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color={colors.dark} />
                  <Text style={[styles.primaryButtonLabel, { fontSize: px(16) }]}>
                    Verifying OTP...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.primaryButtonLabel, { fontSize: px(16) }]}>
                  {verified
                    ? 'Verified'
                    : isExistingUser
                      ? 'Verify & Login'
                      : 'Verify & Continue'}
                </Text>
              )}
            </Pressable>
          </View>

          <View style={[styles.securityRow, { marginTop: px(spacing.xl) }]}>
            <ShieldCheck size={18} color={colors.primary} strokeWidth={2.2} />
            <Text style={[styles.securityText, { fontSize: px(11), lineHeight: px(16) }]}>
              Your data is secure and encrypted{'\n'}We never share your information
            </Text>
          </View>
        </View>
      </View>

      <AuthLoadingOverlay visible={loading} label="Verifying OTP..." />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.pageBg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: {
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.grey,
    textAlign: 'center',
    marginTop: 2,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  phoneText: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  editButton: { padding: spacing.xs },
  timerText: {
    color: colors.grey,
    textAlign: 'center',
  },
  timerValue: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  resendRow: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  resendPrompt: {
    color: colors.grey,
    textAlign: 'center',
  },
  resendAction: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  resendActionDisabled: { opacity: 0.45 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.goldLight,
  },
  infoText: {
    flex: 1,
    color: colors.dark,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.normal,
  },
  infoTitle: { fontWeight: typography.weights.bold },
  primaryButton: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: { opacity: 0.55 },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryButtonLabel: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  securityText: {
    color: colors.grey,
    textAlign: 'center',
  },
  pressed: { opacity: 0.9 },
});
