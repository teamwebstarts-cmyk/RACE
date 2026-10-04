import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TextInput } from 'react-native';

import {
  AUTH_COLORS as COLORS,
  AUTH_DESIGN_HEIGHT,
  AUTH_DESIGN_WIDTH,
  AUTH_HERO_RATIO,
} from '../../components/auth/authDesign';
import {
  AuthHeader,
  GoldButton,
  HeadsetIcon,
  MobileNumberField,
  ScreenDivider,
  ShieldIcon,
  SupportCard,
  TermsAgreeRow,
  VerificationHint,
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

  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const screenWidth = Math.min(width, 430);
  const innerHeight = height - insets.top - insets.bottom;
  const scale = Math.min(screenWidth / AUTH_DESIGN_WIDTH, innerHeight / AUTH_DESIGN_HEIGHT);

  const isSignup = Boolean(signupAccountType);
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('+91');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [error, setError] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(!isSignup);

  const inputRef = useRef<TextInput>(null);
  const compact = keyboardHeight > 80 ? 0.58 : 1;
  const heroHeight = screenWidth * AUTH_HERO_RATIO * compact;

  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();

  const switchMode = (nextMode: 'login' | 'signup') => {
    Keyboard.dismiss();
    setError('');
    setTermsAccepted(nextMode === 'login');
    if (nextMode === 'signup') {
      dispatch(setSignupPath({ accountType: 'customer', vendorType: null }));
    } else {
      dispatch(clearSignupPath());
    }
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
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleContinue = async () => {
    const digits = phone.replace(/\D/g, '');
    setError('');

    if (!MOBILE_REGEX.test(digits)) {
      inputRef.current?.focus();
      setError('Enter a valid 10-digit mobile number');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept Terms & Privacy to continue');
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
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 8}>
        <View style={[styles.fill, { width: screenWidth, alignSelf: 'center' }]}>
          <AuthHeader scale={scale} onBack={handleBack} />

          <View style={{ width: screenWidth, height: heroHeight, overflow: 'visible' }}>
            {isSignup ? (
              <SignupIllustration width={screenWidth} compact={compact} />
            ) : (
              <LoginIllustration width={screenWidth} compact={compact} />
            )}
          </View>

          <Text
            numberOfLines={1}
            style={{
              marginTop: 10 * scale,
              marginHorizontal: 24 * scale,
              color: '#0B0C10',
              fontSize: 28 * scale,
              lineHeight: 40 * scale,
              fontWeight: '800',
              letterSpacing: -0.6 * scale,
              textAlign: 'left',
              includeFontPadding: true,
            }}>
            {isSignup ? "Let's get you moving" : 'Welcome back'}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              marginTop: 4 * scale,
              marginHorizontal: 24 * scale,
              color: COLORS.secondary,
              fontSize: 16 * scale,
              lineHeight: 26 * scale,
              paddingBottom: 3 * scale,
              textAlign: 'left',
              includeFontPadding: true,
            }}>
            {isSignup ? 'Create your account in seconds.' : "Let's get you back on the road."}
          </Text>

          <View style={{ marginTop: 18 * scale }}>
            <MobileNumberField
              scale={scale}
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
            <View style={{ marginHorizontal: 24 * scale, marginTop: 8 * scale }}>
              <AuthToast message={error} type="error" />
            </View>
          ) : null}

          <VerificationHint scale={scale} />
          <TermsAgreeRow
            scale={scale}
            accepted={termsAccepted}
            onToggle={() => {
              setTermsAccepted(value => !value);
              if (error) setError('');
            }}
            onPressTerms={handleTerms}
          />
          <GoldButton
            scale={scale}
            isSignup={isSignup}
            onPress={() => void handleContinue()}
            disabled={loading}
          />

          <ScreenDivider scale={scale} isSignup={isSignup} marginTop={22} />
          <View
            style={{
              marginTop: 18 * scale,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: '#494951',
                fontSize: 16 * scale,
                lineHeight: 26 * scale,
                includeFontPadding: true,
                paddingBottom: 2 * scale,
              }}>
              {isSignup ? 'Already have an account?' : 'New to RACE?'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => switchMode(isSignup ? 'login' : 'signup')}
              hitSlop={6}
              style={{ marginLeft: 6 * scale }}>
              <Text
                style={{
                  color: COLORS.orange,
                  fontSize: 16 * scale,
                  lineHeight: 26 * scale,
                  includeFontPadding: true,
                  paddingBottom: 2 * scale,
                }}>
                {isSignup ? 'Sign in' : 'Create account'}
              </Text>
            </Pressable>
          </View>

          {isSignup ? (
            <>
              <View style={styles.flexSpacer} />
              <SupportCard scale={scale} onPress={handleHelp} />
            </>
          ) : (
            <>
              <View style={styles.flexSpacer} />

              <View style={{ marginBottom: 18 * scale, alignItems: 'center' }}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleHelp}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <HeadsetIcon size={22 * scale} />
                  <Text
                    style={{
                      marginLeft: 5 * scale,
                      color: COLORS.orange,
                      fontSize: 14 * scale,
                      lineHeight: 22 * scale,
                      paddingBottom: 2 * scale,
                      includeFontPadding: true,
                    }}>
                    Need help?
                  </Text>
                </Pressable>
                <View
                  style={{
                    marginTop: 10 * scale,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <ShieldIcon size={22 * scale} />
                  <Text
                    style={{
                      marginLeft: 8 * scale,
                      color: '#90909C',
                      fontSize: 13 * scale,
                      lineHeight: 22 * scale,
                      paddingBottom: 2 * scale,
                      includeFontPadding: true,
                    }}>
                    Your data is safe and secure with RACE.
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
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
  flexSpacer: { flex: 1, minHeight: 4 },
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
