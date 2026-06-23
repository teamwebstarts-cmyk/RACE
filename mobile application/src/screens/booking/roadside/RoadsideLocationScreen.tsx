import React, { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { Crosshair, MapPin } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { images } from '../../../assets';
import { ROADSIDE_ACCENT } from '../../../constants/roadsideBooking';
import { useRoadsideBooking } from '../../../context/RoadsideBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoadsideLocation'>;

export default function RoadsideLocationScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking, updateBooking } = useRoadsideBooking();
  const [location, setLocation] = useState(booking.location);
  const [landmark, setLandmark] = useState(booking.landmark);

  return (
    <TowingBookingLayout
      title="Where are you?"
      step={2}
      accentColor={ROADSIDE_ACCENT}
      scrollable
      onBack={() => navigation.goBack()}
      onContinue={() => {
        updateBooking({ location, landmark });
        navigation.navigate('RoadsideReview');
      }}>
      <View style={{ gap: t.px(16) }}>
        <View
          style={{
            height: t.px(190),
            borderRadius: t.cardRadius,
            overflow: 'hidden',
          }}>
          <Image
            source={images.booking.roadsideLocationMap}
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
            <MapPin size={t.px(40)} color={ROADSIDE_ACCENT} fill={ROADSIDE_ACCENT} />
          </View>
        </View>

        <View>
          <Text
            style={{
              fontSize: t.sectionTitle,
              fontWeight: typography.weights.bold,
              color: colors.dark,
              marginBottom: t.px(8),
            }}>
            Location
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.px(10),
              borderRadius: t.inputRadius,
              borderWidth: 1.5,
              borderColor: ROADSIDE_ACCENT,
              backgroundColor: colors.background,
              paddingHorizontal: t.px(14),
              paddingVertical: t.px(14),
            }}>
            <MapPin size={t.iconSm} color={ROADSIDE_ACCENT} fill={ROADSIDE_ACCENT} />
            <Text
              style={{
                flex: 1,
                fontSize: t.bodyLarge,
                fontWeight: typography.weights.semibold,
                color: colors.dark,
              }}>
              {location}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setLocation('Patia Square, Bhubaneswar')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: t.px(8),
            borderRadius: t.inputRadius,
            backgroundColor: ROADSIDE_ACCENT,
            paddingVertical: t.px(14),
          }}>
          <Crosshair size={t.iconSm} color={colors.background} strokeWidth={2.5} />
          <Text
            style={{
              fontSize: t.labelBold,
              fontWeight: typography.weights.bold,
              color: colors.background,
            }}>
            Use My Current Location
          </Text>
        </Pressable>

        <View>
          <Text
            style={{
              fontSize: t.sectionTitle,
              fontWeight: typography.weights.bold,
              color: colors.dark,
              marginBottom: t.px(8),
            }}>
            Nearby Landmark (Optional)
          </Text>
          <TextInput
            value={landmark}
            onChangeText={setLandmark}
            placeholder="e.g. Near Patia Square Mall"
            placeholderTextColor={colors.grey}
            style={{
              borderRadius: t.inputRadius,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              paddingHorizontal: t.px(14),
              paddingVertical: t.px(14),
              fontSize: t.bodyLarge,
              fontWeight: typography.weights.semibold,
              color: colors.dark,
            }}
          />
        </View>
      </View>
    </TowingBookingLayout>
  );
}
