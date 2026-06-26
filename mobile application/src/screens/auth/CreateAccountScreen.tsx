import React, { useState } from 'react';
import {
  Alert,
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
import { Check, Mail, Phone, User } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import FormField from '../../components/auth/FormField';
import GoldButton from '../../components/auth/GoldButton';
import GoogleIcon from '../../components/auth/GoogleIcon';
import { AuthBackHeader } from '../../components/auth/StepHeader';
import { REGISTERED_PHONE_DIGITS } from '../../constants/auth';
import type { AuthStackParamList } from '../../types/navigation';
import { formatPhoneE164, getPhoneDigits, isValidIndianMobile } from '../../utils/phone';
import { colors, typography } from '../../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateAccount'>;

function getPhoneDigitsLocal(phone: string) {
  return getPhoneDigits(phone);
}

export default function CreateAccountScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (key: string) => {
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSignUp = () => {
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) {
      nextErrors.name = 'Please enter your name';
    }
    if (getPhoneDigitsLocal(phone).length !== 10) {
      nextErrors.phone = 'Enter valid 10-digit number';
    }
    if (getPhoneDigitsLocal(phone) === REGISTERED_PHONE_DIGITS) {
      nextErrors.phone = 'Number already registered. Please login instead.';
    }
    if (!termsAccepted) {
      Alert.alert('Terms Required', 'Please accept terms');
      return;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      navigation.navigate('OTP', {
        phone: formatPhoneE164(getPhoneDigitsLocal(phone)),
        flow: 'signup',
        name: name.trim(),
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingHorizontal: px(24),
              paddingTop: px(4),
              paddingBottom: px(16),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.main}>
            <View style={{ marginBottom: px(4) }}>
              <AuthBackHeader onBack={() => navigation.goBack()} />
            </View>

            <Text
              style={{
                marginTop: px(8),
                fontSize: px(26),
                fontWeight: typography.weights.extrabold,
                color: colors.dark,
                textAlign: 'center',
              }}>
              Create Account
            </Text>

            <Text
              style={{
                marginTop: px(6),
                marginBottom: px(24),
                fontSize: px(14),
                color: colors.grey,
                textAlign: 'center',
                lineHeight: px(20),
              }}>
              Create your account with your mobile number. We'll send an OTP to verify.
            </Text>

            <FormField
              variant="outlined"
              compact
              scale={s}
              label="Full Name"
              required
              Icon={User}
              value={name}
              onChangeText={text => {
                setName(text);
                clearError('name');
              }}
              error={errors.name}
            />

            <FormField
              variant="outlined"
              compact
              scale={s}
              label="Mobile Number"
              required
              Icon={Phone}
              value={phone}
              onChangeText={text => {
                setPhone(text);
                clearError('phone');
              }}
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <FormField
              variant="outlined"
              compact
              scale={s}
              label="Email"
              Icon={Mail}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              rightElement={
                <Text style={{ fontSize: px(11), color: colors.grey }}>(Optional)</Text>
              }
            />

            <Pressable
              style={[styles.termsRow, { marginBottom: px(20), gap: px(10) }]}
              onPress={() => setTermsAccepted(v => !v)}>
              <View
                style={[
                  styles.checkbox,
                  {
                    width: px(20),
                    height: px(20),
                    borderRadius: px(4),
                  },
                  termsAccepted && styles.checkboxChecked,
                ]}>
                {termsAccepted ? (
                  <Check size={px(13)} color={colors.background} strokeWidth={3} />
                ) : null}
              </View>
              <Text style={{ flex: 1, fontSize: px(13), color: colors.grey, lineHeight: px(20) }}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms & Conditions</Text>
                {' and '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </Pressable>

            <GoldButton
              label="Continue"
              onPress={handleSignUp}
              style={{ width: '100%' }}
              height={px(54)}
              labelSize={px(17)}
              borderRadius={px(14)}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: px(20),
              }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text
                style={{
                  marginHorizontal: px(12),
                  fontSize: px(13),
                  color: colors.grey,
                }}>
                or continue with
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
                paddingHorizontal: px(16),
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
          </View>

          <View style={[styles.footer, { paddingTop: px(16) }]}>
            <Text style={{ color: colors.grey, fontSize: px(14) }}>
              Already have an account?{' '}
            </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: typography.weights.bold,
                  fontSize: px(14),
                }}>
                Login
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
  scroll: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  main: {
    width: '100%',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
