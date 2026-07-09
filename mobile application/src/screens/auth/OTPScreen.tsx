import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthFormLayout from '../../components/auth/AuthFormLayout';
import GoldButton from '../../components/auth/GoldButton';
import { useAuthActions } from '../../hooks/useAuth';
import { sendOtp } from '../../services/authService';
import { getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { getCustomerOnboardingRouteFromStep } from '../../store/customerOnboardingRoute';
import type { AuthStackParamList } from '../../types/navigation';
import { getPhoneDigits } from '../../utils/phone';
import { maskMobile } from '../../utils/mask';
import { colors, shadows, typography } from '../../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export default function OTPScreen({ navigation, route }: Props) {
  const { phone, isExistingUser } = route.params;
  const { verifyOtp: verifyOtpAction, error: authError, isLoading, clearError } = useAuthActions();
  const { width } = useWindowDimensions();
  const px = (n: number) => Math.round(n * (width / REF_W));

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const isVerifyingRef = useRef(false);

  const otpValue = digits.join('');
  const mobileNumber = getPhoneDigits(phone);
  const destinationLabel = maskMobile(phone);

  const verifyOtp = useCallback(
    async (value: string) => {
      const code = value.replace(/\D/g, '').slice(0, 6);
      if (code.length < 6) {
        setError('Please enter the 6-digit OTP');
        return;
      }
      if (isVerifyingRef.current) {
        return;
      }

      isVerifyingRef.current = true;
      clearError();
      setError('');
      try {
        await verifyOtpAction({
          mobileNumber,
          otp: code,
        });
        if (useAuthStore.getState().onboardingRequired) {
          const step = useAuthStore.getState().customerOnboardingStep;
          navigation.navigate(getCustomerOnboardingRouteFromStep(step));
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Invalid OTP. Please try again'));
      } finally {
        isVerifyingRef.current = false;
      }
    },
    [clearError, mobileNumber, navigation, verifyOtpAction],
  );

  const applyOtpValue = useCallback(
    (raw: string) => {
      const chars = raw.replace(/\D/g, '').slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      chars.forEach((char, index) => {
        next[index] = char;
      });
      setDigits(next);
      if (error) setError('');
      const nextIndex = Math.min(chars.length, 5);
      setActiveIndex(nextIndex);
      if (chars.length === 6) {
        void verifyOtp(chars.join(''));
      } else {
        inputRefs.current[nextIndex]?.focus();
      }
    },
    [error, verifyOtp],
  );

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const updateDigits = (next: string[]) => {
    setDigits(next);
    if (error) setError('');
    if (next.join('').length === 6) {
      void verifyOtp(next.join(''));
    }
  };

  const handleDigitInput = (index: number, value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length > 1) {
      applyOtpValue(digitsOnly);
      return;
    }

    const char = digitsOnly.slice(-1);
    const next = [...digits];
    next[index] = char;
    updateDigits(next);
    if (char && index < 5) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key !== 'Backspace') return;
    if (digits[index]) {
      const next = [...digits];
      next[index] = '';
      updateDigits(next);
      return;
    }
    if (index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      updateDigits(next);
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    setError('');
    clearError();
    try {
      await sendOtp({ mobileNumber });
      setTimer(30);
      setDigits(['', '', '', '', '', '']);
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
      Alert.alert('OTP Sent', `A new OTP has been sent to ${destinationLabel}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to resend OTP'));
    } finally {
      setIsResending(false);
    }
  };

  const timerLabel = `00:${String(timer).padStart(2, '0')}`;

  return (
    <AuthFormLayout onBack={() => navigation.goBack()}>
      <View
        style={{
          alignSelf: 'center',
          width: px(72),
          height: px(72),
          borderRadius: px(36),
          backgroundColor: colors.goldLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: px(12),
          marginBottom: px(20),
        }}>
        <MessageCircle size={px(32)} color={colors.primary} strokeWidth={2.2} />
      </View>

      <Text
        style={{
          fontSize: px(26),
          fontWeight: typography.weights.extrabold,
          color: colors.dark,
          textAlign: 'center',
        }}>
        Enter OTP
      </Text>

      <Text
        style={{
          marginTop: px(8),
          fontSize: px(14),
          color: colors.grey,
          textAlign: 'center',
          lineHeight: px(20),
        }}>
        We have sent a 6-digit code to your mobile number
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: px(10),
          marginBottom: px(28),
          gap: px(6),
        }}>
        <Text
          style={{
            fontSize: px(14),
            fontWeight: typography.weights.bold,
            color: colors.primary,
          }}>
          {destinationLabel}
        </Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text
            style={{
              fontSize: px(14),
              color: colors.grey,
              textDecorationLine: 'underline',
            }}>
            Change
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: px(8),
          marginBottom: px(18),
        }}>
        <TextInput
          value=""
          onChangeText={applyOtpValue}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          keyboardType="number-pad"
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
        />
        {digits.map((digit, index) => {
          const isActive = activeIndex === index;
          return (
            <Pressable
              key={index}
              onPress={() => {
                setActiveIndex(index);
                inputRefs.current[index]?.focus();
              }}
              style={{
                width: px(48),
                height: px(56),
                borderRadius: px(12),
                borderWidth: isActive ? 2 : 1.5,
                borderColor: isActive ? colors.primary : colors.border,
                backgroundColor: colors.background,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
              <TextInput
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  fontSize: px(22),
                  fontWeight: typography.weights.bold,
                  color: digit || isActive ? colors.dark : 'transparent',
                  textAlign: 'center',
                  padding: 0,
                }}
                value={digit}
                onChangeText={value => handleDigitInput(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                onFocus={() => setActiveIndex(index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            </Pressable>
          );
        })}
      </View>

      {(error || authError) ? (
        <Text
          style={{
            color: colors.error,
            textAlign: 'center',
            fontSize: px(13),
            marginBottom: px(12),
          }}>
          {error || authError}
        </Text>
      ) : null}

      <Text
        style={{
          textAlign: 'center',
          color: colors.grey,
          fontSize: px(14),
          marginBottom: px(8),
        }}>
        Didn't receive OTP? Resend in {timerLabel}
      </Text>
      <Pressable
        onPress={() => void handleResend()}
        disabled={timer > 0 || isResending}
        style={{ marginBottom: px(20) }}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: px(14),
            fontWeight: typography.weights.bold,
            color: timer > 0 || isResending ? colors.border : colors.primary,
          }}>
          {isResending ? 'Resending...' : 'Resend OTP'}
        </Text>
      </Pressable>

      <GoldButton
        label={isLoading ? 'Verifying...' : isExistingUser ? 'Verify & Login' : 'Verify & Continue'}
        onPress={() => void verifyOtp(otpValue)}
        style={[shadows.card, { width: '100%' }]}
        height={px(54)}
        labelSize={px(17)}
        borderRadius={px(14)}
        disabled={isLoading}
      />
    </AuthFormLayout>
  );
}
