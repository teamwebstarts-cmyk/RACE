import React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { Building2, Home, MapPin, Plus } from 'lucide-react-native';

import ProfileSubScreenLayout, { useProfilePx } from '../../components/profile/ProfileSubScreenLayout';
import { SAVED_LOCATIONS } from '../../constants/demo';
import { images } from '../../assets';
import { colors, shadows, typography } from '../../theme';

const ICONS = {
  Home,
  Building2,
  MapPin,
};

export default function SavedLocationsScreen() {
  const px = useProfilePx();

  return (
    <ProfileSubScreenLayout title="Saved Locations" subtitle="Your frequently used locations">
      {SAVED_LOCATIONS.map(location => {
        const Icon = ICONS[location.icon as keyof typeof ICONS] ?? MapPin;
        return (
          <View
            key={location.id}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: px(12),
                borderRadius: px(14),
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.background,
                padding: px(14),
                marginBottom: px(10),
              },
              shadows.card,
            ]}>
            <View
              style={{
                width: px(40),
                height: px(40),
                borderRadius: px(20),
                backgroundColor: colors.goldLight,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
              <Icon size={px(18)} color={colors.primary} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: px(14),
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                  marginBottom: px(2),
                }}>
                {location.label}
              </Text>
              <Text numberOfLines={2} style={{ fontSize: px(11), color: colors.grey, lineHeight: px(15) }}>
                {location.address}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(8) }}>
              <Pressable onPress={() => Alert.alert('Edit', location.label)}>
                <Text
                  style={{
                    fontSize: px(12),
                    fontWeight: typography.weights.bold,
                    color: colors.primary,
                  }}>
                  Edit
                </Text>
              </Pressable>
              <Text style={{ color: colors.border }}>|</Text>
              <Pressable onPress={() => Alert.alert('Delete', location.label)}>
                <Text
                  style={{
                    fontSize: px(12),
                    fontWeight: typography.weights.bold,
                    color: colors.error,
                  }}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      <Pressable
        onPress={() => Alert.alert('Add Location', 'Add location coming soon.')}
        style={{
          borderRadius: px(14),
          borderWidth: 1.5,
          borderColor: colors.primary,
          borderStyle: 'dashed',
          paddingVertical: px(22),
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: px(14),
        }}>
        <Plus size={px(26)} color={colors.primary} strokeWidth={2} />
        <Text
          style={{
            marginTop: px(6),
            fontSize: px(14),
            fontWeight: typography.weights.bold,
            color: colors.primary,
          }}>
          Add Location
        </Text>
      </Pressable>

      <View
        style={{
          height: px(180),
          borderRadius: px(14),
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
        }}>
        <Image
          source={images.booking.driverPickupMap}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
    </ProfileSubScreenLayout>
  );
}
