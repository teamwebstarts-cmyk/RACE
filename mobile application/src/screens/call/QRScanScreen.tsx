import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScanLine } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import GoldButton from '../../components/auth/GoldButton';
import { AuthBackHeader } from '../../components/auth/StepHeader';
import type { CallStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<CallStackParamList, 'QRScan'>;

export default function QRScanScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scanAnim]);

  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [px(20), px(200)],
  });

  const handleScan = () => {
    navigation.replace('SOSEmergency');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: px(20), flex: 1 }}>
        <AuthBackHeader onBack={() => navigation.goBack()} />

        <Text
          style={{
            fontSize: px(24),
            fontWeight: typography.weights.extrabold,
            color: colors.dark,
            textAlign: 'center',
            marginBottom: px(8),
          }}>
          Scan Vehicle QR
        </Text>
        <Text
          style={{
            fontSize: px(13),
            color: colors.grey,
            textAlign: 'center',
            marginBottom: px(24),
            lineHeight: px(20),
          }}>
          Point your camera at the vehicle's RACE QR tag to contact the owner or send an emergency alert
        </Text>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: px(24),
          }}>
          <View
            style={{
              width: px(260),
              height: px(260),
              borderRadius: px(20),
              backgroundColor: colors.dark,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
            <View
              style={{
                width: px(220),
                height: px(220),
                borderWidth: 2,
                borderColor: colors.primary,
                borderRadius: px(12),
                overflow: 'hidden',
              }}>
              <Animated.View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: colors.primary,
                  transform: [{ translateY: scanLineY }],
                }}
              />
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ScanLine size={px(48)} color="rgba(255,255,255,0.3)" />
              </View>
            </View>
          </View>
        </View>

        <GoldButton
          label="Scan Demo QR"
          onPress={handleScan}
          style={{ width: '100%', marginBottom: px(12) }}
          height={px(52)}
          labelSize={px(16)}
          borderRadius={px(14)}
        />
        <Pressable onPress={() => navigation.goBack()} style={{ alignItems: 'center', paddingVertical: px(8) }}>
          <Text style={{ fontSize: px(14), fontWeight: typography.weights.semibold, color: colors.grey }}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
});
