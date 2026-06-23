import React, { type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { colors, typography } from '../../theme';

const REF_W = 390;

type Props = {
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  onBack?: () => void;
};

export function useProfilePx() {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  return (n: number) => Math.round(n * s);
}

export default function ProfileSubScreenLayout({
  title,
  subtitle,
  headerRight,
  children,
  onBack,
}: Props) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const px = useProfilePx();

  const handleBack = onBack ?? (() => navigation.goBack());

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: px(20),
            paddingBottom: subtitle ? px(4) : px(12),
            minHeight: px(44),
          }}>
          <Pressable onPress={handleBack} hitSlop={10} style={{ width: px(32) }}>
            <ArrowLeft size={px(22)} color={colors.dark} strokeWidth={2.5} />
          </Pressable>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: px(17),
              fontWeight: typography.weights.bold,
              color: colors.dark,
            }}>
            {title}
          </Text>
          {headerRight ? (
            <View style={{ minWidth: px(72), alignItems: 'flex-end' }}>{headerRight}</View>
          ) : (
            <View style={{ width: px(32) }} />
          )}
        </View>
        {subtitle ? (
          <Text
            style={{
              textAlign: 'center',
              fontSize: px(12),
              color: colors.grey,
              marginBottom: px(12),
              paddingHorizontal: px(20),
            }}>
            {subtitle}
          </Text>
        ) : null}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: px(20),
            paddingBottom: px(20) + insets.bottom,
          }}>
          {children}
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
  },
});
