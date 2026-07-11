import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { images } from '../../assets';

const LOGO_ASSETS = {
  header: { source: images.splashHeader, w: 484, h: 300 },
  full: { source: images.logo, w: 480, h: 230 },
} as const;

interface AuthLogoProps {
  width?: number;
  /** @deprecated use width */
  size?: number;
  variant?: keyof typeof LOGO_ASSETS;
}

export default function AuthLogo({ width, size, variant = 'header' }: AuthLogoProps) {
  const logoWidth = width ?? size ?? 200;
  const asset = LOGO_ASSETS[variant];
  const height = (logoWidth * asset.h) / asset.w;

  return (
    <View style={styles.wrap}>
      <Image
        source={asset.source}
        style={{ width: logoWidth, height }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
