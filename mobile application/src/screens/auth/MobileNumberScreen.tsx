import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { API_CONFIG } from '../../config/api';
import AuthToast, { AuthLoadingOverlay } from '../../components/auth/AuthToast';
import BrandLogo from '../../components/ui/BrandLogo';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAppSelector } from '../../redux/hooks';
import { getApiErrorMessage, useSendOtpMutation } from '../../services/auth/useAuthMutations';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'MobileNumber'>;

const MOBILE_REGEX = /^[6-9]\d{9}$/;

export default function MobileNumberScreen({ navigation }: Props) {
  const loading = useAppSelector((state) => state.auth.loading);
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');

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
      navigation.navigate('OtpVerification', {
        mobileNumber,
        devOtp: result.devOtp,
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
            <BrandLogo size="large" />
            <Text style={styles.badge}>RACE SERVICE</Text>
            <Text style={styles.title}>Login or Sign Up</Text>
            <Text style={styles.subtitle}>
              Enter your mobile number. Returning users verify OTP to login. New users complete a
              quick profile once.
            </Text>
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

            <AuthToast message={error} />

            {__DEV__ ? (
              <Text style={styles.devHint}>API: {API_CONFIG.baseUrl}</Text>
            ) : null}

            <PrimaryButton
              label={loading ? 'Sending...' : 'Send OTP'}
              onPress={handleSendOtp}
              disabled={!isValid || loading}
            />
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  badge: {
    marginTop: spacing.md,
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.2,
  },
  title: {
    marginTop: spacing.sm,
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
    maxWidth: 320,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 195, 38, 0.25)',
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
    backgroundColor: colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
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
});
