import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight, MapPin } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import LocationPickerModal from '../../../components/common/LocationPickerModal';
import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { DRIVER_ACCENT, DRIVER_LIGHT_BG } from '../../../constants/driverBooking';
import { useDriverBooking } from '../../../context/DriverBookingContext';
import { useSavedLocationsQuery } from '../../../services/profile/useProfileQueries';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'DriverBookingLocation'>;

const PLACEHOLDER = 'Select pickup location';

export default function DriverBookingLocationScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking, updateBooking } = useDriverBooking();
  const [pickup, setPickup] = useState(booking.pickup || PLACEHOLDER);
  const [pickupLat, setPickupLat] = useState(booking.pickupLat);
  const [pickupLng, setPickupLng] = useState(booking.pickupLng);
  const [showPicker, setShowPicker] = useState(false);
  const { data: savedLocations = [] } = useSavedLocationsQuery();

  const hasPickup = pickup.trim().length > 0 && pickup !== PLACEHOLDER;

  return (
    <TowingBookingLayout
      title="Pickup Location"
      step={2}
      accentColor={DRIVER_ACCENT}
      onBack={() => navigation.goBack()}
      continueDisabled={!hasPickup}
      onContinue={() => {
        updateBooking({ pickup, pickupLat, pickupLng });
        navigation.navigate('DriverBookingDateTime');
      }}>
      <Text
        style={{
          fontSize: t.bodyLarge,
          color: colors.grey,
          textAlign: 'center',
          marginBottom: t.px(16),
        }}>
        Where should the driver meet you?
      </Text>

      <Pressable onPress={() => setShowPicker(true)}>
        <View
          style={[
            {
              borderRadius: t.cardRadius,
              borderWidth: 2,
              borderColor: DRIVER_ACCENT,
              backgroundColor: DRIVER_LIGHT_BG,
              padding: t.px(16),
              marginBottom: t.px(16),
            },
            shadows.card,
          ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.px(10) }}>
            <MapPin size={t.iconSm} color={DRIVER_ACCENT} fill={DRIVER_ACCENT} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: t.labelBold,
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                  marginBottom: t.px(4),
                }}>
                Pickup Location
              </Text>
              <Text
                style={{
                  fontSize: t.body,
                  color: hasPickup ? colors.dark : colors.grey,
                  fontWeight: hasPickup ? typography.weights.semibold : typography.weights.regular,
                }}
                numberOfLines={2}>
                {hasPickup ? pickup : PLACEHOLDER}
              </Text>
              {hasPickup && pickupLat && pickupLng ? (
                <Text style={{ marginTop: t.px(4), fontSize: t.caption, color: colors.grey }}>
                  {pickupLat.toFixed(5)}, {pickupLng.toFixed(5)}
                </Text>
              ) : null}
            </View>
            <ChevronRight size={t.iconSm} color={colors.grey} />
          </View>
        </View>
      </Pressable>

      <Text
        style={{
          fontSize: t.sectionTitle,
          fontWeight: typography.weights.bold,
          color: colors.dark,
          marginBottom: t.px(10),
        }}>
        Saved Locations
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.px(10) }}>
        {savedLocations.length > 0
          ? savedLocations.map(location => (
              <Pressable
                key={location.id}
                onPress={() => {
                  setPickup(location.address);
                  setPickupLat(location.latitude);
                  setPickupLng(location.longitude);
                }}
                style={[
                  {
                    minWidth: '47%',
                    flexGrow: 1,
                    alignItems: 'center',
                    gap: t.px(8),
                    borderRadius: t.inputRadius,
                    borderWidth: pickup === location.address ? 2 : 1,
                    borderColor: pickup === location.address ? DRIVER_ACCENT : colors.border,
                    backgroundColor:
                      pickup === location.address ? DRIVER_LIGHT_BG : colors.background,
                    paddingVertical: t.px(14),
                    paddingHorizontal: t.px(8),
                  },
                  shadows.card,
                ]}>
                <Text
                  style={{
                    fontSize: t.caption,
                    fontWeight: typography.weights.bold,
                    color: colors.dark,
                    textAlign: 'center',
                  }}>
                  {location.label}
                </Text>
              </Pressable>
            ))
          : null}
      </View>

      <LocationPickerModal
        visible={showPicker}
        title="Confirm pickup spot"
        confirmLabel="Confirm pickup"
        accentColor={DRIVER_ACCENT}
        initialLocation={
          pickupLat && pickupLng
            ? { latitude: pickupLat, longitude: pickupLng, address: pickup }
            : undefined
        }
        onClose={() => setShowPicker(false)}
        onLocationSelected={location => {
          setPickup(location.address);
          setPickupLat(location.latitude);
          setPickupLng(location.longitude);
        }}
      />
    </TowingBookingLayout>
  );
}
