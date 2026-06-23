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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  Camera,
  ChevronDown,
  MapPin,
  Phone,
  Plus,
  User,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import FormField from '../../components/auth/FormField';
import GoldButton from '../../components/auth/GoldButton';
import StepHeader from '../../components/auth/StepHeader';
import { AUTH_USER } from '../../constants/auth';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, shadows, typography } from '../../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileSetup'>;

export default function ProfileSetupScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const [name, setName] = useState(AUTH_USER.name);
  const [dob, setDob] = useState('12 May 1998');
  const [gender, setGender] = useState('Male');
  const [emergency, setEmergency] = useState('+91 98765 43210');
  const [address, setAddress] = useState('123, MG Road, Bhubaneswar');
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

  const handleGenderPress = () => {
    Alert.alert('Select Gender', '', [
      { text: 'Male', onPress: () => setGender('Male') },
      { text: 'Female', onPress: () => setGender('Female') },
      { text: 'Other', onPress: () => setGender('Other') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleContinue = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Please enter your name';
    if (!emergency.trim()) nextErrors.emergency = 'Please enter emergency contact';
    if (!address.trim()) nextErrors.address = 'Please enter address';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      navigation.navigate('VehicleRegistration');
    }
  };

  const optionalTag = (
    <Text style={{ fontSize: px(11), color: colors.grey }}>(Optional)</Text>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{
            paddingHorizontal: px(24),
            paddingBottom: px(16),
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <StepHeader
            step={1}
            scale={s}
            onBack={() => navigation.goBack()}
            onSkip={() => navigation.navigate('VehicleRegistration')}
          />

          <Text
            style={{
              fontSize: px(24),
              fontWeight: typography.weights.extrabold,
              color: colors.dark,
              textAlign: 'center',
            }}>
            Complete Your Profile
          </Text>
          <Text
            style={{
              marginTop: px(6),
              marginBottom: px(22),
              fontSize: px(14),
              color: colors.grey,
              textAlign: 'center',
            }}>
            Help us serve you better.
          </Text>

          <Pressable
            style={{ alignItems: 'center', marginBottom: px(24) }}
            onPress={() => Alert.alert('Photo', 'Camera coming soon')}>
            <View
              style={{
                width: px(110),
                height: px(110),
                borderRadius: px(55),
                borderWidth: 2,
                borderColor: colors.primary,
                backgroundColor: colors.goldLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Camera size={px(32)} color={colors.primary} />
              <View
                style={{
                  position: 'absolute',
                  bottom: px(4),
                  right: px(4),
                  width: px(22),
                  height: px(22),
                  borderRadius: px(11),
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Plus size={px(12)} color={colors.background} strokeWidth={3} />
              </View>
            </View>
            <Text
              style={{
                marginTop: px(12),
                fontSize: px(14),
                fontWeight: typography.weights.bold,
                color: colors.primary,
              }}>
              Add Photo
            </Text>
            <Text style={{ fontSize: px(11), color: colors.grey, marginTop: px(2) }}>
              (Optional)
            </Text>
          </Pressable>

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
            label="Date of Birth"
            Icon={Calendar}
            value={dob}
            onPress={() => Alert.alert('Date of Birth', 'Date picker coming soon')}
            editable={false}
            rightElement={optionalTag}
          />

          <FormField
            variant="outlined"
            compact
            scale={s}
            label="Gender"
            Icon={User}
            value={gender}
            onPress={handleGenderPress}
            editable={false}
            rightElement={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(6) }}>
                {optionalTag}
                <ChevronDown size={px(18)} color={colors.grey} />
              </View>
            }
          />

          <FormField
            variant="outlined"
            compact
            scale={s}
            label="Emergency Contact"
            required
            Icon={Phone}
            iconColor={colors.error}
            value={emergency}
            onChangeText={text => {
              setEmergency(text);
              clearError('emergency');
            }}
            keyboardType="phone-pad"
            helperText="Used in case of emergency"
            helperColor={colors.error}
            error={errors.emergency}
          />

          <FormField
            variant="outlined"
            compact
            scale={s}
            label="Address"
            required
            Icon={MapPin}
            value={address}
            onChangeText={text => {
              setAddress(text);
              clearError('address');
            }}
            error={errors.address}
          />
        </ScrollView>

        <View
          style={{
            paddingHorizontal: px(24),
            paddingTop: px(12),
            paddingBottom: Math.max(insets.bottom, px(16)),
            backgroundColor: colors.background,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
          }}>
          <GoldButton
            label="Save & Continue"
            onPress={handleContinue}
            style={[styles.fullBtn, shadows.card]}
            height={px(54)}
            labelSize={px(17)}
            borderRadius={px(14)}
          />
        </View>
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
  fullBtn: {
    width: '100%',
  },
});
