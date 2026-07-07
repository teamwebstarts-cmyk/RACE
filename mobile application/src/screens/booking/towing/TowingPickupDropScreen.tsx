import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { ChevronRight, MapPin } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import LocationPickerModal from '../../../components/common/LocationPickerModal';
import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { useTowingBooking } from '../../../context/TowingBookingContext';
import { estimateTowingFare } from '../../../services/bookings/fareApi';
import { useSavedLocationsQuery } from '../../../services/profile/useProfileQueries';
import type { LocationResult } from '../../../types/location';
import type { HomeStackParamList } from '../../../types/navigation';
import { formatRupee } from '../../../utils/towingPricing';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingPickupDrop'>;

const TOWING_ACCENT = '#F59E0B';
const PLACEHOLDER = 'Select location';

function LocationCard({
  label,
  value,
  pinColor,
  isPickup,
  onPress,
  t,
}: {
  label: string;
  value: string;
  pinColor: string;
  isPickup: boolean;
  onPress: () => void;
  t: ReturnType<typeof useBookingTheme>['t'];
}) {
  const hasValue = value.trim().length > 0 && value !== PLACEHOLDER;

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.px(8),
          marginBottom: t.px(8),
        }}>
        <MapPin size={t.iconSm} color={pinColor} fill={pinColor} />
        <Text
          style={{
            fontSize: t.labelBold,
            fontWeight: typography.weights.bold,
            color: colors.dark,
          }}>
          {label}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: t.inputRadius,
          borderWidth: isPickup ? 1.5 : 1,
          borderColor: isPickup ? colors.primary : colors.border,
          backgroundColor: isPickup ? colors.goldLight : colors.background,
          paddingHorizontal: t.px(14),
          paddingVertical: t.px(14),
          gap: t.px(10),
        }}>
        <Text
          style={{
            flex: 1,
            fontSize: t.bodyLarge,
            fontWeight: hasValue ? typography.weights.semibold : typography.weights.regular,
            color: hasValue ? colors.dark : colors.grey,
            lineHeight: t.px(22),
          }}
          numberOfLines={2}>
          {hasValue ? value : PLACEHOLDER}
        </Text>
        <ChevronRight size={t.iconSm} color={colors.grey} />
      </View>
    </Pressable>
  );
}

function applyLocation(location: LocationResult) {
  return {
    address: location.address,
    lat: location.latitude,
    lng: location.longitude,
  };
}

