import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';

const DOT_ACTIVE = colors.primary;
const DOT_INACTIVE = '#F5D98A';

interface PartnerPageDotsProps {
  total?: number;
  activeIndex?: number;
}

export default function PartnerPageDots({
  total = 4,
  activeIndex = 0,
}: PartnerPageDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isActive ? styles.dotActive : styles.dotInactive,
              isActive ? styles.dotActiveWidth : styles.dotInactiveWidth,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: DOT_ACTIVE,
  },
  dotInactive: {
    backgroundColor: DOT_INACTIVE,
  },
  dotActiveWidth: {
    width: 28,
  },
  dotInactiveWidth: {
    width: 8,
  },
});
