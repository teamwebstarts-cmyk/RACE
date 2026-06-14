import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { categoryIcons } from '../../assets';

export default function ServiceIcon({ categoryId, emoji, size = 28 }) {
  const iconSource = categoryIcons[categoryId];

  if (iconSource) {
    return (
      <Image
        source={iconSource}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  return <Text style={[styles.emoji, { fontSize: size * 0.85 }]}>{emoji}</Text>;
}

const styles = StyleSheet.create({
  emoji: {
    textAlign: 'center',
  },
});
