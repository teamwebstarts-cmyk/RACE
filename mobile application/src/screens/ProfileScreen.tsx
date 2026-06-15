import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BrandLogo from '../components/ui/BrandLogo';
import PrimaryButton from '../components/ui/PrimaryButton';
import Screen, { ScreenContent } from '../components/ui/Screen';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { completeProfileSuccess, logout } from '../redux/auth/authSlice';
import { getProfile } from '../services/auth/authApi';
import type { ProfileStackParamList } from '../types/navigation';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

export default function ProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    void getProfile()
      .then((profile) => dispatch(completeProfileSuccess(profile)))
      .catch(() => undefined);
  }, [dispatch]);

  return (
    <Screen>
      <SafeAreaView style={styles.safeArea}>
        <ScreenContent style={styles.content}>
          <View style={styles.card}>
            <BrandLogo size="medium" style={styles.logo} />
            <Text style={styles.badge}>MY PROFILE</Text>
            <Text style={styles.name}>{user?.fullName ?? 'RACE Customer'}</Text>
            <Text style={styles.meta}>{user?.mobileNumber}</Text>
            {user?.email ? <Text style={styles.meta}>{user.email}</Text> : null}
            <Text style={styles.status}>
              {user?.isProfileCompleted ? 'Profile completed' : 'Profile incomplete'}
            </Text>

            <PrimaryButton
              label="My Vehicles"
              onPress={() => navigation.navigate('MyVehicles')}
            />
            <View style={styles.spacer} />
            <PrimaryButton label="Logout" onPress={() => dispatch(logout())} variant="outline" />
          </View>
        </ScreenContent>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 195, 38, 0.2)',
  },
  logo: { marginBottom: spacing.md },
  badge: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  name: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
  },
  meta: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: typography.sizes.md,
  },
  status: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    color: colors.success,
    fontWeight: typography.weights.semibold,
  },
  spacer: { height: spacing.sm, width: '100%' },
});
