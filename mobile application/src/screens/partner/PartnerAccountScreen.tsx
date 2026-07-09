import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BrandLogo from '../../components/ui/BrandLogo';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import Screen, { ScreenContent } from '../../components/ui/Screen';
import DocumentStatusChip from '../../components/vendor/DocumentStatusChip';
import { getVendorConfig } from '../../data/vendorWizardConfig';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setUseCustomerExperience } from '../../redux/auth/authSlice';
import { resetOnboarding } from '../../redux/onboarding/onboardingSlice';
import { resetVendorWizard } from '../../redux/vendor/vendorOnboardingSlice';
import { useVendorStatusQuery } from '../../services/vendor/useVendorMutations';
import { useAuthStore } from '../../store/authStore';
import type { PartnerAccountStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<PartnerAccountStackParamList, 'PartnerAccountMain'>;

export default function PartnerAccountScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { data: vendor } = useVendorStatusQuery();

  const config = vendor ? getVendorConfig(vendor.vendorType) : undefined;

  const handleLogout = () => {
    void useAuthStore.getState().logout().finally(() => {
      dispatch(resetOnboarding());
      dispatch(resetVendorWizard());
    });
  };

  const switchToCustomer = () => {
    dispatch(setUseCustomerExperience(true));
  };

  return (
    <Screen>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenContent style={styles.content}>
          <View style={styles.card}>
            <BrandLogo size="medium" style={styles.logo} />
            <Text style={styles.badge}>PARTNER ACCOUNT</Text>
            <Text style={styles.name}>{user?.fullName ?? 'RACE Partner'}</Text>
            <Text style={styles.meta}>{user?.mobileNumber}</Text>
            {config ? <Text style={styles.meta}>{config.title}</Text> : null}
            {vendor ? (
              <Text style={styles.status}>
                Status: {vendor.status.replace(/_/g, ' ')} · {vendor.verificationStage.replace(/_/g, ' ')}
              </Text>
            ) : null}
          </View>

          {vendor?.documents?.length ? (
            <GlassCard>
              <Text style={styles.sectionTitle}>Documents</Text>
              {vendor.documents.slice(0, 4).map((doc) => (
                <View key={doc.id} style={styles.docRow}>
                  <Text style={styles.docLabel}>{doc.documentType.replace(/_/g, ' ')}</Text>
                  <DocumentStatusChip status={doc.verificationStatus} />
                </View>
              ))}
            </GlassCard>
          ) : null}

          <PrimaryButton
            label="Verification timeline"
            variant="outline"
            onPress={() => navigation.navigate('VendorVerificationStatus')}
          />
          <PrimaryButton
            label="Use customer app"
            variant="outline"
            onPress={switchToCustomer}
          />
          <PrimaryButton label="Log out" onPress={handleLogout} />
        </ScreenContent>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: { marginBottom: spacing.md },
  badge: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    fontSize: typography.sizes.xs,
  },
  name: {
    color: colors.textLight,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.sm,
  },
  meta: { color: colors.subtext, marginTop: spacing.xs },
  status: { color: colors.secondary, marginTop: spacing.md, textTransform: 'capitalize' },
  sectionTitle: { color: colors.textLight, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  docLabel: { color: colors.subtext, textTransform: 'capitalize', flex: 1 },
});
