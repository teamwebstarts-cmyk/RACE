import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Navigation, Truck } from 'lucide-react-native';

import { images } from '../../assets';
import { colors } from '../../theme';

interface MapPlaceholderProps {
  px: (n: number) => number;
  variant?: 'route' | 'driver';
}

export default function MapPlaceholder({ px, variant = 'route' }: MapPlaceholderProps) {
  return (
    <View
      style={[
        styles.wrap,
        {
          flex: 1,
          borderRadius: px(16),
        },
      ]}>
      <LinearGradient
        colors={['#E8F4EA', '#D4E8F0', '#F0EDE4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.routeLine,
          {
            left: px(42),
            top: px(58),
            width: px(180),
            height: px(4),
            borderRadius: px(2),
            transform: [{ rotate: '28deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.routeLine,
          {
            left: px(150),
            top: px(118),
            width: px(120),
            height: px(4),
            borderRadius: px(2),
            transform: [{ rotate: '-18deg' }],
          },
        ]}
      />
      <View style={{ position: 'absolute', left: px(34), top: px(48) }}>
        <Navigation size={px(18)} color={colors.success} fill={colors.success} />
      </View>
      <View style={{ position: 'absolute', right: px(36), bottom: px(72) }}>
        <MapPin size={px(22)} color={colors.error} fill={colors.error} />
      </View>
      <View
        style={{
          position: 'absolute',
          left: px(128),
          top: px(108),
          width: px(34),
          height: px(34),
          borderRadius: px(17),
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}>
        <Truck size={px(18)} color={colors.primary} />
      </View>
      {variant === 'driver' ? (
        <Image
          source={images.homeHeroTruck}
          style={{
            position: 'absolute',
            right: px(24),
            top: px(90),
            width: px(56),
            height: px(42),
            opacity: 0.9,
          }}
          resizeMode="contain"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: '#E8F0E8',
    position: 'relative',
  },
  routeLine: {
    position: 'absolute',
    backgroundColor: colors.primary,
  },
});
