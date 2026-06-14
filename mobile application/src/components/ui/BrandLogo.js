import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { images } from '../../assets';

const SIZES = {
  small: 32,
  medium: 56,
  large: 88,
};

export default function BrandLogo({ size = 'medium', style }) {
  const dimension = SIZES[size] || SIZES.medium;

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={images.logo}
        style={{ width: dimension, height: dimension }}
        resizeMode="contain"
        accessibilityLabel="RACE Service logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
