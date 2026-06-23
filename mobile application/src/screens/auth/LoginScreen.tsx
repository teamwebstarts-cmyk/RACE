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
import { Eye, EyeOff, Lock, Phone } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthLogo from '../../components/auth/AuthLogo';
import FormField from '../../components/auth/FormField';
import GoldButton from '../../components/auth/GoldButton';
import GoogleIcon from '../../components/auth/GoogleIcon';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const { login } = useAuth();
  const [phone, setPhone]                   = useState('+91 98765 43210');
  const [password, setPassword]             = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [phoneError, setPhoneError]         = useState('');
  const [passwordError, setPasswordError]   = useState('');

  const handleLogin = () => {
    let valid = true;
    setPhoneError('');
    setPasswordError('');
    if (!phone.trim()) {
      setPhoneError('Please enter mobile number');
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError('Please enter password');
      valid = false;
    }
    if (valid) login();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingHorizontal: px(24),
              paddingTop:        px(4),
              paddingBottom:     px(16),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.main}>

            {/* Logo */}
            <AuthLogo width={px(340)} />

            {/* Welcome heading */}
            <Text style={{
              marginTop:  px(20),
              fontSize:   px(26),
              fontWeight: typography.weights.extrabold,
              color:      colors.dark,
              textAlign:  'center',
            }}>
              Welcome Back 👋
            </Text>

            {/* Subtitle */}
            <Text style={{
              marginTop:    px(6),
              marginBottom: px(24),
              fontSize:     px(14),
              color:        colors.grey,
              textAlign:    'center',
              lineHeight:   px(20),
            }}>
              Login to your account to continue
            </Text>

            {/* Mobile Number */}
            <FormField
              variant="outlined"
              compact
              scale={s}
              label="Mobile Number"
              Icon={Phone}
              value={phone}
              onChangeText={text => {
                setPhone(text);
                if (phoneError) setPhoneError('');
              }}
              keyboardType="phone-pad"
              returnKeyType="next"
              error={phoneError}
            />

            {/* Password */}
            <FormField
              variant="outlined"
              compact
              scale={s}
              label="Password"
              Icon={Lock}
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
              error={passwordError}
              rightElement={
                <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                  {showPassword ? (
                    <EyeOff size={px(20)} color={colors.grey} />
                  ) : (
                    <Eye size={px(20)} color={colors.grey} />
                  )}
                </Pressable>
              }
            />

            {/* Forgot Password */}
            <Pressable
              style={{
                alignSelf:    'flex-end',
                marginTop:    px(6),
                marginBottom: px(20),
              }}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={{
                color:      colors.primary,
                fontWeight: typography.weights.semibold,
                fontSize:   px(14),
              }}>
                Forgot Password?
              </Text>
            </Pressable>

            {/* Login Button */}
            <GoldButton
              label="Login"
              onPress={handleLogin}
              style={{ width: '100%' }}
              height={px(54)}
              labelSize={px(17)}
              borderRadius={px(14)}
            />

            {/* Divider */}
            <View style={{
              flexDirection:  'row',
              alignItems:     'center',
              marginVertical: px(20),
            }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text style={{
                marginHorizontal: px(12),
                fontSize:         px(13),
                color:            colors.grey,
              }}>
                or continue with
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>

            {/* Continue with Google — icon + text centered together */}
            <Pressable
              style={{
                flexDirection:     'row',
                alignItems:        'center',
                justifyContent:    'center',
                height:            px(54),
                borderRadius:      px(14),
                borderWidth:       1.5,
                borderColor:       colors.border,
                backgroundColor:   colors.background,
                paddingHorizontal: px(16),
                gap:               px(10),
              }}
              onPress={() => Alert.alert('Google Sign-In', 'Google sign-in coming soon')}
            >
              <GoogleIcon size={px(24)} />
              <Text style={{
                fontSize:   px(16),
                fontWeight: typography.weights.semibold,
                color:      colors.dark,
              }}>
                Continue with Google
              </Text>
            </Pressable>

          </View>

          {/* Footer */}
          <View style={[styles.footer, { paddingTop: px(4) }]}>
            <Text style={{ color: colors.grey, fontSize: px(14) }}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => navigation.navigate('CreateAccount')}>
              <Text style={{
                color:      colors.primary,
                fontWeight: typography.weights.bold,
                fontSize:   px(14),
              }}>
                Sign Up
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
    flex:            1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow:       1,
    justifyContent: 'space-between',
  },
  main: {
    width: '100%',
  },
  footer: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
  },
});
