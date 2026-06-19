import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

import DocumentStatusChip from '../../components/vendor/DocumentStatusChip';
import VerificationTimeline from '../../components/vendor/VerificationTimeline';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { getVendorConfig } from '../../data/vendorWizardConfig';
import { useAppDispatch } from '../../redux/hooks';
import { completeOnboarding } from '../../redux/auth/authSlice';
import { finishPartnerSignup } from '../../redux/onboarding/onboardingSlice';
import { useVendorStatusQuery } from '../../services/vendor/useVendorMutations';
import type { AuthStackParamList, VendorFlowParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<VendorFlowParamList, 'VendorVerificationStatus'>;

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending Verification',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Resubmission Required',
};

export default function VerificationStatusScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const fromSignup = route.params?.fromSignup ?? false;
  const { data: vendor, isLoading, refetch, isRefetching } = useVendorStatusQuery();

  const handleEnterApp = () => {
    dispatch(finishPartnerSignup());
    dispatch(completeOnboarding());
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!vendor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>No Application Found</Text>
          <PrimaryButton
            label="Start Partner Registration"
            onPress={() =>
              (navigation as NativeStackNavigationProp<AuthStackParamList>).navigate('AccountType')
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const config = getVendorConfig(vendor.vendorType);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>{config?.emoji ?? '📋'}</Text>
        <Text style={styles.title}>{STATUS_LABELS[vendor.status] ?? vendor.status}</Text>
        <Text style={styles.subtitle}>{config?.title} application</Text>

        <GlassCard>
          <Text style={styles.cardTitle}>Verification Timeline</Text>
          <VerificationTimeline
            currentStage={vendor.verificationStage}
            statusHistory={vendor.statusHistory}
          />
        </GlassCard>

        {vendor.reviewNotes ? (
          <GlassCard>
            <Text style={styles.cardTitle}>Admin Notes</Text>
            <Text style={styles.note}>{vendor.reviewNotes}</Text>
          </GlassCard>
        ) : null}

        <GlassCard>
          <Text style={styles.cardTitle}>Documents</Text>
          {vendor.documents.map((doc) => (
            <View key={doc.id} style={styles.docRow}>
              <Text style={styles.docLabel}>{doc.documentType.replace(/_/g, ' ')}</Text>
              <DocumentStatusChip status={doc.verificationStatus} />
            </View>
          ))}
        </GlassCard>

        {vendor.status === 'changes_requested' ? (
          <PrimaryButton
            label="Update Application"
            onPress={() =>
              navigation.navigate('VendorWizard', { vendorType: vendor.vendorType })
            }
          />
        ) : null}

        {fromSignup ? (
          <PrimaryButton label="Continue to App" onPress={handleEnterApp} />
        ) : null}

        <PrimaryButton
          label={isRefetching ? 'Refreshing...' : 'Refresh Status'}
          variant="outline"
          onPress={() => void refetch()}
        />

        {!fromSignup ? (
          <PrimaryButton label="Back to Profile" variant="outline" onPress={() => navigation.popToTop()} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surfaceDarker },
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  emoji: { fontSize: 40, textAlign: 'center' },
  title: {
    color: colors.textLight,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subtitle: { color: colors.subtext, textAlign: 'center', marginBottom: spacing.lg },
  cardTitle: {
    color: colors.textLight,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    fontSize: typography.sizes.lg,
  },
  note: { color: colors.subtext, lineHeight: 20 },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  docLabel: { color: colors.subtext, textTransform: 'capitalize' },
});
