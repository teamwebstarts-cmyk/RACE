import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Phone, Smartphone } from 'lucide-react-native';

import FormField from '../../components/auth/FormField';
import GoldButton from '../../components/auth/GoldButton';
import OtpInput from '../../components/auth/OtpInput';
import ProfileSubScreenLayout, { useProfilePx } from '../../components/profile/ProfileSubScreenLayout';
import { DEMO_OTP } from '../../constants/auth';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { colors, typography } from '../../theme';

export default function ChangeMobileNumberScreen() {
  const px = useProfilePx();
  const authUser = useAuthStore(state => state.user);
  const profile = useProfileStore(state => state.profile);
  const fetchProfile = useProfileStore(state => state.fetchProfile);
  const [newPhone, setNewPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(0);

  const currentPhone = profile?.mobileNumber ?? authUser?.mobileNumber ?? '';

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = () => {
    if (!newPhone.trim() || newPhone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid mobile number.');
      return;
    }
    if (newPhone.replace(/\s/g, '') === currentPhone.replace(/\s/g, '')) {
      Alert.alert('Same Number', 'New number must be different from current number.');
      return;
    }
    setOtpSent(true);
    setTimer(30);
    setDigits(['', '', '', '', '', '']);
    Alert.alert('OTP Sent', `Verification code sent to ${newPhone}`);
  };

  const handleUpdate = () => {
    if (!otpSent) {
      handleSendOtp();
      return;
    }
    if (digits.join('') !== DEMO_OTP) {
      Alert.alert('Invalid OTP', 'Please enter the correct verification code.');
      return;
    }
    Alert.alert('Updated', `Your mobile number has been updated to ${newPhone}.`);
  };

  return (
    <ProfileSubScreenLayout
      title="Change Mobile Number"
      subtitle="Verify your new number with OTP">
      <View
        style={{
          borderRadius: px(14),
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.lightGrey,
          padding: px(14),
          marginBottom: px(16),
        }}>
        <Text style={{ fontSize: px(11), color: colors.grey, marginBottom: px(4) }}>Current Number</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(8) }}>
          <Smartphone size={px(18)} color={colors.primary} strokeWidth={2} />
          <Text style={{ fontSize: px(16), fontWeight: typography.weights.bold, color: colors.dark }}>
            {currentPhone || '—'}
          </Text>
        </View>
      </View>

      <FormField
        label="New Mobile Number"
        value={newPhone}
        onChangeText={setNewPhone}
        placeholder="+91 98765 43210"
        Icon={Phone}
        variant="outlined"
        compact
        keyboardType="phone-pad"
      />

      <Text style={{ fontSize: px(12), color: colors.grey, marginBottom: px(16), lineHeight: px(17) }}>
        We'll send a 6-digit OTP to your new number to confirm the change.
      </Text>

      {otpSent ? (
        <View style={{ marginBottom: px(16) }}>
          <Text
            style={{
              fontSize: px(13),
              fontWeight: typography.weights.bold,
              color: colors.dark,
              textAlign: 'center',
              marginBottom: px(12),
            }}>
            Enter Verification Code
          </Text>
          <OtpInput
            digits={digits}
            activeIndex={activeIndex}
            onChange={setDigits}
            onActiveIndexChange={setActiveIndex}
            px={px}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: px(14), gap: px(8) }}>
            {timer > 0 ? (
              <Text style={{ fontSize: px(12), color: colors.grey }}>Resend code in 00:{String(timer).padStart(2, '0')}</Text>
            ) : (
              <Pressable onPress={handleSendOtp}>
                <Text style={{ fontSize: px(12), fontWeight: typography.weights.bold, color: colors.primary }}>
                  Resend OTP
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : null}

      <GoldButton
        label={otpSent ? 'Update Mobile Number' : 'Send OTP'}
        onPress={handleUpdate}
        style={{ width: '100%' }}
        height={px(52)}
        borderRadius={px(14)}
      />
    </ProfileSubScreenLayout>
  );
}
