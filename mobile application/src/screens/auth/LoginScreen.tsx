import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import GoldButton from '../../components/auth/GoldButton';
import GoogleIcon from '../../components/auth/GoogleIcon';
import { sendOtp } from '../../services/authService';
import { getApiErrorMessage } from '../../services/api';
import type { AuthStackParamList } from '../../types/navigation';
import {
  formatPhoneE164,
  getPhoneDigits,
  isValidIndianMobile,
} from '../../utils/phone';
import { colors, typography } from '../../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const [phoneDigits, setPhoneDigits] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (value: string) => {
    const digits = getPhoneDigits(value).slice(0, 10);
    setPhoneDigits(digits);
    if (phoneError) setPhoneError('');
  };

  const handleContinue = async () => {
    if (!isValidIndianMobile(phoneDigits)) {
      setPhoneError('Enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    setPhoneError('');
    try {
      await sendOtp(getPhoneDigits(phoneDigits));
      navigation.navigate('OTP', {
        phone: formatPhoneE164(phoneDigits),
        flow: 'login',
      });
    } catch (error) {
      setPhoneError(getApiErrorMessage(error, 'Unable to send OTP'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: px(24),
            paddingTop: px(24),
            paddingBottom: px(16),
            justifyContent: 'space-between',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View>
            <Text
              style={{
                fontSize: px(28),
                fontWeight: typography.weights.extrabold,
                color: colors.dark,
                marginBottom: px(8),
              }}>
              Enter mobile number
            </Text>
            <Text
              style={{
                fontSize: px(14),
                color: colors.grey,
                lineHeight: px(20),
                marginBottom: px(28),
              }}>
              We'll send you a one-time password (OTP) to verify your number
            </Text>

            <Text
              style={{
                fontSize: px(12),
                fontWeight: typography.weights.semibold,
                color: colors.grey,
                marginBottom: px(8),
              }}>
              Mobile Number
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: phoneError ? colors.error : colors.border,
                borderRadius: px(14),
                backgroundColor: colors.background,
                height: px(54),
                paddingHorizontal: px(14),
                marginBottom: phoneError ? px(6) : px(20),
              }}>
              <View
                style={{
                  paddingRight: px(12),
                  marginRight: px(12),
                  borderRightWidth: 1,
                  borderRightColor: colors.border,
                }}>
                <Text
                  style={{
                    fontSize: px(15),
                    fontWeight: typography.weights.bold,
                    color: colors.dark,
                  }}>
                  +91
                </Text>
              </View>
              <TextInput
                value={phoneDigits}
                onChangeText={handlePhoneChange}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="10-digit mobile number"
                placeholderTextColor={colors.grey}
                style={{
                  flex: 1,
                  fontSize: px(16),
                  fontWeight: typography.weights.semibold,
                  color: colors.dark,
                  padding: 0,
                }}
              />
            </View>
            {phoneError ? (
              <Text
                style={{
                  fontSize: px(12),
                  color: colors.error,
                  marginBottom: px(16),
                }}>
                {phoneError}
              </Text>
            ) : null}

            <Text
              style={{
                fontSize: px(11),
                color: colors.grey,
                lineHeight: px(16),
                marginBottom: px(20),
              }}>
              By continuing, you agree to our{' '}
              <Text style={{ color: colors.primary, fontWeight: typography.weights.semibold }}>
                Terms of Service
              </Text>{' '}
              &{' '}
              <Text style={{ color: colors.primary, fontWeight: typography.weights.semibold }}>
                Privacy Policy
              </Text>
            </Text>

            <GoldButton
              label={isSubmitting ? 'Sending OTP...' : 'Continue'}
              onPress={() => void handleContinue()}
              style={{ width: '100%' }}
              height={px(54)}
              labelSize={px(17)}
              borderRadius={px(14)}
              disabled={isSubmitting}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: px(22),
              }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text style={{ marginHorizontal: px(12), fontSize: px(13), color: colors.grey }}>
                or
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>

            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: px(54),
                borderRadius: px(14),
                borderWidth: 1.5,
                borderColor: colors.border,
                backgroundColor: colors.background,
                gap: px(10),
              }}
              onPress={() => Alert.alert('Google Sign-In', 'Google sign-in coming soon')}>
              <GoogleIcon size={px(24)} />
              <Text
                style={{
                  fontSize: px(16),
                  fontWeight: typography.weights.semibold,
                  color: colors.dark,
                }}>
                Continue with Google
              </Text>
            </Pressable>

            {__DEV__ ? (
              <Text
                style={{
                  marginTop: px(14),
                  textAlign: 'center',
                  fontSize: px(11),
                  color: colors.grey,
                  lineHeight: px(16),
                }}>
                Dev: OTP backend terminal mein dikhega (npm run dev).
              </Text>
            ) : null}
          </View>

          <View style={[styles.footer, { paddingTop: px(8) }]}>
            <Text style={{ color: colors.grey, fontSize: px(14) }}>New to RACE? </Text>
            <Pressable onPress={() => navigation.navigate('CreateAccount')}>
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: typography.weights.bold,
                  fontSize: px(14),
                }}>
                Create account
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
