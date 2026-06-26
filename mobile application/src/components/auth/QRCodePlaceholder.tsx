import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { colors, radius } from '../../theme';

const PATTERN = [
  '1111011',
  '1010101',
  '1111011',
  '1010001',
  '1111011',
  '1010101',
  '1111011',
];

interface QRCodePlaceholderProps {
  size?: number;
  scale?: number;
}

export default function QRCodePlaceholder({
  size = 200,
  scale = 1,
}: QRCodePlaceholderProps) {
  const px = (n: number) => Math.round(n * scale);
  const cellSize = size / PATTERN[0].length;
  const pad = px(12);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size + pad * 2,
          height: size + pad * 2,
          borderRadius: px(12),
          padding: pad,
        },
      ]}>
      <View style={[styles.inner, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {PATTERN.map((row, rowIndex) =>
            row.split('').map((cell, colIndex) =>
              cell === '1' ? (
                <Rect
                  key={`${rowIndex}-${colIndex}`}
                  x={colIndex * cellSize}
                  y={rowIndex * cellSize}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  fill={colors.dark}
                />
              ) : null,
            ),
          )}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
