import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import {
  Camera,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  Plus,
  User,
} from 'lucide-react-native';

import FormField from '../../components/auth/FormField';
import DateOfBirthField from '../../components/auth/DateOfBirthField';
import GoldButton from '../../components/auth/GoldButton';
import ProfileSubScreenLayout, { useProfilePx } from '../../components/profile/ProfileSubScreenLayout';
import { useProfileStore } from '../../store/profileStore';
import { getApiErrorMessage } from '../../services/api';
import { buildUpdateProfilePayload, validateProfileForm } from '../../utils/profilePayload';
import { colors, shadows, typography } from '../../theme';

export default function PersonalInformationScreen() {
  const px = useProfilePx();
  const { profile, fetchProfile, updateProfile, isLoading } = useProfileStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [emergency, setEmergency] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile) return;
    setName(profile.fullName ?? '');
    setEmail(profile.email ?? '');
    setDob(profile.dateOfBirth ?? '');
    setGender(profile.gender ?? '');
    setEmergency(profile.emergencyContact?.mobileNumber ?? '');
    setAddress(profile.address?.line1 ?? '');
  }, [profile]);

  const handleSave = async () => {
    const nextErrors = validateProfileForm({
      fullName: name,
      email,
      gender,
      dateOfBirth: dob,
      emergencyPhone: emergency,
      emergencyName: profile?.emergencyContact?.name,
      addressLine1: address,
      city: profile?.address?.city,
      state: profile?.address?.state,
      pincode: profile?.address?.pincode,
      country: profile?.address?.country,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await updateProfile(
        buildUpdateProfilePayload({
          fullName: name,
          email,
          gender,
          dateOfBirth: dob,
          emergencyPhone: emergency,
          emergencyName: profile?.emergencyContact?.name,
          addressLine1: address,
          city: profile?.address?.city,
          state: profile?.address?.state,
          pincode: profile?.address?.pincode,
          country: profile?.address?.country,
        }),
      );
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (error) {
      Alert.alert('Profile', getApiErrorMessage(error, 'Unable to update profile'));
    }
  };

  const optionalTag = (
    <Text style={{ fontSize: px(11), color: colors.grey }}>(Optional)</Text>
  );

  if (isLoading && !profile) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ProfileSubScreenLayout title="Personal Information" subtitle="Update your details">
      <Pressable
        style={{
          alignSelf: 'center',
          alignItems: 'center',
          marginBottom: px(22),
        }}>
        <View style={{ position: 'relative' }}>
          <View
            style={{
              width: px(88),
              height: px(88),
              borderRadius: px(44),
              backgroundColor: colors.goldLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Camera size={px(30)} color={colors.primary} strokeWidth={2} />
          </View>
          <View
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: px(26),
              height: px(26),
              borderRadius: px(13),
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: colors.background,
            }}>
            <Plus size={px(14)} color={colors.dark} strokeWidth={2.5} />
          </View>
        </View>
        <Text
          style={{
            marginTop: px(8),
            fontSize: px(13),
            fontWeight: typography.weights.bold,
            color: colors.primary,
          }}>
          Change Photo
        </Text>
      </Pressable>

      <View style={{ gap: px(12), marginBottom: px(20) }}>
        <FormField
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          Icon={User}
          variant="outlined"
          compact
          required
          error={errors.name}
        />
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="john@example.com"
          Icon={Mail}
          variant="outlined"
          compact
          required
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        <DateOfBirthField
          value={dob}
          onChange={setDob}
          error={errors.dob}
        />
        <FormField
          label="Gender"
          value={gender}
          onChangeText={() => {}}
          placeholder="Gender"
          Icon={User}
          variant="outlined"
          compact
          editable={false}
          onPress={() =>
            Alert.alert('Select Gender', '', [
              { text: 'Male', onPress: () => setGender('Male') },
              { text: 'Female', onPress: () => setGender('Female') },
              { text: 'Other', onPress: () => setGender('Other') },
              { text: 'Cancel', style: 'cancel' },
            ])
          }
          rightElement={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(6) }}>
              {optionalTag}
              <ChevronDown size={px(16)} color={colors.grey} />
            </View>
          }
        />
        <View>
          <FormField
            label="Emergency Contact"
            value={emergency}
            onChangeText={setEmergency}
            placeholder="Emergency Contact"
            Icon={Phone}
            variant="outlined"
            compact
            required
            iconColor={colors.error}
            keyboardType="phone-pad"
            error={errors.emergency}
          />
          <Text style={{ marginTop: px(4), fontSize: px(10), color: colors.error }}>
            Used in case of emergency
          </Text>
        </View>
        <FormField
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Address"
          Icon={MapPin}
          variant="outlined"
          compact
          required
          error={errors.address}
        />
      </View>

      <GoldButton
        label={isLoading ? 'Saving...' : 'Save Changes'}
        onPress={() => void handleSave()}
        style={shadows.card}
        disabled={isLoading}
      />
    </ProfileSubScreenLayout>
  );
}
