import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';

import { colors, shadows, typography } from '../../theme';

interface ServiceCategoryGridCardProps {
  title: string;
  description: string;
  servicesCount: number;
  Icon: LucideIcon;
  comingSoon?: boolean;
  scale: number;
  onPress: () => void;
}

export default function ServiceCategoryGridCard({
  title,
  description,
  servicesCount,
  Icon,
  comingSoon = false,
  scale,
  onPress,
}: ServiceCategoryGridCardProps) {
  const px = (n: number) => Math.round(n * scale);
  const accent = comingSoon ? colors.grey : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadows.card,
        {
          borderRadius: px(18),
          padding: px(14),
          minHeight: px(162),
          opacity: comingSoon ? 0.92 : 1,
        },
        pressed && styles.pressed,
      ]}>
      {comingSoon ? (
        <View
          style={{
            position: 'absolute',
            top: px(10),
            right: px(10),
            backgroundColor: colors.primary,
            borderRadius: px(10),
            paddingHorizontal: px(8),
            paddingVertical: px(3),
          }}>
          <Text
            style={{
              fontSize: px(9),
              fontWeight: typography.weights.bold,
              color: colors.dark,
            }}>
            Coming Soon
          </Text>
        </View>
      ) : null}

      <View
        style={{
          width: px(42),
          height: px(42),
          borderRadius: px(21),
          backgroundColor: comingSoon ? colors.lightGrey : colors.goldLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: px(10),
        }}>
        <Icon size={px(20)} color={accent} strokeWidth={2} />
      </View>

      <Text
        style={{
          fontSize: px(14),
          fontWeight: typography.weights.bold,
          color: colors.dark,
          marginBottom: px(4),
        }}>
        {title}
      </Text>

      <Text
        numberOfLines={2}
        style={{
          fontSize: px(11),
          color: colors.grey,
          lineHeight: px(15),
          flex: 1,
        }}>
        {description}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: px(8),
        }}>
        <Text
          style={{
            fontSize: px(9),
            fontWeight: typography.weights.semibold,
            color: colors.grey,
            letterSpacing: 0.6,
          }}>
          {servicesCount} SERVICES
        </Text>
        <View
          style={{
            width: px(28),
            height: px(28),
            borderRadius: px(14),
            backgroundColor: comingSoon ? colors.lightGrey : colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ChevronRight
            size={px(16)}
            color={comingSoon ? colors.grey : colors.background}
            strokeWidth={2.5}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48.5%',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
