import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { Rocket } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ProfileSubScreenLayout from '../components/profile/ProfileSubScreenLayout';
import { MORE_SERVICES_ITEMS } from '../constants/moreServices';
import type { HomeStackParamList } from '../types/navigation';
import { colors, shadows, typography } from '../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<HomeStackParamList, 'MoreServices'>;

export default function MoreServicesScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const px = (n: number) => Math.round(n * (width / REF_W));

  return (
    <ProfileSubScreenLayout
      title="More Services"
      subtitle="Coming Soon — Exciting new services!"
      onBack={() => navigation.goBack()}>
      <View
        style={[
          {
            borderRadius: px(14),
            backgroundColor: colors.goldLight,
            padding: px(16),
            marginBottom: px(16),
            overflow: 'hidden',
          },
          shadows.card,
        ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(8) }}>
          <Rocket size={px(18)} color={colors.primary} />
          <Text
            style={{
              fontSize: px(16),
              fontWeight: typography.weights.bold,
              color: colors.dark,
            }}>
            Expanding Soon!
          </Text>
        </View>
        <Text
          style={{
            marginTop: px(6),
            fontSize: px(13),
            color: colors.grey,
            lineHeight: px(18),
          }}>
          We're working hard to bring you more amazing services.
        </Text>
      </View>

      <View style={{ gap: px(10) }}>
        {MORE_SERVICES_ITEMS.map(item => {
          const Icon = item.Icon;
          return (
          <View
            key={item.id}
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
              },
              shadows.card,
            ]}>
            <View
              style={{
                width: px(44),
                height: px(44),
                borderRadius: px(22),
                backgroundColor: colors.goldLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon size={px(20)} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: px(14),
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: px(12), color: colors.grey, marginTop: px(3) }}>
                {item.description}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: px(8),
                paddingVertical: px(4),
                borderRadius: px(8),
                backgroundColor: colors.lightGrey,
              }}>
              <Text
                style={{
                  fontSize: px(10),
                  fontWeight: typography.weights.bold,
                  color: colors.grey,
                }}>
                Soon
              </Text>
            </View>
          </View>
          );
        })}
      </View>
    </ProfileSubScreenLayout>
  );
}
