import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Lock } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthLogo from '../../components/auth/AuthLogo';
import GoldButton from '../../components/auth/GoldButton';
import { AuthBackHeader } from '../../components/auth/StepHeader';
import { AUTH_USER, DEMO_OTP } from '../../constants/auth';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, shadows, typography } from '../../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export default function OTPScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(28);
  const [error, setError] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const otpValue = digits.join('');

  const verifyOtp = useCallback(
    (value: string) => {
      if (value.length < 6) return;
      if (value === DEMO_OTP) {
        navigation.navigate('ProfileSetup');
        return;
      }
      setError('Invalid OTP. Try again');
    },
    [navigation],
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
    setTimer(28);
    setDigits(['', '', '', '', '', '']);
    setActiveIndex(0);
    setError('');
    inputRefs.current[0]?.focus();
    Alert.alert('OTP Sent', 'OTP resent!');
  };

  const timerLabel = `00:${String(timer).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingHorizontal: px(24),
              paddingTop: px(4),
              paddingBottom: px(24),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={{ marginBottom: 0 }}>
            <AuthBackHeader onBack={() => navigation.goBack()} />
          </View>

          <View style={{ marginTop: -px(10) }}>
            <AuthLogo width={px(168)} />
          </View>

          <View
            style={[
              styles.lockCircle,
              {
                width: px(84),
                height: px(84),
                borderRadius: px(42),
                marginTop: px(16),
                marginBottom: px(22),
              },
            ]}>
            <Lock size={px(34)} color={colors.primary} strokeWidth={2} />
          </View>

          <Text
            style={{
              fontSize: px(26),
              fontWeight: typography.weights.extrabold,
              color: colors.dark,
              textAlign: 'center',
            }}>
            Verify Your Number
          </Text>

          <Text
            style={{
              marginTop: px(8),
              fontSize: px(14),
              color: colors.grey,
              textAlign: 'center',
              lineHeight: px(20),
            }}>
            Enter the 6-digit code sent to
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: px(8),
              marginBottom: px(28),
              gap: px(6),
            }}>
            <Text
              style={{
                fontSize: px(14),
                fontWeight: typography.weights.bold,
                color: colors.primary,
              }}>
              {AUTH_USER.phone}
            </Text>
            <Pressable onPress={() => navigation.navigate('CreateAccount')}>
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
                  style={[
                    styles.otpBox,
                    {
                      width: px(50),
                      height: px(58),
                      borderRadius: px(12),
                      borderWidth: isActive ? 2 : 1.5,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}>
                  <TextInput
                    ref={ref => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      {
                        fontSize: px(24),
                        lineHeight: px(28),
                      },
                      !digit && !isActive && styles.otpInputHidden,
                    ]}
                    value={digit}
                    onChangeText={value => handleDigitInput(index, value)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(index, nativeEvent.key)
                    }
                    onFocus={() => setActiveIndex(index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    caretHidden={false}
                  />
                  {!digit && !isActive ? (
                    <Text
                      pointerEvents="none"
                      style={[
                        styles.otpDash,
                        {
                          fontSize: px(18),
                          bottom: px(14),
                        },
                      ]}>
                      –
                    </Text>
                  ) : null}
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
              marginBottom: px(24),
            }}>
            Resend code in {timerLabel}
            {' | '}
            <Text
              onPress={handleResend}
              style={{
                color: timer > 0 ? colors.border : colors.grey,
                textDecorationLine: timer > 0 ? 'none' : 'underline',
              }}>
              Resend
            </Text>
          </Text>

          <GoldButton
            label="Verify & Continue"
            onPress={() => verifyOtp(otpValue)}
            style={[styles.verifyBtn, shadows.card, { marginTop: px(14) }]}
            height={px(54)}
            labelSize={px(17)}
            borderRadius={px(14)}
          />
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
  scroll: {
    flexGrow: 1,
  },
  lockCircle: {
    backgroundColor: colors.goldLight,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBox: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    fontWeight: typography.weights.bold,
    color: colors.dark,
    textAlign: 'center',
    padding: 0,
  },
  otpInputHidden: {
    color: 'transparent',
  },
  otpDash: {
    position: 'absolute',
    alignSelf: 'center',
    color: colors.border,
    fontWeight: typography.weights.regular,
  },
  verifyBtn: {
    width: '100%',
  },
});
