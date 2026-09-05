import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Smartphone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/auth/authSlice';
import { colors, layout, radius, spacing, typography } from '../../theme';

export default function WrongAppRoleScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const roleLabel =
    user?.role === 'vendor' ? 'Vendor' : user?.role === 'driver' ? 'Driver' : 'Partner';

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
      ]}>
      <View style={styles.iconWrap}>
        <Smartphone size={40} color={colors.primary} strokeWidth={2} />
      </View>
      <Text style={styles.title}>Use RACE Partner</Text>
      <Text style={styles.body}>
        This number is registered as a {roleLabel}. Customer bookings and services are only in the
        RACE Customer app. Partner jobs and fleet tools are in RACE Partner.
      </Text>
      <Text style={styles.hint}>
        Install <Text style={styles.bold}>RACE Partner</Text> from the store, or sign out and use a
        different mobile number here.
      </Text>
      <Pressable onPress={handleLogout} style={styles.button}>
        <Text style={styles.buttonLabel}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: layout.screenPadding,
    alignItems: 'center',
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.dark,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    color: colors.grey,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.relaxed,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  hint: {
    color: colors.dark,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.relaxed,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  bold: {
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  button: {
    minHeight: 52,
    minWidth: 200,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  buttonLabel: {
    color: colors.dark,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
