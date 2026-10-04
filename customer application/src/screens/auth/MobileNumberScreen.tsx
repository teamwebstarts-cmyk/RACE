import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TextInput } from 'react-native';

import { AUTH_COLORS as COLORS, AUTH_DESIGN_WIDTH } from '../../components/auth/authDesign';
import {
  AuthHeader,
  GoldButton,
  HeadsetIcon,
  MobileNumberField,
  ScreenDivider,
  ShieldIcon,
  SupportCard,
  VerificationHint,
  noFontPadding,
} from '../../components/auth/AuthPhoneChrome';
import {
  LoginIllustration,
  SignupIllustration,
} from '../../components/auth/AuthSceneIllustrations';
import AuthToast, { AuthLoadingOverlay } from '../../components/auth/AuthToast';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearSignupPath, setSignupPath } from '../../redux/onboarding/onboardingSlice';
import {
  getApiErrorMessage,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '../../services/auth/useAuthMutations';
import { getRoleMismatchMessage, isRoleMismatchError } from '../../utils/roleMismatch';
import type { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'MobileNumber'>;

const MOBILE_REGEX = /^[6-9]\d{9}$/;

/** TEMP: skip OTP UI — auto-verify with backend dev OTP. Re-enable OTP by flipping this off. */
const SKIP_OTP_AUTH = true;

function extractOtpFromMessage(message?: string): string | null {
  if (!message) return null;
  const match = message.match(/\b(\d{6})\b/);
  return match?.[1] ?? null;
}

export default function MobileNumberScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(state => state.auth.loading);
  const signupAccountType = useAppSelector(state => state.onboarding.signupAccountType);
  const signupVendorType = useAppSelector(state => state.onboarding.signupVendorType);
  const partnerSignupRequired = useAppSelector(state => state.onboarding.partnerSignupRequired);

  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width, 430);
  const scale = screenWidth / AUTH_DESIGN_WIDTH;

  const isSignup = Boolean(signupAccountType);
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('+91');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [error, setError] = useState('');

  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();

  const missingHeight = viewportHeight ? Math.max(0, 780 * scale - viewportHeight) : 0;
  const signupArtworkGap = Math.max(100 * scale, 128 * scale - missingHeight);

  const switchMode = (nextMode: 'login' | 'signup') => {
    Keyboard.dismiss();
    setError('');
    if (nextMode === 'signup') {
      dispatch(setSignupPath({ accountType: 'customer', vendorType: null }));
    } else {
      dispatch(clearSignupPath());
    }
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleBack = () => {
    if (isSignup) {
      switchMode('login');
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    const parent = navigation.getParent();
    if (parent?.canGoBack()) parent.goBack();
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isSignup) {
        switchMode('login');
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [isSignup]);

  useEffect(() => {
    setViewportHeight(0);
  }, [screenWidth]);

  const handleContinue = async () => {
    const digits = phone.replace(/\D/g, '');
    setError('');

    if (!MOBILE_REGEX.test(digits)) {
      inputRef.current?.focus();
      setError('Enter a valid 10-digit mobile number');
      return;
    }

    Keyboard.dismiss();

    try {
      const result = await sendOtpMutation.mutateAsync({ mobileNumber: digits });
      const isExistingUser = result.isExistingUser ?? false;
      if (isExistingUser) {
        dispatch(clearSignupPath());
      }

      if (SKIP_OTP_AUTH) {
        const otp = result.devOtp ?? extractOtpFromMessage(result.message);
        if (!otp) {
          setError('Dev OTP unavailable. Turn off SKIP_OTP_AUTH or use a non-production API.');
          return;
        }
        const verifyResult = await verifyOtpMutation.mutateAsync({ mobileNumber: digits, otp });
        if (isExistingUser || verifyResult.user.isProfileCompleted) {
          dispatch(clearSignupPath());
        }
        if (verifyResult.onboardingRequired && !verifyResult.user.isProfileCompleted) {
          navigation.replace('ProfileWizard');
          return;
        }
        if (partnerSignupRequired && signupVendorType && verifyResult.user.isProfileCompleted) {
          navigation.replace('VendorWizard', { vendorType: signupVendorType });
          return;
        }
        return;
      }

      navigation.navigate('OtpVerification', {
        mobileNumber: digits,
        isExistingUser,
        devOtp: result.devOtp,
        otpMessage: result.message,
      });
    } catch (err) {
      if (isRoleMismatchError(err)) {
        setError(
          getRoleMismatchMessage(
            err,
            'This number is registered as a partner. Use the RACE Partner app or a different number.',
          ),
        );
        return;
      }
      setError(getApiErrorMessage(err, SKIP_OTP_AUTH ? 'Unable to sign in' : 'Unable to send OTP'));
    }
  };

  const handleHelp = () => {
    Alert.alert('24/7 roadside support', "We're here whenever you need us.");
  };

  const handleTerms = () => {
    Alert.alert('Terms & Privacy', "RACE's Terms and Privacy Policy will open here.");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={{ width: screenWidth, alignSelf: 'center' }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          onLayout={({ nativeEvent }) => {
            const measuredHeight = nativeEvent.layout.height;
            setViewportHeight(previous => Math.max(previous, measuredHeight));
          }}>
          <View
            style={{
              width: screenWidth,
              flexGrow: 1,
              minHeight: viewportHeight || undefined,
              backgroundColor: COLORS.background,
            }}>
            <AuthHeader scale={scale} onBack={handleBack} />

            {isSignup ? (
              <>
                <View style={{ height: 132 * scale + signupArtworkGap }}>
                  <SignupIllustration
                    scale={scale}
                    top={81 * scale - (128 * scale - signupArtworkGap)}
                  />
                  <View style={{ marginTop: 24 * scale, marginHorizontal: 18 * scale }}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                      style={[
                        noFontPadding,
                        {
                          height: 45 * scale,
                          color: '#111318',
                          fontSize: 36 * scale,
                          lineHeight: 45 * scale,
                          fontWeight: '700',
                          letterSpacing: -1.15 * scale,
                        },
                      ]}>
                      Let's get you moving
                    </Text>
                    <Text
                      style={[
                        noFontPadding,
                        {
                          height: 56 * scale,
                          marginTop: 7 * scale,
                          color: COLORS.secondary,
                          fontSize: 18 * scale,
                          lineHeight: 28 * scale,
                        },
                      ]}>
                      {'Create your RACE account in a few\nseconds.'}
                    </Text>
                  </View>
                </View>

                <MobileNumberField
                  scale={scale}
                  isSignup
                  country={country}
                  phone={phone}
                  inputRef={inputRef}
                  onPhoneChange={value => {
                    setPhone(value.replace(/[^\d\s]/g, ''));
                    if (error) setError('');
                  }}
                  onCountryPress={() => {
                    Keyboard.dismiss();
                    setCountryPickerVisible(true);
                  }}
                  onSubmit={() => void handleContinue()}
                />

                {error ? (
                  <View style={{ marginHorizontal: 18 * scale, marginTop: 10 * scale }}>
                    <AuthToast message={error} type="error" />
                  </View>
                ) : null}

                <VerificationHint scale={scale} isSignup />
                <GoldButton
                  scale={scale}
                  isSignup
                  onPress={() => void handleContinue()}
                  disabled={loading}
                />

                <View style={{ height: 42 * scale, marginTop: 18 * scale, alignItems: 'center' }}>
                  <Text
                    style={[
                      noFontPadding,
                      {
                        color: '#878590',
                        fontSize: 13 * scale,
                        lineHeight: 21 * scale,
                      },
                    ]}>
                    By continuing, you agree to RACE's
                  </Text>
                  <Pressable accessibilityRole="link" onPress={handleTerms} hitSlop={5}>
                    <Text
                      style={[
                        noFontPadding,
                        {
                          color: COLORS.orange,
                          fontSize: 14 * scale,
                          lineHeight: 21 * scale,
                        },
                      ]}>
                      Terms & Privacy Policy.
                    </Text>
                  </Pressable>
                </View>

                <View style={{ marginTop: 'auto', paddingTop: 25 * scale }}>
                  <ScreenDivider scale={scale} isSignup />
                  <View
                    style={{
                      height: 22 * scale,
                      marginTop: 20 * scale,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={[
                        noFontPadding,
                        {
                          color: '#46474E',
                          fontSize: 16 * scale,
                          lineHeight: 22 * scale,
                        },
                      ]}>
                      Already have an account?
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => switchMode('login')}
                      hitSlop={6}
                      style={{ marginLeft: 7 * scale }}>
                      <Text
                        style={[
                          noFontPadding,
                          {
                            color: COLORS.orange,
                            fontSize: 16 * scale,
                            lineHeight: 22 * scale,
                          },
                        ]}>
                        Sign in
                      </Text>
                    </Pressable>
                  </View>
                  <SupportCard scale={scale} onPress={handleHelp} />
                </View>
              </>
            ) : (
              <>
                <LoginIllustration scale={scale} />
                <Text
                  style={[
                    noFontPadding,
                    {
                      height: 46 * scale,
                      marginTop: 17 * scale,
                      color: '#17191E',
                      fontSize: 38 * scale,
                      lineHeight: 46 * scale,
                      fontWeight: '800',
                      letterSpacing: -1.35 * scale,
                      textAlign: 'center',
                    },
                  ]}>
                  Welcome back
                </Text>
                <Text
                  style={[
                    noFontPadding,
                    {
                      height: 26 * scale,
                      marginTop: 7 * scale,
                      color: '#777785',
                      fontSize: 19 * scale,
                      lineHeight: 26 * scale,
                      textAlign: 'center',
                    },
                  ]}>
                  Let's get you back on the road.
                </Text>

                <View style={{ marginTop: 33 * scale }}>
                  <MobileNumberField
                    scale={scale}
                    isSignup={false}
                    country={country}
                    phone={phone}
                    inputRef={inputRef}
                    onPhoneChange={value => {
                      setPhone(value.replace(/[^\d\s]/g, ''));
                      if (error) setError('');
                    }}
                    onCountryPress={() => {
                      Keyboard.dismiss();
                      setCountryPickerVisible(true);
                    }}
                    onSubmit={() => void handleContinue()}
                  />
                </View>

                {error ? (
                  <View style={{ marginHorizontal: 24 * scale, marginTop: 10 * scale }}>
                    <AuthToast message={error} type="error" />
                  </View>
                ) : null}

                <VerificationHint scale={scale} isSignup={false} />
                <GoldButton
                  scale={scale}
                  isSignup={false}
                  onPress={() => void handleContinue()}
                  disabled={loading}
                />
                <ScreenDivider scale={scale} isSignup={false} marginTop={30} />

                <View
                  style={{
                    height: 23 * scale,
                    marginTop: 29 * scale,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={[
                      noFontPadding,
                      {
                        color: '#494951',
                        fontSize: 16 * scale,
                        lineHeight: 23 * scale,
                      },
                    ]}>
                    New to RACE?
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => switchMode('signup')}
                    hitSlop={6}
                    style={{ marginLeft: 6 * scale }}>
                    <Text
                      style={[
                        noFontPadding,
                        {
                          color: COLORS.orange,
                          fontSize: 16 * scale,
                          lineHeight: 23 * scale,
                        },
                      ]}>
                      Create account
                    </Text>
                  </Pressable>
                </View>

                <View
                  style={{
                    marginTop: 'auto',
                    paddingBottom: 6 * scale,
                    alignItems: 'center',
                  }}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleHelp}
                    style={{
                      height: 24 * scale,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <HeadsetIcon size={22 * scale} />
                    <Text
                      style={[
                        noFontPadding,
                        {
                          marginLeft: 5 * scale,
                          color: COLORS.orange,
                          fontSize: 14 * scale,
                          lineHeight: 20 * scale,
                        },
                      ]}>
                      Need help?
                    </Text>
                  </Pressable>
                  <View
                    style={{
                      height: 25 * scale,
                      marginTop: 12 * scale,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <ShieldIcon size={23 * scale} />
                    <Text
                      style={[
                        noFontPadding,
                        {
                          marginLeft: 8 * scale,
                          color: '#90909C',
                          fontSize: 13 * scale,
                          lineHeight: 19 * scale,
                        },
                      ]}>
                      Your data is safe and secure with RACE.
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={countryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable
            onPress={() => setCountryPickerVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.countrySheet, { width: Math.min(width - 48, 350) }]}>
            <Text style={styles.countryHeading}>Select country code</Text>
            {[
              { name: 'India', code: '+91' },
              { name: 'United States', code: '+1' },
              { name: 'United Kingdom', code: '+44' },
            ].map(item => (
              <Pressable
                key={item.code}
                onPress={() => {
                  setCountry(item.code);
                  setCountryPickerVisible(false);
                }}
                style={styles.countryRow}>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryCode}>{item.code}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <AuthLoadingOverlay
        visible={loading}
        label={
          SKIP_OTP_AUTH
            ? isSignup
              ? 'Creating account...'
              : 'Signing in...'
            : 'Sending OTP...'
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 20, 25, 0.36)',
  },
  countrySheet: {
    paddingHorizontal: 22,
    paddingTop: 23,
    paddingBottom: 12,
    borderRadius: 20,
    backgroundColor: '#FFFEFC',
    shadowColor: '#000000',
    shadowOpacity: 0.13,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  countryHeading: {
    marginBottom: 13,
    color: COLORS.ink,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
    includeFontPadding: false,
  },
  countryRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.divider,
  },
  countryName: {
    color: '#33343B',
    fontSize: 16,
    includeFontPadding: false,
  },
  countryCode: {
    color: COLORS.orange,
    fontSize: 16,
    fontWeight: '600',
    includeFontPadding: false,
  },
});
