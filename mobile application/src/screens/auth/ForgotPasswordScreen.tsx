import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LockKeyhole, Phone } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthLogo from '../../components/auth/AuthLogo';
import FormField from '../../components/auth/FormField';
import GoldButton from '../../components/auth/GoldButton';
import { AuthBackHeader } from '../../components/auth/StepHeader';
import { AUTH_USER } from '../../constants/auth';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);
  const [phone, setPhone] = useState(AUTH_USER.phone);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: px(24), paddingBottom: px(24) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <AuthBackHeader onBack={() => navigation.goBack()} />
          <AuthLogo width={px(280)} />

          <View
            style={{
              alignSelf: 'center',
              width: px(72),
              height: px(72),
              borderRadius: px(36),
              backgroundColor: colors.goldLight,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: px(16),
              marginBottom: px(16),
            }}>
            <LockKeyhole size={px(32)} color={colors.primary} strokeWidth={2.2} />
          </View>

          <Text
            style={{
              fontSize: px(24),
              fontWeight: typography.weights.extrabold,
              color: colors.dark,
              textAlign: 'center',
              marginBottom: px(8),
            }}>
            Forgot Password?
          </Text>
          <Text
            style={{
              fontSize: px(14),
              color: colors.grey,
              textAlign: 'center',
              lineHeight: px(20),
              marginBottom: px(24),
            }}>
            Enter your registered mobile number. We'll send you a reset OTP.
          </Text>

          <FormField
            label="Mobile Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Mobile Number"
            Icon={Phone}
            variant="outlined"
            compact
            scale={s}
          />

          <GoldButton
            label="Send OTP"
            onPress={() => navigation.navigate('ResetPassword', { phone })}
            style={{ width: '100%', marginTop: px(8) }}
            height={px(54)}
            labelSize={px(17)}
            borderRadius={px(14)}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: px(24),
            }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ marginHorizontal: px(12), fontSize: px(13), color: colors.grey }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          <Pressable
            style={{ flexDirection: 'row', justifyContent: 'center' }}
            onPress={() => navigation.navigate('Login')}>
            <Text style={{ fontSize: px(14), color: colors.grey }}>Remember your password? </Text>
            <Text style={{ fontSize: px(14), fontWeight: typography.weights.bold, color: colors.primary }}>
              Login
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
});
