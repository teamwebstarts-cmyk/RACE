import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';

interface PartnerProgressBarProps {
  total?: number;
  activeIndex?: number;
}

export default function PartnerProgressBar({
  total = 4,
  activeIndex = 1,
}: PartnerProgressBarProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            index <= activeIndex ? styles.segmentActive : styles.segmentInactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: radius.pill,
  },
  segmentActive: {
    backgroundColor: colors.partnerRed,
  },
  segmentInactive: {
    backgroundColor: colors.lightGrey,
  },
});
