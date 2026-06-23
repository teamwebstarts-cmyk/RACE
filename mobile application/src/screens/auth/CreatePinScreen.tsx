import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Delete, Shield } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import GoldButton from '../../components/auth/GoldButton';
import { AuthBackHeader } from '../../components/auth/StepHeader';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';

const REF_W = 390;
const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

type Props = NativeStackScreenProps<AuthStackParamList, 'CreatePin'>;

function PinDots({ value, px, active }: { value: string; px: (n: number) => number; active?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: px(14) }}>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => {
        const filled = i < value.length;
        return (
          <View
            key={i}
            style={{
              width: px(16),
              height: px(16),
              borderRadius: px(8),
              borderWidth: filled ? 0 : 1.5,
              borderColor: active ? colors.primary : colors.border,
              backgroundColor: filled ? colors.primary : colors.background,
            }}
          />
        );
      })}
    </View>
  );
}

export default function CreatePinScreen({ navigation }: Props) {
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'pin' | 'confirm'>('pin');
  const [pinSet, setPinSet] = useState(false);

  const activeValue = step === 'pin' ? pin : confirmPin;
  const setActiveValue = step === 'pin' ? setPin : setConfirmPin;

  const handleKey = (key: (typeof KEYS)[number]) => {
    if (key === '') return;
    if (key === 'del') {
      setActiveValue(prev => prev.slice(0, -1));
      return;
    }
    if (activeValue.length >= PIN_LENGTH) return;
    const next = activeValue + key;
    setActiveValue(next);
    if (next.length === PIN_LENGTH && step === 'pin') {
      setTimeout(() => setStep('confirm'), 200);
    }
  };

  const handleSetPin = () => {
    if (pin.length < PIN_LENGTH || confirmPin.length < PIN_LENGTH) {
      Alert.alert('Incomplete PIN', 'Please enter a 4-digit PIN.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('Mismatch', 'PINs do not match. Try again.');
      setConfirmPin('');
      setStep('confirm');
      return;
    }
    setPinSet(true);
  };

  const handleGoHome = () => {
    if (!pinSet) {
      Alert.alert('Set PIN first', 'Please set your PIN before continuing to Home.');
      return;
    }
    login();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: px(24), paddingBottom: px(24) }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <AuthBackHeader onBack={() => navigation.goBack()} />

        <View
          style={{
            alignSelf: 'center',
            width: px(72),
            height: px(72),
            borderRadius: px(36),
            backgroundColor: colors.goldLight,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: px(8),
            marginBottom: px(20),
          }}>
          <Shield size={px(34)} color={colors.primary} strokeWidth={2} />
        </View>

        <Text
          style={{
            fontSize: px(24),
            fontWeight: typography.weights.extrabold,
            color: colors.dark,
            textAlign: 'center',
            marginBottom: px(8),
          }}>
          Create Your PIN
        </Text>
        <Text
          style={{
            fontSize: px(14),
            color: colors.grey,
            textAlign: 'center',
            marginBottom: px(24),
            lineHeight: px(20),
          }}>
          Set a 4-digit PIN for quick & secure login
        </Text>

        <Text
          style={{
            textAlign: 'center',
            marginBottom: px(10),
            fontSize: px(13),
            fontWeight: step === 'pin' ? typography.weights.bold : typography.weights.semibold,
            color: step === 'pin' ? colors.dark : colors.grey,
          }}>
          Enter PIN
        </Text>
        <PinDots value={pin} px={px} active={step === 'pin'} />

        <Text
          style={{
            textAlign: 'center',
            marginTop: px(18),
            marginBottom: px(10),
            fontSize: px(13),
            fontWeight: step === 'confirm' ? typography.weights.bold : typography.weights.semibold,
            color: step === 'confirm' ? colors.dark : colors.grey,
          }}>
          Confirm PIN
        </Text>
        <PinDots value={confirmPin} px={px} active={step === 'confirm'} />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: px(8),
            marginTop: px(20),
            marginBottom: px(20),
            borderRadius: px(10),
            backgroundColor: colors.goldLight,
            padding: px(12),
          }}>
          <Shield size={px(16)} color={colors.primary} strokeWidth={2} />
          <Text style={{ flex: 1, fontSize: px(11), color: colors.dark }}>
            Never share your PIN with anyone
          </Text>
        </View>

        <View style={{ gap: px(10), marginBottom: px(20) }}>
          {[0, 1, 2].map(row => (
            <View key={row} style={{ flexDirection: 'row', gap: px(10) }}>
              {KEYS.slice(row * 3, row * 3 + 3).map(key => (
                <Pressable
                  key={`${row}-${key}`}
                  onPress={() => handleKey(key)}
                  style={{
                    flex: 1,
                    height: px(52),
                    borderRadius: px(12),
                    borderWidth: key === '' ? 0 : 1,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {key === 'del' ? (
                    <Delete size={px(20)} color={colors.dark} strokeWidth={2} />
                  ) : key ? (
                    <Text style={{ fontSize: px(22), fontWeight: typography.weights.bold, color: colors.dark }}>
                      {key}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        <GoldButton
          label="Set PIN"
          onPress={handleSetPin}
          style={{ width: '100%' }}
          height={px(54)}
          labelSize={px(17)}
          borderRadius={px(14)}
        />

        <Text
          style={{
            fontSize: px(13),
            color: colors.grey,
            textAlign: 'center',
            marginTop: px(20),
            marginBottom: px(8),
          }}>
          {pinSet
            ? 'PIN set! Tap below to start using RACE Service'
            : 'Set your PIN, then tap Go to Home to continue'}
        </Text>
        <Pressable onPress={handleGoHome}>
          <Text
            style={{
              fontSize: px(16),
              fontWeight: typography.weights.bold,
              color: pinSet ? colors.primary : colors.grey,
              textAlign: 'center',
            }}>
            Go to Home →
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
});
