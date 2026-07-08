import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Image,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { images } from '../../assets';
import { API_CONFIG } from '../../config/api';
import AuthToast, { AuthLoadingOverlay } from '../../components/auth/AuthToast';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearSignupPath } from '../../redux/onboarding/onboardingSlice';
import { getApiErrorMessage, useSendOtpMutation } from '../../services/auth/useAuthMutations';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'MobileNumber'>;

const MOBILE_REGEX = /^[6-9]\d{9}$/;

export default function MobileNumberScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.auth.loading);
  const signupAccountType = useAppSelector((state) => state.onboarding.signupAccountType);
  const signupVendorType = useAppSelector((state) => state.onboarding.signupVendorType);
  const [mobileNumber, setMobileNumber] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [error, setError] = useState('');

  const signupLabel =
    signupAccountType === 'customer'
      ? 'Customer sign up'
      : signupAccountType === 'vendor'
        ? 'Vendor sign up'
        : signupAccountType === 'driver'
          ? 'Driver sign up'
          : null;

  const sendOtpMutation = useSendOtpMutation();

  const isValid = useMemo(() => MOBILE_REGEX.test(mobileNumber), [mobileNumber]);

  const handleSendOtp = async () => {
    setError('');

    if (!isValid) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    try {
      const result = await sendOtpMutation.mutateAsync({ mobileNumber });
      if (result.isExistingUser) {
        dispatch(clearSignupPath());
      }
      navigation.navigate('OtpVerification', {
        mobileNumber,
        isExistingUser: result.isExistingUser ?? false,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to send OTP'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>
              {signupLabel ? signupLabel : 'Welcome Back 👋'}
            </Text>
            <Text style={styles.subtitle}>
              {signupLabel
                ? 'Verify your mobile number to continue.'
                : 'Please login to continue.'}
            </Text>
            {signupVendorType ? (
              <Text style={styles.pathHint}>Selected: {signupVendorType.replace(/_/g, ' ')}</Text>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                onChangeText={(text) => setMobileNumber(text.replace(/\D/g, '').slice(0, 10))}
                keyboardType="number-pad"
                placeholder="9876543210"
                placeholderTextColor={colors.textMuted}
                maxLength={10}
              />
            </View>

            {!signupLabel ? (
              <View style={styles.inputRow}>
                <View style={styles.countryCode}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
                </View>
                <TextInput
                  style={styles.input}
                  value={passwordHint}
                  onChangeText={setPasswordHint}
                  secureTextEntry
                  placeholder="••••••"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ) : null}

            <AuthToast message={error} />

            {__DEV__ ? (
              <Text style={styles.devHint}>API: {API_CONFIG.baseUrl}</Text>
            ) : null}

            <Pressable
              style={[styles.loginButton, (!isValid || loading) && styles.loginButtonDisabled]}
              onPress={handleSendOtp}
              disabled={!isValid || loading}>
              <Text style={styles.loginButtonText}>
                {loading ? 'Sending...' : signupLabel ? 'Continue' : 'Login'}
              </Text>
            </Pressable>

            {!signupLabel ? (
              <>
                <View style={styles.dividerWrap}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.divider} />
                </View>
                <View style={styles.socialRow}>
                  <Pressable style={styles.socialButton}>
                    <Ionicons name="logo-google" size={22} color={colors.textDark} />
                  </Pressable>
                  <Pressable style={styles.socialButton}>
                    <Ionicons name="logo-apple" size={22} color={colors.textDark} />
                  </Pressable>
                  <Pressable style={styles.socialButton}>
                    <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                  </Pressable>
                </View>
                <Pressable
                  style={styles.signupPressable}
                  onPress={() => navigation.navigate('AccountType')}>
                  <Text style={styles.signupText}>
                    Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.switchTypeButton} onPress={() => navigation.navigate('AccountType')}>
                <Text style={styles.switchTypeText}>Change account type</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
        <AuthLoadingOverlay visible={loading} label="Sending OTP..." />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 72,
    height: 72,
  },
  title: {
    marginTop: spacing.sm,
    color: colors.textDark,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  pathHint: {
    marginTop: spacing.sm,
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.textDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  countryCode: {
    minWidth: 72,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryCodeText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  input: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textDark,
    backgroundColor: colors.backgroundSoft,
  },
  devHint: {
    marginBottom: spacing.md,
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
  socialRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  socialButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSoft,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: colors.textDark,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  signupPressable: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signupText: {
    color: colors.text,
    fontSize: typography.sizes.md,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  switchTypeButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTypeText: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.md,
  },
});
