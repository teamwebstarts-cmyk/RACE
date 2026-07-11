import React from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

import { images } from '../../assets';

/** Native asset aspect ratio for `logo.png` (full RACE + SERVICE mark). */
const LOGO_ASPECT = 480 / 230;

interface PartnerBrandLogoProps {
  /** Max width in dp; height is derived to avoid clipping. */
  maxWidth?: number;
}

export default function PartnerBrandLogo({ maxWidth }: PartnerBrandLogoProps) {
  const { width: screenWidth } = useWindowDimensions();
  const logoWidth = maxWidth ?? Math.min(screenWidth - 56, 300);
  const logoHeight = logoWidth / LOGO_ASPECT;

  return (
    <View style={[styles.wrap, { width: logoWidth, height: logoHeight }]}>
      <Image
        source={images.logo}
        style={styles.image}
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
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
