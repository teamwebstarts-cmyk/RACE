import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme';

const REF_W = 390;

type Props = {
  children: React.ReactNode;
  footerSpacing?: number;
};

export function useServiceDetailMetrics() {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);
  const horizontalPadding = px(20);

  return { width, px, horizontalPadding };
}

export default function ServiceDetailScreenLayout({ children, footerSpacing }: Props) {
  const insets = useSafeAreaInsets();
  const { px, horizontalPadding } = useServiceDetailMetrics();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          alwaysBounceHorizontal={false}
          directionalLockEnabled
          overScrollMode="never"
          contentContainerStyle={{
            paddingBottom: (footerSpacing ?? px(16)) + insets.bottom,
          }}>
          <View style={{ marginHorizontal: horizontalPadding }}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
});