export default function TowingPickupDropScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking, updateBooking } = useTowingBooking();
  const [pickup, setPickup] = useState(booking.pickup || PLACEHOLDER);
  const [pickupLat, setPickupLat] = useState(booking.pickupLat);
  const [pickupLng, setPickupLng] = useState(booking.pickupLng);
  const [drop, setDrop] = useState(booking.drop || PLACEHOLDER);
  const [dropLat, setDropLat] = useState(booking.dropLat);
  const [dropLng, setDropLng] = useState(booking.dropLng);
  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showDropPicker, setShowDropPicker] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(booking.distanceKm ?? null);
  const [farePreview, setFarePreview] = useState<number | null>(null);
  const [isLoadingFare, setIsLoadingFare] = useState(false);
  const { data: savedLocations = [] } = useSavedLocationsQuery();

  const canContinue =
    pickup.trim() &&
    pickup !== PLACEHOLDER &&
    drop.trim() &&
    drop !== PLACEHOLDER &&
    pickupLat != null &&
    pickupLng != null &&
    dropLat != null &&
    dropLng != null;

  useEffect(() => {
    if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
      setDistanceKm(null);
      setFarePreview(null);
      return;
    }

    let cancelled = false;

    async function loadFarePreview() {
      if (pickupLat == null || pickupLng == null || dropLat == null || dropLng == null) return;

      setIsLoadingFare(true);
      try {
        const estimate = await estimateTowingFare({
          pickup_lat: pickupLat,
          pickup_lng: pickupLng,
          dropoff_lat: dropLat,
          dropoff_lng: dropLng,
        });
        if (!cancelled) {
          setDistanceKm(estimate.fareBreakdown.distanceKm);
          setFarePreview(estimate.fareBreakdown.totalFare);
        }
      } catch {
        if (!cancelled) {
          setDistanceKm(null);
          setFarePreview(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingFare(false);
        }
      }
    }

    void loadFarePreview();
    return () => {
      cancelled = true;
    };
  }, [dropLat, dropLng, pickupLat, pickupLng]);

  return (
    <TowingBookingLayout
      title="Pickup & Drop Location"
      step={2}
      onBack={() => navigation.goBack()}
      continueDisabled={!canContinue}
      onContinue={() => {
        updateBooking({
          pickup,
          pickupLat,
          pickupLng,
          drop,
          dropLat,
          dropLng,
          distanceKm: distanceKm ?? undefined,
        });
        navigation.navigate('TowingSelectType');
      }}>
      <View
        style={[
          {
            borderRadius: t.cardRadius,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
            paddingHorizontal: t.px(18),
            paddingTop: t.px(18),
            paddingBottom: t.px(16),
          },
          shadows.card,
        ]}>
        <LocationCard
          label="Pickup"
          value={pickup}
          pinColor={colors.primary}
          isPickup
          onPress={() => setShowPickupPicker(true)}
          t={t}
        />

        <View style={{ height: t.px(18) }} />

        <LocationCard
          label="Drop"
          value={drop}
          pinColor={colors.error}
          isPickup={false}
          onPress={() => setShowDropPicker(true)}
          t={t}
        />
      </View>

      {pickupLat && pickupLng && dropLat && dropLng ? (
        <View
          style={{
            marginTop: t.px(14),
            borderRadius: t.cardRadius,
            borderWidth: 1,
            borderColor: TOWING_ACCENT,
            backgroundColor: '#FEF3C7',
            padding: t.px(14),
            gap: t.px(6),
          }}>
          {isLoadingFare ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.px(8) }}>
              <ActivityIndicator color={TOWING_ACCENT} size="small" />
              <Text style={{ fontSize: t.caption, color: colors.grey }}>
                Calculating route distance...
              </Text>
            </View>
          ) : (
            <>
              {distanceKm != null ? (
                <Text style={{ fontSize: t.body, color: colors.dark }}>
                  Distance: <Text style={{ fontWeight: typography.weights.bold }}>{distanceKm} km</Text>
                </Text>
              ) : null}
              {farePreview != null ? (
                <Text style={{ fontSize: t.body, color: colors.dark }}>
                  Estimated fare:{' '}
                  <Text style={{ fontWeight: typography.weights.bold, color: TOWING_ACCENT }}>
                    {formatRupee(farePreview)}
                  </Text>
                </Text>
              ) : null}
            </>
          )}
        </View>
      ) : null}

      {savedLocations.length > 0 ? (
        <View style={{ marginTop: t.px(14), gap: t.px(8) }}>
          <Text
            style={{
              fontSize: t.labelBold,
              fontWeight: typography.weights.bold,
              color: colors.dark,
            }}>
            Saved addresses
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.px(8) }}>
            {savedLocations.map(loc => (
              <Pressable
                key={loc.id}
                onPress={() => {
                  const mapped = applyLocation({
                    address: loc.address,
                    city: '',
                    state: '',
                    pincode: '',
                    latitude: loc.latitude ?? 0,
                    longitude: loc.longitude ?? 0,
                    placeId: '',
                  });
                  setPickup(mapped.address);
                  setPickupLat(mapped.lat);
                  setPickupLng(mapped.lng);
                }}
                style={{
                  paddingHorizontal: t.px(12),
                  paddingVertical: t.px(8),
                  borderRadius: t.px(20),
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.goldLight,
                }}>
                <Text style={{ fontSize: t.caption, fontWeight: typography.weights.semibold, color: colors.dark }}>
                  {loc.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <LocationPickerModal
        visible={showPickupPicker}
        title="Confirm pickup spot"
        confirmLabel="Confirm pickup"
        accentColor={TOWING_ACCENT}
        initialLocation={
          pickupLat && pickupLng
            ? { latitude: pickupLat, longitude: pickupLng, address: pickup }
            : undefined
        }
        onClose={() => setShowPickupPicker(false)}
        onLocationSelected={location => {
          setPickup(location.address);
          setPickupLat(location.latitude);
          setPickupLng(location.longitude);
        }}
      />

      <LocationPickerModal
        visible={showDropPicker}
        title="Confirm drop spot"
        confirmLabel="Confirm drop"
        accentColor={colors.error}
        initialLocation={
          dropLat && dropLng ? { latitude: dropLat, longitude: dropLng, address: drop } : undefined
        }
        onClose={() => setShowDropPicker(false)}
        onLocationSelected={location => {
          setDrop(location.address);
          setDropLat(location.latitude);
          setDropLng(location.longitude);
        }}
      />
    </TowingBookingLayout>
  );
}
