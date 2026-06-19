import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import BrandLogo from '../components/ui/BrandLogo';
import PrimaryButton from '../components/ui/PrimaryButton';
import Screen, { ScreenContent } from '../components/ui/Screen';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout, setUseCustomerExperience, updateUser } from '../redux/auth/authSlice';
import { resetOnboarding } from '../redux/onboarding/onboardingSlice';
import { resetBookings } from '../redux/bookings/bookingsSlice';
import { resetProfile } from '../redux/profile/profileSlice';
import { resetVendorWizard } from '../redux/vendor/vendorOnboardingSlice';
import { getProfile } from '../services/auth/authApi';
import { useVendorStatusQuery } from '../services/vendor/useVendorMutations';
import { canAccessPartnerExperience, isVendorRole } from '../utils/roleRouting';
import type { ProfileStackParamList } from '../types/navigation';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

type ProfileMenuRoute =
  | 'MyVehicles'
  | 'SavedLocations'
  | 'PaymentMethods'
  | 'Notifications'
  | 'SubscriptionPlans'
  | 'SupportCenter'
  | 'EmergencySos'
  | 'Settings';

const MENU_ITEMS: Array<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: ProfileMenuRoute;
}> = [
  { label: 'My Vehicles', icon: 'car', route: 'MyVehicles' },
  { label: 'Saved Locations', icon: 'location', route: 'SavedLocations' },
  { label: 'Payment Methods', icon: 'card', route: 'PaymentMethods' },
  { label: 'Notifications', icon: 'notifications', route: 'Notifications' },
  { label: 'Subscription Plans', icon: 'star', route: 'SubscriptionPlans' },
  { label: 'Support Center', icon: 'headset', route: 'SupportCenter' },
  { label: 'Emergency SOS', icon: 'warning', route: 'EmergencySos' },
  { label: 'Settings', icon: 'settings', route: 'Settings' },
];

export default function ProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const subscription = useAppSelector((state) => state.profile.subscription);
  const useCustomerExperience = useAppSelector((state) => state.auth.useCustomerExperience);
  const partnerSignupRequired = useAppSelector((state) => state.onboarding.partnerSignupRequired);
  const { data: vendorApp } = useVendorStatusQuery();

  const isApprovedPartner = isVendorRole(user);
  const hasPartnerApplication = Boolean(vendorApp);
  const showPartnerSignup =
    !isApprovedPartner && !partnerSignupRequired && !hasPartnerApplication;
  const showPartnerVerification =
    hasPartnerApplication && !isApprovedPartner && !partnerSignupRequired;
  const showPartnerDashboard = canAccessPartnerExperience(user) && useCustomerExperience;

  const verificationLabel =
    vendorApp?.status === 'changes_requested'
      ? 'Update Partner Application'
      : vendorApp?.status === 'rejected'
        ? 'View Application Status'
        : 'Partner Verification Status';

  useEffect(() => {
    void getProfile()
      .then((profile) => dispatch(updateUser(profile)))
      .catch(() => undefined);
  }, [dispatch]);

  return (
    <Screen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenContent>
            <View style={styles.card}>
              <BrandLogo size="medium" style={styles.logo} />
              <Text style={styles.badge}>MY PROFILE</Text>
              <Text style={styles.name}>{user?.fullName ?? 'RACE Customer'}</Text>
              <Text style={styles.meta}>{user?.mobileNumber}</Text>
              {user?.email ? <Text style={styles.meta}>{user.email}</Text> : null}
              <Text style={styles.status}>
                {subscription.status === 'active'
                  ? `${subscription.planId.charAt(0).toUpperCase()}${subscription.planId.slice(1)} Plan Active`
                  : user?.isProfileCompleted
                    ? 'Profile completed'
                    : 'Profile incomplete'}
              </Text>
            </View>

            <View style={styles.menu}>
              {MENU_ITEMS.map((item) => (
                <Pressable
                  key={item.route}
                  style={styles.menuItem}
                  onPress={() => navigation.navigate(item.route)}>
                  <View style={styles.menuIcon}>
                    <Ionicons name={item.icon} size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>

            {showPartnerDashboard ? (
              <PrimaryButton
                label="Partner Dashboard"
                onPress={() => dispatch(setUseCustomerExperience(false))}
              />
            ) : null}
            {showPartnerVerification ? (
              <PrimaryButton
                label={verificationLabel}
                onPress={() => navigation.navigate('VendorVerificationStatus')}
              />
            ) : null}
            {showPartnerSignup ? (
              <PrimaryButton
                label="Partner With RACE"
                onPress={() => navigation.navigate('VendorTypeSelect')}
              />
            ) : null}
            <PrimaryButton
              label="Logout"
              onPress={() => {
                dispatch(logout());
                dispatch(resetOnboarding());
                dispatch(resetVendorWizard());
                dispatch(resetBookings());
                dispatch(resetProfile());
              }}
              variant="outline"
            />
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flexGrow: 1 },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 195, 38, 0.2)',
    marginBottom: spacing.lg,
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
    color: colors.success,
    fontWeight: typography.weights.semibold,
  },
  menu: {
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,195,38,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textDark,
  },
});
