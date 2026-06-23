import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Building2, Home, MapPin, PlusCircle } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { images } from '../../../assets';
import { DRIVER_SAVED_LOCATIONS } from '../../../constants/driverBooking';
import { useDriverBooking } from '../../../context/DriverBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'DriverPickup'>;

const LOCATION_ICONS = {
  home: Home,
  office: Building2,
} as const;

export default function DriverPickupScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking, updateBooking } = useDriverBooking();
  const [pickup, setPickup] = useState(booking.pickup);

  return (
    <TowingBookingLayout
      title="Where to pick you up?"
      step={3}
      onBack={() => navigation.goBack()}
      onContinue={() => {
        updateBooking({ pickup });
        navigation.navigate('DriverReview');
      }}>
      <View style={{ gap: t.px(16) }}>
        <View>
          <Text
            style={{
              fontSize: t.caption,
              fontWeight: typography.weights.semibold,
              color: colors.dark,
              marginBottom: t.px(8),
            }}>
            Pickup Location
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.px(10),
              borderRadius: t.inputRadius,
              borderWidth: 1.5,
              borderColor: colors.primary,
              backgroundColor: colors.background,
              paddingHorizontal: t.px(14),
              paddingVertical: t.px(14),
            }}>
            <MapPin size={t.iconSm} color={colors.primary} fill={colors.primary} />
            <Text
              style={{
                flex: 1,
                fontSize: t.bodyLarge,
                fontWeight: typography.weights.semibold,
                color: colors.dark,
                lineHeight: t.px(22),
              }}>
              {pickup}
            </Text>
          </View>
        </View>

        <View>
          <Text
            style={{
              fontSize: t.caption,
              fontWeight: typography.weights.semibold,
              color: colors.dark,
              marginBottom: t.px(10),
            }}>
            Saved Locations
          </Text>
          <View style={{ flexDirection: 'row', gap: t.px(10) }}>
            {DRIVER_SAVED_LOCATIONS.map(location => {
              const Icon = LOCATION_ICONS[location.id as keyof typeof LOCATION_ICONS] ?? Home;
              return (
                <Pressable
                  key={location.id}
                  onPress={() => setPickup(location.address)}
                  style={[
                    {
                      flex: 1,
                      alignItems: 'center',
                      gap: t.px(8),
                      borderRadius: t.inputRadius,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      paddingVertical: t.px(14),
                    },
                    shadows.card,
                  ]}>
                  <Icon size={t.iconSm} color={colors.dark} strokeWidth={2} />
                  <Text
                    style={{
                      fontSize: t.caption,
                      fontWeight: typography.weights.bold,
                      color: colors.dark,
                    }}>
                    {location.label}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              style={[
                {
                  flex: 1,
                  alignItems: 'center',
                  gap: t.px(8),
                  borderRadius: t.inputRadius,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  paddingVertical: t.px(14),
                },
                shadows.card,
              ]}>
              <PlusCircle size={t.iconSm} color={colors.primary} strokeWidth={2} />
              <Text
                style={{
                  fontSize: t.caption,
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                }}>
                Add New
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={{
            height: t.px(175),
            borderRadius: t.cardRadius,
            overflow: 'hidden',
          }}>
          <Image
            source={images.booking.driverPickupMap}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MapPin size={t.px(36)} color={colors.primary} fill={colors.primary} />
          </View>
        </View>
      </View>
    </TowingBookingLayout>
  );
}
