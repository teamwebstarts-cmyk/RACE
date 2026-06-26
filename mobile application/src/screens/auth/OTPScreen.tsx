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
import { useAuth } from '../../context/AuthContext';
import { DEMO_OTP } from '../../constants/auth';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, shadows, typography } from '../../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export default function OTPScreen({ navigation, route }: Props) {
  const { phone, flow } = route.params;
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const px = (n: number) => Math.round(n * (width / REF_W));

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const otpValue = digits.join('');
  const isLoginFlow = flow === 'login';

  const verifyOtp = useCallback(
    (value: string) => {
      if (value.length < 6) {
        setError('Please enter the 6-digit OTP');
        return;
      }
      if (value !== DEMO_OTP) {
        setError('Invalid OTP. Please try again');
        return;
      }

      if (isLoginFlow) {
        login();
        return;
      }

      navigation.navigate('ProfileSetup');
    },
    [isLoginFlow, login, navigation],
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
      verifyOtp(next.join(''));
    }
  };

  const handleDigitInput = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
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

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(30);
    setDigits(['', '', '', '', '', '']);
    setActiveIndex(0);
    setError('');
    inputRefs.current[0]?.focus();
    Alert.alert('OTP Sent', `A new OTP has been sent to ${phone}`);
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
        {isLoginFlow
          ? 'We have sent a 6-digit code to your mobile number'
          : 'Verify your number to complete sign up'}
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
          {phone}
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

      {error ? (
        <Text
          style={{
            color: colors.error,
            textAlign: 'center',
            fontSize: px(13),
            marginBottom: px(12),
          }}>
          {error}
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
      <Pressable onPress={handleResend} disabled={timer > 0} style={{ marginBottom: px(20) }}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: px(14),
            fontWeight: typography.weights.bold,
            color: timer > 0 ? colors.border : colors.primary,
          }}>
          Resend OTP
        </Text>
      </Pressable>

      <GoldButton
        label={isLoginFlow ? 'Verify & Login' : 'Verify & Continue'}
        onPress={() => verifyOtp(otpValue)}
        style={[shadows.card, { width: '100%' }]}
        height={px(54)}
        labelSize={px(17)}
        borderRadius={px(14)}
      />

      {__DEV__ ? (
        <Text
          style={{
            marginTop: px(16),
            textAlign: 'center',
            fontSize: px(11),
            color: colors.grey,
          }}>
          Demo OTP: {DEMO_OTP}
        </Text>
      ) : null}
    </AuthFormLayout>
  );
}
