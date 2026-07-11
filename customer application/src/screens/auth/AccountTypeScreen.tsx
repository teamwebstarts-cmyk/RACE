import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { images, categoryIcons } from '../../assets';
import { useAppDispatch } from '../../redux/hooks';
import { clearSignupPath, setSignupPath } from '../../redux/onboarding/onboardingSlice';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'AccountType'>;

export default function AccountTypeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();

  const handleGetStarted = () => {
    dispatch(setSignupPath({ accountType: 'customer', vendorType: null }));
    navigation.navigate('MobileNumber');
  };

  const handleAlreadyUser = () => {
    dispatch(clearSignupPath());
    navigation.navigate('MobileNumber');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Image source={images.logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>24/7 ROADSIDE ASSISTANCE</Text>
          <Text style={styles.title}>& TOWING SERVICE</Text>
          <Image source={categoryIcons.towing} style={styles.truckImage} resizeMode="contain" />
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryLabel}>Get Started</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleAlreadyUser}>
            <Text style={styles.secondaryLabel}>I'm Already a User</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'space-between', padding: spacing.lg },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  logo: {
    width: 90,
    height: 90,
  },
  title: {
    marginTop: spacing.sm,
    color: colors.textDark,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  truckImage: {
    width: '100%',
    height: 260,
    marginTop: spacing.xl,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: colors.textDark,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.textDark,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    color: colors.textLight,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
});
