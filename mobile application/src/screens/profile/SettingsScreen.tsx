import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../../components/ui/PrimaryButton';
import Screen, { Card, ScreenContent } from '../../components/ui/Screen';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/auth/authSlice';
import { resetBookings } from '../../redux/bookings/bookingsSlice';
import { resetOnboarding } from '../../redux/onboarding/onboardingSlice';
import { resetProfile, updateSettings } from '../../redux/profile/profileSlice';
import { resetVendorWizard } from '../../redux/vendor/vendorOnboardingSlice';
import type { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export default function SettingsScreen({}: Props) {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.profile.settings);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          dispatch(resetOnboarding());
          dispatch(resetVendorWizard());
          dispatch(resetBookings());
          dispatch(resetProfile());
        },
      },
    ]);
  };

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenContent>
            <Card style={styles.row}>
              <Text style={styles.label}>Language</Text>
              <Text style={styles.value}>{settings.language}</Text>
            </Card>
            <Card style={styles.row}>
              <Text style={styles.label}>Dark Mode</Text>
              <Switch
                value={settings.darkMode}
                onValueChange={(v) => {
                  dispatch(updateSettings({ darkMode: v }));
                }}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </Card>
            <Card style={styles.row}>
              <Text style={styles.label}>Push Notifications</Text>
              <Switch
                value={settings.pushEnabled}
                onValueChange={(v) => {
                  dispatch(updateSettings({ pushEnabled: v }));
                }}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </Card>
            <Card>
              <Text style={styles.link}>Privacy Policy</Text>
              <Text style={[styles.link, styles.linkSpaced]}>Terms of Service</Text>
            </Card>
            <PrimaryButton label="Logout" onPress={handleLogout} variant="outline" />
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  label: { fontWeight: typography.weights.semibold, color: colors.textDark },
  value: { color: colors.textMuted },
  link: { color: colors.primary, fontWeight: typography.weights.semibold },
  linkSpaced: { marginTop: spacing.md },
});
