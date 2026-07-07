import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ServiceDetailScreenLayout, {
  useServiceDetailMetrics,
} from '../components/services/ServiceDetailScreenLayout';
import { images } from '../assets';
import {
  DRIVER_ACCENT,
  DRIVER_LIGHT_BG,
  DRIVER_SERVICE_LIST,
  DRIVER_WHY_CHOOSE_US,
} from '../constants/driverBooking';
import { useDriverBooking } from '../context/DriverBookingContext';
import type { HomeStackParamList } from '../types/navigation';
import type { DriverTypeId } from '../types/driverBooking';
import { colors, shadows, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'DriverService'>;

function ServiceIcon({ id, size }: { id: DriverTypeId; size: number }) {
  const circleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: DRIVER_LIGHT_BG,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  switch (id) {
    case 'part_time':
      return (
        <View style={circleStyle}>
          <Ionicons name="time-outline" size={size * 0.5} color={DRIVER_ACCENT} />
        </View>
      );
    case 'full_time':
      return (
        <View style={circleStyle}>
          <Ionicons name="calendar-outline" size={size * 0.5} color={DRIVER_ACCENT} />
        </View>
      );
    case 'outstation':
      return (
        <View style={circleStyle}>
          <MaterialCommunityIcons name="road-variant" size={size * 0.5} color={DRIVER_ACCENT} />
        </View>
      );
    case 'night':
      return (
        <View style={circleStyle}>
          <Ionicons name="moon-outline" size={size * 0.5} color={DRIVER_ACCENT} />
        </View>
      );
    default:
      return null;
  }
}

export default function DriverServiceScreen({ navigation }: Props) {
  const { px } = useServiceDetailMetrics();
  const { updateBooking, resetBooking } = useDriverBooking();

  const handleBook = (driverType: DriverTypeId) => {
    resetBooking();
    updateBooking({ driverType });

    if (driverType === 'full_time') {
      navigation.navigate('DriverEnquiry');
      return;
    }

    navigation.navigate('DriverDateTime');
  };

  return (
    <ServiceDetailScreenLayout>
      <View
        style={[
          {
            borderRadius: px(18),
            overflow: 'hidden',
            marginBottom: px(16),
            height: px(168),
            backgroundColor: DRIVER_LIGHT_BG,
          },
          shadows.card,
        ]}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1, padding: px(16), justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: px(22),
                fontWeight: typography.weights.extrabold,
                color: colors.dark,
                marginBottom: px(6),
              }}>
              Driver Service
            </Text>
            <Text
              style={{
                fontSize: px(13),
                color: colors.grey,
                lineHeight: px(18),
                marginBottom: px(12),
              }}>
              Hire verified drivers anytime, anywhere.
            </Text>
            <View
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: px(6),
                backgroundColor: colors.background,
                borderRadius: px(20),
                paddingHorizontal: px(10),
                paddingVertical: px(6),
              }}>
              <View
                style={{
                  width: px(8),
                  height: px(8),
                  borderRadius: px(4),
                  backgroundColor: colors.success,
                }}
              />
              <Text
                style={{
                  fontSize: px(12),
                  fontWeight: typography.weights.semibold,
                  color: colors.success,
                }}>
                Drivers Available
              </Text>
            </View>
          </View>

          <View
            style={{
              width: px(140),
              height: px(168),
              alignItems: 'center',
              justifyContent: 'flex-end',
              overflow: 'hidden',
            }}>
            <Image
              source={images.booking.driverRamesh}
              style={{ width: px(130), height: px(148) }}
              resizeMode="contain"
            />
            <Image
              source={images.raceLogoFull}
              style={{
                position: 'absolute',
                top: px(8),
                right: px(8),
                width: px(32),
                height: px(32),
              }}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <View style={{ gap: px(12), marginBottom: px(18) }}>
        {DRIVER_SERVICE_LIST.map(service => (
          <Pressable
            key={service.id}
            onPress={() => handleBook(service.id)}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: px(10),
                borderRadius: px(16),
                borderWidth: 1,
                borderColor: colors.border,
                borderLeftWidth: px(4),
                borderLeftColor: DRIVER_ACCENT,
                backgroundColor: colors.background,
                paddingVertical: px(14),
                paddingRight: px(12),
                paddingLeft: px(10),
              },
              shadows.card,
            ]}>
            <ServiceIcon id={service.id} size={px(48)} />

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                numberOfLines={2}
                style={{
                  fontSize: px(15),
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                  marginBottom: px(4),
                }}>
                {service.label}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: px(13),
                  fontWeight: typography.weights.bold,
                  color: DRIVER_ACCENT,
                }}>
                {service.priceLabel}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(2), flexShrink: 0 }}>
              <Text
                style={{
                  fontSize: px(12),
                  fontWeight: typography.weights.bold,
                  color: DRIVER_ACCENT,
                }}>
                Book Now
              </Text>
              <Ionicons name="arrow-forward" size={px(14)} color={DRIVER_ACCENT} />
            </View>
          </Pressable>
        ))}
      </View>

      <View
        style={{
          backgroundColor: DRIVER_LIGHT_BG,
          borderRadius: px(16),
          padding: px(16),
          marginBottom: px(16),
        }}>
        <Text
          style={{
            fontSize: px(16),
            fontWeight: typography.weights.bold,
            color: colors.dark,
            marginBottom: px(14),
          }}>
          Why Choose Us?
        </Text>
        <View style={{ gap: px(12) }}>
          {DRIVER_WHY_CHOOSE_US.map(item => (
            <View
              key={item}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: px(10),
              }}>
              <View
                style={{
                  width: px(22),
                  height: px(22),
                  borderRadius: px(11),
                  backgroundColor: DRIVER_ACCENT,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                <Ionicons name="checkmark" size={px(12)} color={colors.background} />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: px(13),
                  color: colors.dark,
                  lineHeight: px(18),
                }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ServiceDetailScreenLayout>
  );
}
