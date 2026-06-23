import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';
import { ArrowRight, Check, Phone } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ServiceDetailScreenLayout, {
  useServiceDetailMetrics,
} from '../components/services/ServiceDetailScreenLayout';
import { images } from '../assets';
import {
  DRIVER_SERVICE_LIST,
  DRIVER_WHY_CHOOSE_US,
} from '../constants/driverBooking';
import { useDriverBooking } from '../context/DriverBookingContext';
import { brand } from '../theme/brand';
import type { HomeStackParamList } from '../types/navigation';
import type { DriverTypeId } from '../types/driverBooking';
import { colors, shadows, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'DriverService'>;

export default function DriverServiceScreen({ navigation }: Props) {
  const { px } = useServiceDetailMetrics();
  const { updateBooking } = useDriverBooking();

  const bookDriver = (driverType: DriverTypeId) => {
    updateBooking({ driverType });
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
          },
          shadows.card,
        ]}>
        <Image
          source={images.driverHeroBanner}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>

      <View style={{ gap: px(12), marginBottom: px(18) }}>
        {DRIVER_SERVICE_LIST.map(service => (
          <Pressable
            key={service.id}
            onPress={() => bookDriver(service.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: px(10),
              borderRadius: px(16),
              borderWidth: 1,
              borderColor: colors.border,
              borderLeftWidth: px(4),
              borderLeftColor: colors.primary,
              backgroundColor: colors.background,
              paddingVertical: px(14),
              paddingRight: px(12),
              paddingLeft: px(10),
            }}>
            <View
              style={{
                width: px(48),
                height: px(48),
                borderRadius: px(24),
                backgroundColor: colors.goldLight,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
              <Image
                source={service.image}
                style={{ width: px(28), height: px(28) }}
                resizeMode="contain"
              />
            </View>

            <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
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
                  color: colors.primary,
                }}>
                {service.priceLabel}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: px(2),
                flexShrink: 0,
              }}>
              <Text
                style={{
                  fontSize: px(12),
                  fontWeight: typography.weights.bold,
                  color: colors.primary,
                }}>
                Book Now
              </Text>
              <ArrowRight size={px(14)} color={colors.primary} strokeWidth={2.5} />
            </View>
          </Pressable>
        ))}
      </View>

      <View
        style={{
          backgroundColor: colors.goldLight,
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
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                <Check size={px(12)} color={colors.background} strokeWidth={3} />
              </View>
              <Text
                style={{
                  flex: 1,
                  minWidth: 0,
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

      <Pressable
        onPress={() => void Linking.openURL(`tel:${brand.phoneRaw}`)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: px(8),
          borderRadius: px(14),
          borderWidth: 1.5,
          borderColor: colors.primary,
          backgroundColor: colors.background,
          paddingVertical: px(16),
        }}>
        <Phone size={px(20)} color={colors.dark} strokeWidth={2.5} />
        <Text
          style={{
            fontSize: px(16),
            fontWeight: typography.weights.bold,
            color: colors.dark,
          }}>
          Call to Book
        </Text>
      </Pressable>
    </ServiceDetailScreenLayout>
  );
}
