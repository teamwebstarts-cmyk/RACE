import React, { useState } from 'react';
import {
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
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthToast, { AuthLoadingOverlay } from '../../../components/auth/AuthToast';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { completeOnboarding } from '../../../redux/auth/authSlice';
import {
  getApiErrorMessage,
  useDriverCredentialLoginMutation,
} from '../../../services/auth/useAuthMutations';
import type {
  PartnerAuthStackParamList,
  PartnerRootStackParamList,
} from '../../../types/partnerNavigation';
import { colors, layout, radius, shadows, spacing, typography } from '../../../theme';

type Props = NativeStackScreenProps<PartnerAuthStackParamList, 'PartnerVendorDriverLogin'>;

const REF_W = 390;
const PAGE_BG = '#F7F7F5';

export default function PartnerVendorDriverLoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(state => state.auth.loading);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = width / REF_W;
  const px = (value: number) => Math.max(1, Math.round(value * scale));

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginIdFocused, setLoginIdFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const loginMutation = useDriverCredentialLoginMutation();

  const canSubmit = loginId.trim().length >= 4 && password.length >= 6 && !loading;

  const goToPartnerMain = () => {
    const rootNavigation =
      navigation.getParent<NativeStackScreenProps<PartnerRootStackParamList>['navigation']>();
    rootNavigation?.reset({
      index: 0,
      routes: [{ name: 'PartnerMain' }],
    });
  };

  const handleLogin = async () => {
    setError('');
    if (loginId.trim().length < 4) {
      setError('Enter the Login ID provided by your vendor');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        loginId: loginId.trim(),
        password,
      });
      dispatch(completeOnboarding(result.user));
      goToPartnerMain();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid login ID or password'));
    }
  };

  return (
    <>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />

        <View style={[styles.topBar, { paddingHorizontal: px(layout.screenPadding) }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <ArrowLeft size={22} color={colors.dark} strokeWidth={2.5} />
          </Pressable>
          <View style={styles.brandBlock}>
            <Text style={[styles.brandRace, { fontSize: px(18) }]}>RACE</Text>
            <Text style={[styles.brandPartner, { fontSize: px(11) }]}>PARTNER</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: px(layout.screenPadding),
              paddingBottom: insets.bottom + px(spacing.xl),
            }}>
            <Text style={[styles.title, { fontSize: px(26), lineHeight: px(32) }]}>
              Vendor driver login
            </Text>
            <Text style={[styles.subtitle, { fontSize: px(14), lineHeight: px(21) }]}>
              Use the Login ID and password shared by your vendor.
            </Text>

            <View
              style={[
                styles.card,
                shadows.card,
                {
                  marginTop: px(spacing.xl),
                  padding: px(spacing.xl),
                  borderRadius: px(18),
                },
              ]}>
              <View style={styles.iconWrap}>
                <KeyRound size={px(26)} color={colors.primary} strokeWidth={2.2} />
              </View>
              <Text style={[styles.cardTitle, { fontSize: px(18), marginTop: px(12) }]}>
                Sign in with credentials
              </Text>

              <Text style={[styles.label, { fontSize: px(13), marginTop: px(22) }]}>Login ID</Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    minHeight: px(52),
                    borderRadius: px(12),
                    borderColor: loginIdFocused ? colors.primary : colors.border,
                  },
                ]}>
                <TextInput
                  value={loginId}
                  onChangeText={text => {
                    setLoginId(text.replace(/\s/g, ''));
                    if (error) setError('');
                  }}
                  onFocus={() => setLoginIdFocused(true)}
                  onBlur={() => setLoginIdFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="e.g. driver.odisha01"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { fontSize: px(16) }]}
                />
              </View>

              <Text style={[styles.label, { fontSize: px(13), marginTop: px(16) }]}>Password</Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    minHeight: px(52),
                    borderRadius: px(12),
                    borderColor: passwordFocused ? colors.primary : colors.border,
                  },
                ]}>
                <TextInput
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    if (error) setError('');
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  placeholder="Enter password"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { fontSize: px(16) }]}
                />
                <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                  {showPassword ? (
                    <EyeOff size={18} color={colors.grey} strokeWidth={2.2} />
                  ) : (
                    <Eye size={18} color={colors.grey} strokeWidth={2.2} />
                  )}
                </Pressable>
              </View>

              <AuthToast message={error} type="error" />

              <Pressable
                disabled={!canSubmit}
                onPress={() => void handleLogin()}
                style={({ pressed }) => [
                  styles.loginBtn,
                  {
                    marginTop: px(spacing.lg),
                    minHeight: px(54),
                    borderRadius: px(14),
                  },
                  !canSubmit && styles.loginBtnDisabled,
                  pressed && canSubmit && styles.pressed,
                ]}>
                <Lock size={px(18)} color={colors.dark} strokeWidth={2.4} />
                <Text style={[styles.loginLabel, { fontSize: px(16) }]}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('PartnerLogin', { role: 'driver' })}
                style={({ pressed }) => [
                  styles.switchRow,
                  { marginTop: px(spacing.lg) },
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.switchText, { fontSize: px(13) }]}>
                  Self driver? <Text style={styles.switchLink}>Use OTP login</Text>
                </Text>
              </Pressable>
            </View>

            <View style={[styles.secureRow, { marginTop: px(spacing.xl) }]}>
              <ShieldCheck size={16} color={colors.primary} strokeWidth={2.2} />
              <Text style={[styles.secureText, { fontSize: px(12) }]}>
                Ask your vendor if you forgot your Login ID or password
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <AuthLoadingOverlay visible={loading} label="Signing in..." />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBlock: { alignItems: 'center' },
  brandRace: {
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 0.5,
  },
  brandPartner: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.6,
  },
  title: {
    marginTop: spacing.md,
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.grey,
  },
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
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
  label: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  inputWrap: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.dark,
    fontWeight: typography.weights.medium,
    paddingVertical: spacing.md,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
  },
  loginBtnDisabled: { opacity: 0.5 },
  loginLabel: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  switchRow: { alignItems: 'center' },
  switchText: { color: colors.grey, textAlign: 'center' },
  switchLink: {
    color: '#2563EB',
    fontWeight: typography.weights.semibold,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  secureText: { color: colors.grey, textAlign: 'center', flex: 1 },
  pressed: { opacity: 0.9 },
});
