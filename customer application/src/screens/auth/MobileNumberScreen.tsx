import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Lock,
  Send,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { images } from '../../assets';
import AuthToast, { AuthLoadingOverlay } from '../../components/auth/AuthToast';
import { API_CONFIG } from '../../config/api';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'MobileNumber'>;

const MOBILE_REGEX = /^[6-9]\d{9}$/;
const REF_W = 390;
const SUCCESS_GREEN = '#22C55E';

/** TEMP: skip OTP UI — auto-verify with backend dev OTP. Re-enable OTP by flipping this off. */
const SKIP_OTP_AUTH = true;

function extractOtpFromMessage(message?: string): string | null {
  if (!message) return null;
  const match = message.match(/\b(\d{6})\b/);
  return match?.[1] ?? null;
}

const TRUST_ITEMS = [
  { title: '24/7 Help', subtitle: 'Always on the road', Icon: Zap },
  { title: 'Verified Pros', subtitle: 'Trained technicians', Icon: ShieldCheck },
  { title: 'Fast Arrival', subtitle: 'Nearby network', Icon: Smartphone },
] as const;

function formatMobileDisplay(value: string) {
  if (value.length <= 5) return value;
  return `${value.slice(0, 5)} ${value.slice(5)}`;
}

export default function MobileNumberScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(state => state.auth.loading);
  const signupAccountType = useAppSelector(state => state.onboarding.signupAccountType);
  const signupVendorType = useAppSelector(state => state.onboarding.signupVendorType);
  const partnerSignupRequired = useAppSelector(state => state.onboarding.partnerSignupRequired);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = width / REF_W;
  const px = (value: number) => Math.max(1, Math.round(value * scale));

  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const isValid = useMemo(() => MOBILE_REGEX.test(mobileNumber), [mobileNumber]);

  const isSignup = Boolean(signupAccountType);
  const roleLabel =
    signupAccountType === 'customer'
      ? 'Customer'
      : signupAccountType === 'vendor'
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
      const isExistingUser = result.isExistingUser ?? false;
      if (isExistingUser) {
        dispatch(clearSignupPath());
      }

      // --- OTP auth bypass (temporary) ---
      if (SKIP_OTP_AUTH) {
        const otp = result.devOtp ?? extractOtpFromMessage(result.message);
        if (!otp) {
          setError('Dev OTP unavailable. Turn off SKIP_OTP_AUTH or use a non-production API.');
          return;
        }
        const verifyResult = await verifyOtpMutation.mutateAsync({ mobileNumber, otp });
        if (isExistingUser || verifyResult.user.isProfileCompleted) {
          dispatch(clearSignupPath());
        }
        if (verifyResult.onboardingRequired && !verifyResult.user.isProfileCompleted) {
          navigation.replace('ProfileWizard');
          return;
        }
        if (partnerSignupRequired && signupVendorType && verifyResult.user.isProfileCompleted) {
          navigation.replace('VendorWizard', { vendorType: signupVendorType });
          return;
        }
        // Existing user / profile complete → RootNavigator swaps to Main
        return;
      }
      // --- end OTP bypass ---

      // navigation.navigate('OtpVerification', {
      //   mobileNumber,
      //   isExistingUser,
      //   devOtp: result.devOtp,
      //   otpMessage: result.message,
      // });
    } catch (err) {
      if (isRoleMismatchError(err)) {
        setError(
          getRoleMismatchMessage(
            err,
            'This number is registered as a partner. Use the RACE Partner app or a different number.',
          ),
        );
        return;
      }
      setError(getApiErrorMessage(err, SKIP_OTP_AUTH ? 'Unable to sign in' : 'Unable to send OTP'));
    }
  };

  const inputBorderColor = error
    ? colors.error
    : focused || isValid
      ? colors.primary
      : colors.border;

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

          <View style={styles.brandBlock}>
            <Text style={[styles.brandRace, { fontSize: px(18), lineHeight: px(22) }]}>RACE</Text>
            <Text style={[styles.brandCustomer, { fontSize: px(11), lineHeight: px(14) }]}>
              SERVICE
            </Text>
          </View>

          <View style={styles.backButton} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.scroll}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: px(layout.screenPadding),
                paddingBottom: insets.bottom + px(spacing.xl),
              },
            ]}>
            <View style={[styles.welcomeBlock, { marginTop: px(spacing.sm) }]}>
              <Text style={[styles.welcomeTitle, { fontSize: px(28), lineHeight: px(34) }]}>
                {isSignup ? 'Create your account' : 'Welcome back!'}
              </Text>
              <Text
                style={[
                  styles.welcomeSubtitle,
                  { fontSize: px(14), lineHeight: px(21), marginTop: px(6) },
                ]}>
                {isSignup
                  ? SKIP_OTP_AUTH
                    ? 'Enter your mobile number to create your account.'
                    : 'Verify your mobile number with a secure OTP to continue.'
                  : SKIP_OTP_AUTH
                    ? 'Enter your mobile number to sign in to RACE.'
                    : 'Sign in to your RACE account with a secure OTP.'}
              </Text>
              {roleLabel ? (
                <View style={[styles.rolePill, { marginTop: px(10) }]}>
                  <Text style={styles.rolePillText}>Continuing as {roleLabel}</Text>
                </View>
              ) : null}
              {signupVendorType ? (
                <Text style={[styles.pathHint, { marginTop: px(8), fontSize: px(12) }]}>
                  Selected: {signupVendorType.replace(/_/g, ' ')}
                </Text>
              ) : null}
            </View>

            <Image
              source={images.homeHeroTruck}
              style={[styles.heroImage, { height: px(110), marginTop: px(spacing.md) }]}
              resizeMode="contain"
              accessibilityLabel="RACE roadside assistance"
            />

            <View
              style={[
                styles.card,
                {
                  marginTop: px(spacing.md),
                  paddingHorizontal: px(spacing.xl),
                  paddingTop: px(spacing.xxl),
                  paddingBottom: px(spacing.xl),
                  borderRadius: px(18),
                },
              ]}>
              <View style={styles.phoneIconWrap}>
                <Smartphone size={px(26)} color={colors.primary} strokeWidth={2.2} />
              </View>

              <Text style={[styles.cardTitle, { fontSize: px(20), marginTop: px(14) }]}>
                Enter mobile number
              </Text>
              <Text
                style={[
                  styles.cardSubtitle,
                  { fontSize: px(13), lineHeight: px(19), marginTop: px(6) },
                ]}>
                {SKIP_OTP_AUTH
                  ? 'We will sign you in with this number.'
                  : "We'll send a 6-digit OTP to verify your account."}
              </Text>

              <Text style={[styles.fieldLabel, { fontSize: px(13), marginTop: px(22) }]}>
                Mobile number
              </Text>

              <View style={[styles.phoneRow, { marginTop: px(8), gap: px(10) }]}>
                <View style={[styles.countryBox, { minHeight: px(52), borderRadius: px(12) }]}>
                  <Text style={[styles.countryCode, { fontSize: px(15) }]}>+91</Text>
                  <ChevronDown size={px(16)} color={colors.grey} strokeWidth={2.5} />
                </View>

                <View
                  style={[
                    styles.phoneInputWrap,
                    {
                      minHeight: px(52),
                      borderRadius: px(12),
                      borderColor: inputBorderColor,
                    },
                  ]}>
                  <TextInput
                    value={formatMobileDisplay(mobileNumber)}
                    onChangeText={text => {
                      setMobileNumber(text.replace(/\D/g, '').slice(0, 10));
                      if (error) setError('');
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    keyboardType="number-pad"
                    placeholder="98765 43210"
                    placeholderTextColor={colors.textMuted}
                    maxLength={11}
                    style={[styles.phoneInput, { fontSize: px(16) }]}
                  />
                  {isValid ? (
                    <View style={styles.validCheck}>
                      <Check size={14} color={SUCCESS_GREEN} strokeWidth={3} />
                    </View>
                  ) : null}
                </View>
              </View>

              <AuthToast message={error} type="error" />

              {__DEV__ ? (
                <Text style={[styles.devHint, { fontSize: px(11), marginTop: px(8) }]}>
                  API: {API_CONFIG.baseUrl}
                </Text>
              ) : null}

              <Pressable
                disabled={!isValid || loading}
                onPress={() => void handleSendOtp()}
                style={({ pressed }) => [
                  styles.sendButton,
                  {
                    marginTop: px(spacing.lg),
                    minHeight: px(54),
                    borderRadius: px(14),
                  },
                  (!isValid || loading) && styles.sendButtonDisabled,
                  pressed && isValid && !loading && styles.pressed,
                ]}>
                <Send size={px(18)} color={colors.dark} strokeWidth={2.4} />
                <Text style={[styles.sendButtonLabel, { fontSize: px(16) }]}>
                  {loading
                    ? SKIP_OTP_AUTH
                      ? 'Signing in...'
                      : 'Sending OTP...'
                    : SKIP_OTP_AUTH
                      ? 'Continue'
                      : 'Send OTP'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('AccountType')}
                style={({ pressed }) => [
                  styles.changeRoleRow,
                  { marginTop: px(spacing.lg) },
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.changeRoleText, { fontSize: px(13) }]}>
                  {isSignup ? (
                    <>
                      Wrong path? <Text style={styles.changeRoleLink}>Change account type</Text>
                    </>
                  ) : (
                    <>
                      New to RACE? <Text style={styles.changeRoleLink}>Get started</Text>
                    </>
                  )}
                </Text>
              </Pressable>

              <View style={[styles.safeRow, { marginTop: px(spacing.xl) }]}>
                <Lock size={13} color={colors.grey} strokeWidth={2.2} />
                <Text style={[styles.safeText, { fontSize: px(12) }]}>
                  Your data is safe and secure with RACE
                </Text>
              </View>
            </View>

            <View style={[styles.trustRow, { marginTop: px(spacing.xl), gap: px(8) }]}>
              {TRUST_ITEMS.map(({ title, subtitle, Icon }) => (
                <View key={title} style={styles.trustItem}>
                  <View style={styles.trustIconWrap}>
                    <Icon size={16} color={colors.primary} strokeWidth={2.2} />
                  </View>
                  <Text style={[styles.trustTitle, { fontSize: px(11) }]} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text
                    style={[styles.trustSubtitle, { fontSize: px(10), lineHeight: px(13) }]}
                    numberOfLines={2}>
                    {subtitle}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <AuthLoadingOverlay
        visible={loading}
        label={SKIP_OTP_AUTH ? 'Signing in...' : 'Sending OTP...'}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.pageBg },
  flex: { flex: 1 },
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
  brandBlock: { alignItems: 'center' },
  brandRace: {
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 0.5,
  },
  brandCustomer: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.6,
  },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  welcomeBlock: { alignItems: 'flex-start' },
  welcomeTitle: {
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
  },
  welcomeSubtitle: { color: colors.grey },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.goldLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#F5D98A',
  },
  rolePillText: {
    color: colors.primaryDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  pathHint: {
    color: colors.primaryDark,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
  heroImage: {
    width: '100%',
    maxWidth: 260,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  phoneIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  cardTitle: {
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
    textAlign: 'center',
  },
  cardSubtitle: {
    color: colors.grey,
    textAlign: 'center',
  },
  fieldLabel: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.lightGrey,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryCode: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  phoneInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  phoneInput: {
    flex: 1,
    color: colors.dark,
    fontWeight: typography.weights.medium,
    paddingVertical: spacing.md,
  },
  validCheck: { marginLeft: spacing.xs },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonLabel: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  changeRoleRow: { alignItems: 'center' },
  changeRoleText: {
    color: colors.grey,
    textAlign: 'center',
  },
  changeRoleLink: {
    color: '#2563EB',
    fontWeight: typography.weights.semibold,
  },
  safeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  safeText: { color: colors.grey },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
  },
  trustIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  trustTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  trustSubtitle: {
    color: colors.grey,
    textAlign: 'center',
    marginTop: 2,
  },
  devHint: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  pressed: { opacity: 0.9 },
});
