import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BrandLogo from '../../components/ui/BrandLogo';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import AppScreenLayout from '../../components/ui/AppScreenLayout';
import DocumentStatusChip from '../../components/vendor/DocumentStatusChip';
import { getVendorConfig } from '../../data/vendorWizardConfig';
import { useAuthActions } from '../../hooks/useAuth';
import { useAppSelector } from '../../redux/hooks';
import { useVendorStatusQuery } from '../../services/vendor/useVendorMutations';
import type { PartnerAccountStackParamList } from '../../types/partnerNavigation';
import { colors, radius, shadows, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<PartnerAccountStackParamList, 'PartnerAccountMain'>;

export default function PartnerAccountScreen({ navigation }: Props) {
  const { logout } = useAuthActions();
  const user = useAppSelector(state => state.auth.user);
  const isVendor = user?.role === 'vendor';
  const isDriver = user?.role === 'driver';
  const { data: vendor } = useVendorStatusQuery(isVendor);
  const config = vendor ? getVendorConfig(vendor.vendorType) : undefined;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => {
          void logout().catch(() => {
            Alert.alert('Logout failed', 'Please try again.');
          });
        },
      },
    ]);
  };

  return (
    <AppScreenLayout
      header={
        <View style={styles.headerPad}>
          <Text style={styles.title}>Account</Text>
          <Text style={styles.subtitle}>Partner profile and verification</Text>
        </View>
      }>
      <View style={styles.card}>
        <BrandLogo size="medium" style={styles.logo} />
        <Text style={styles.badge}>{isDriver ? 'DRIVER ACCOUNT' : 'PARTNER ACCOUNT'}</Text>
        <Text style={styles.name}>{user?.fullName ?? 'RACE Partner'}</Text>
        <Text style={styles.meta}>{user?.mobileNumber}</Text>
        {config ? <Text style={styles.meta}>{config.title}</Text> : null}
        {vendor ? (
          <Text style={styles.status}>
            Status: {vendor.status.replace(/_/g, ' ')} ·{' '}
            {vendor.verificationStage.replace(/_/g, ' ')}
          </Text>
        ) : null}
        {isDriver ? <Text style={styles.status}>Status: ready for jobs</Text> : null}
      </View>

      {vendor?.documents?.length ? (
        <GlassCard>
          <Text style={styles.sectionTitle}>Documents</Text>
          {vendor.documents.slice(0, 4).map(doc => (
            <View key={doc.id} style={styles.docRow}>
              <Text style={styles.docLabel}>{doc.documentType.replace(/_/g, ' ')}</Text>
              <DocumentStatusChip status={doc.verificationStatus} />
            </View>
          ))}
        </GlassCard>
      ) : null}

      <View style={styles.actions}>
        {isVendor ? (
          <PrimaryButton
            label="Fleet drivers / Add driver"
            variant="outline"
            onPress={() => navigation.navigate('VendorDrivers')}
          />
        ) : null}
        {isVendor ? (
          <PrimaryButton
            label="Fleet vehicles / Add vehicle"
            variant="outline"
            onPress={() => navigation.navigate('VendorVehicles')}
          />
        ) : null}
        {isVendor ? (
          <PrimaryButton
            label="Verification timeline"
            variant="outline"
            onPress={() => navigation.navigate('VendorVerificationStatus')}
          />
        ) : null}
        <PrimaryButton label="Log out" onPress={handleLogout} />
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.dark,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.grey,
    fontSize: typography.sizes.sm,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  logo: { marginBottom: spacing.md },
  badge: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    fontSize: typography.sizes.xs,
  },
  name: {
    color: colors.dark,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.sm,
  },
  meta: { color: colors.grey, marginTop: spacing.xs },
  status: {
    color: colors.secondary,
    marginTop: spacing.md,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  docLabel: {
    color: colors.grey,
    textTransform: 'capitalize',
    flex: 1,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
});
