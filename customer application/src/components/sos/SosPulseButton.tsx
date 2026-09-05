import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { SOS_COLORS } from '../../constants/sosTheme';
import { typography } from '../../theme';

type Props = {
  px: (n: number) => number;
  onPress?: () => void;
};

export default function SosPulseButton({ px, onPress }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const rings = [4, 3, 2, 1];

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: px(150),
        marginBottom: px(6),
      }}>
      {rings.map((ring, index) => {
        const size = px(68 + ring * 20);
        const opacity = pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.12 + index * 0.08, 0.45 - index * 0.06],
        });
        return (
          <Animated.View
            key={ring}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 1.5,
              borderColor: SOS_COLORS.red,
              opacity,
            }}
          />
        );
      })}
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={{
          width: px(76),
          height: px(76),
          borderRadius: px(38),
          backgroundColor: SOS_COLORS.red,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: SOS_COLORS.red,
          shadowOpacity: 0.6,
          shadowRadius: px(12),
          shadowOffset: { width: 0, height: 0 },
          elevation: 8,
        }}>
        <Text
          style={{
            color: SOS_COLORS.white,
            fontSize: px(22),
            fontWeight: typography.weights.extrabold,
            letterSpacing: 1,
          }}>
          SOS
        </Text>
      </Pressable>
    </View>
  );
}
