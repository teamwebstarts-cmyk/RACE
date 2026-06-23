import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import {
  Calendar,
  Camera,
  ChevronDown,
  MapPin,
  Phone,
  Plus,
  User,
} from 'lucide-react-native';

import FormField from '../../components/auth/FormField';
import GoldButton from '../../components/auth/GoldButton';
import ProfileSubScreenLayout, { useProfilePx } from '../../components/profile/ProfileSubScreenLayout';
import { PROFILE_PERSONAL } from '../../constants/profileSubScreens';
import { USER } from '../../constants/demo';
import { colors, shadows, typography } from '../../theme';

export default function PersonalInformationScreen() {
  const px = useProfilePx();
  const [name, setName] = useState(USER.name);
  const [dob, setDob] = useState(PROFILE_PERSONAL.dob);
  const [gender, setGender] = useState(PROFILE_PERSONAL.gender);
  const [emergency, setEmergency] = useState(PROFILE_PERSONAL.emergency);
  const [address, setAddress] = useState(PROFILE_PERSONAL.address);

  const optionalTag = (
    <Text style={{ fontSize: px(11), color: colors.grey }}>(Optional)</Text>
  );

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
        />
        <FormField
          label="Date of Birth"
          value={dob}
          onChangeText={setDob}
          placeholder="Date of Birth"
          Icon={Calendar}
          variant="outlined"
          compact
          rightElement={optionalTag}
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
        />
      </View>

      <GoldButton
        label="Save Changes"
        onPress={() => Alert.alert('Saved', 'Your profile has been updated.')}
        style={shadows.card}
      />
    </ProfileSubScreenLayout>
  );
}
