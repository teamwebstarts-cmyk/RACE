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
  TOWING_SERVICE_LIST,
  TOWING_WHY_CHOOSE_US,
} from '../constants/towingBooking';
import { useTowingBooking } from '../context/TowingBookingContext';
import { brand } from '../theme/brand';
import type { HomeStackParamList } from '../types/navigation';
import type { TowingServiceModeId } from '../types/towingBooking';
import { colors, shadows, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingService'>;

export default function TowingServiceScreen({ navigation }: Props) {
  const { px } = useServiceDetailMetrics();
  const { updateBooking } = useTowingBooking();

  const bookTowing = (serviceMode: TowingServiceModeId) => {
    updateBooking({ serviceMode });
    navigation.navigate('TowingChooseVehicle');
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
          source={images.towingHeroBanner}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>

      <View style={{ gap: px(12), marginBottom: px(18) }}>
        {TOWING_SERVICE_LIST.map(service => (
          <Pressable
            key={service.id}
            onPress={() => bookTowing(service.id)}
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
              <service.Icon
                size={px(22)}
                color={service.iconColor ?? colors.primary}
                strokeWidth={2.5}
              />
            </View>

            <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: px(15),
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                  marginBottom: px(3),
                }}>
                {service.label}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: px(12),
                  color: colors.grey,
                  marginBottom: px(4),
                }}>
                {service.description}
              </Text>
              <Text
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
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: px(10),
          }}>
          {TOWING_WHY_CHOOSE_US.map(item => (
            <View
              key={item}
              style={{
                width: '47%',
                flexDirection: 'row',
                alignItems: 'center',
                gap: px(8),
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
                  fontSize: px(12),
                  color: colors.dark,
                  lineHeight: px(16),
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
        <Phone size={px(20)} color={colors.primary} strokeWidth={2.5} />
        <Text
          style={{
            fontSize: px(16),
            fontWeight: typography.weights.bold,
            color: colors.primary,
          }}>
          Call Directly
        </Text>
      </Pressable>
    </ServiceDetailScreenLayout>
  );
}
