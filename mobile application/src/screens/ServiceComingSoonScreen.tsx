import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Bell, Check, Clock, Phone, Rocket } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ServiceDetailScreenLayout, {
  useServiceDetailMetrics,
} from '../components/services/ServiceDetailScreenLayout';
import { getComingSoonService } from '../constants/comingSoonServices';
import { brand } from '../theme/brand';
import type { HomeStackParamList } from '../types/navigation';
import { colors, shadows, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'ServiceComingSoon'>;

export default function ServiceComingSoonScreen({ route }: Props) {
  const { px } = useServiceDetailMetrics();
  const service = getComingSoonService(route.params.serviceId);

  if (!service) {
    return null;
  }

  return (
    <ServiceDetailScreenLayout>
      <View
        style={[
          {
            borderRadius: px(18),
            overflow: 'hidden',
            marginBottom: px(16),
            height: px(168),
            backgroundColor: colors.goldLight,
          },
          shadows.card,
        ]}>
        <Image
          source={service.image}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View
          style={{
            position: 'absolute',
            top: px(12),
            right: px(12),
            paddingHorizontal: px(10),
            paddingVertical: px(5),
            borderRadius: px(20),
            backgroundColor: colors.background,
          }}>
          <Text
            style={{
              fontSize: px(11),
              fontWeight: typography.weights.bold,
              color: colors.primary,
            }}>
            Coming Soon
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: px(16) }}>
        <Text
          style={{
            fontSize: px(24),
            fontWeight: typography.weights.extrabold,
            color: colors.dark,
            marginBottom: px(6),
          }}>
          {service.title}
        </Text>
        <Text
          style={{
            fontSize: px(14),
            color: colors.grey,
            lineHeight: px(20),
          }}>
          {service.tagline}
        </Text>
      </View>

      <View
        style={{
          borderRadius: px(14),
          backgroundColor: colors.goldLight,
          padding: px(16),
          marginBottom: px(16),
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(8) }}>
          <Rocket size={px(18)} color={colors.primary} strokeWidth={2.5} />
          <Text
            style={{
              fontSize: px(16),
              fontWeight: typography.weights.bold,
              color: colors.dark,
            }}>
            Launching Shortly
          </Text>
        </View>
        <Text
          style={{
            marginTop: px(8),
            fontSize: px(13),
            color: colors.grey,
            lineHeight: px(19),
          }}>
          We're putting the final touches on this service. Bookings will open
          soon — stay tuned!
        </Text>
        <View
          style={{
            marginTop: px(12),
            flexDirection: 'row',
            alignItems: 'center',
            gap: px(8),
          }}>
          <Clock size={px(16)} color={colors.primary} strokeWidth={2} />
          <Text
            style={{
              fontSize: px(13),
              fontWeight: typography.weights.semibold,
              color: colors.dark,
            }}>
            Expected to start from ₹{service.startingPrice}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: px(18),
          gap: px(8),
        }}>
        {service.highlights.map(item => (
          <View
            key={item.label}
            style={{
              flex: 1,
              minWidth: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: px(12),
              backgroundColor: colors.lightGrey,
              paddingVertical: px(14),
              paddingHorizontal: px(4),
              minHeight: px(58),
            }}>
            <Text
              style={{
                fontSize: px(12),
                fontWeight: typography.weights.bold,
                color: colors.dark,
                textAlign: 'center',
              }}>
              {item.highlight}
            </Text>
            <Text
              style={{
                marginTop: px(3),
                fontSize: px(10),
                color: colors.grey,
                textAlign: 'center',
                lineHeight: px(13),
              }}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          borderRadius: px(16),
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
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
          What to Expect
        </Text>
        <View style={{ gap: px(12) }}>
          {service.plannedFeatures.map(item => (
            <View
              key={item}
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: px(10) }}>
              <View
                style={{
                  width: px(22),
                  height: px(22),
                  borderRadius: px(11),
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: px(1),
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

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: px(10),
          borderRadius: px(14),
          backgroundColor: colors.goldLight,
          padding: px(14),
          marginBottom: px(12),
        }}>
        <View
          style={{
            width: px(40),
            height: px(40),
            borderRadius: px(20),
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
          <Bell size={px(18)} color={colors.primary} strokeWidth={2} />
        </View>
        <Text style={{ flex: 1, minWidth: 0, fontSize: px(12), color: colors.dark, lineHeight: px(17) }}>
          Want an alert when {service.title} goes live? Tap below and we'll notify you.
        </Text>
        <Pressable
          style={{
            paddingHorizontal: px(10),
            paddingVertical: px(10),
            borderRadius: px(10),
            backgroundColor: colors.primary,
            flexShrink: 0,
          }}>
          <Text
            style={{
              fontSize: px(11),
              fontWeight: typography.weights.bold,
              color: colors.dark,
              textAlign: 'center',
            }}>
            Notify{'\n'}Me
          </Text>
        </Pressable>
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
          Call for Help Now
        </Text>
      </Pressable>
    </ServiceDetailScreenLayout>
  );
}
