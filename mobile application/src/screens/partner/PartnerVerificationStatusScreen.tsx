import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Clock3, ShieldAlert } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import DocumentStatusChip from '../../components/vendor/DocumentStatusChip';
import VerificationTimeline from '../../components/vendor/VerificationTimeline';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import PartnerScreenLayout from '../../components/partner/PartnerScreenLayout';
import { getVendorConfig } from '../../data/vendorWizardConfig';
import { useVendorStatusQuery } from '../../services/vendor/useVendorMutations';
import type { PartnerAccountStackParamList } from '../../types/partnerNavigation';
import type { VendorStatus } from '../../types/vendor';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<PartnerAccountStackParamList, 'VendorVerificationStatus'>;

const STATUS_META: Record<
  string,
  { label: string; hint: string; color: string; bg: string; Icon: typeof Clock3 }
> = {
  pending: {
    label: 'Pending verification',
    hint: 'Your application is with the admin team for review.',
    color: colors.warning,
    bg: 'rgba(244, 161, 21, 0.12)',
    Icon: Clock3,
  },
  under_review: {
    label: 'Under review',
    hint: 'Documents and business details are being checked.',
    color: colors.warning,
    bg: 'rgba(244, 161, 21, 0.12)',
    Icon: Clock3,
  },
  approved: {
    label: 'Approved',
    hint: 'Your partner account is active.',
    color: colors.success,
    bg: 'rgba(34, 197, 94, 0.12)',
    Icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    hint: 'Contact RACE support if you need help.',
    color: colors.error,
    bg: 'rgba(239, 68, 68, 0.1)',
    Icon: ShieldAlert,
  },
  changes_requested: {
    label: 'Changes requested',
    hint: 'Update your application and resubmit.',
    color: colors.warning,
    bg: 'rgba(244, 161, 21, 0.12)',
    Icon: ShieldAlert,
  },
};

function getStatusMeta(status?: VendorStatus | string) {
  if (!status) {
    return {
      label: 'Loading…',
      hint: 'Fetching verification status',
      color: colors.grey,
      bg: colors.lightGrey,
      Icon: Clock3,
    };
  }
  return (
    STATUS_META[status] ?? {
      label: status.replace(/_/g, ' '),
      hint: 'Current verification status',
      color: colors.grey,
      bg: colors.lightGrey,
      Icon: Clock3,
    }
  );
}

export default function PartnerVerificationStatusScreen({ navigation }: Props) {
  const { data: vendor, isLoading, refetch, isRefetching } = useVendorStatusQuery();

  if (isLoading) {
    return (
      <PartnerScreenLayout title="Verification Status" onBack={() => navigation.goBack()}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </PartnerScreenLayout>
    );
  }

  if (!vendor) {
    return (
      <PartnerScreenLayout title="Verification Status" onBack={() => navigation.goBack()}>
        <Text style={styles.emptyTitle}>No application found</Text>
        <Text style={styles.emptySubtitle}>Complete vendor registration to track verification.</Text>
      </PartnerScreenLayout>
    );
  }

  const config = getVendorConfig(vendor.vendorType);
  const meta = getStatusMeta(vendor.status);
  const StatusIcon = meta.Icon;

  return (
    <PartnerScreenLayout
      title="Verification Status"
      onBack={() => navigation.goBack()}
      footer={
        <PrimaryButton
          label={isRefetching ? 'Refreshing…' : 'Refresh status'}
          variant="outline"
          onPress={() => void refetch()}
        />
      }>
      <View style={[styles.heroCard, { backgroundColor: meta.bg, borderColor: meta.color }]}>
        <Text style={styles.emoji}>{config?.emoji ?? '📋'}</Text>
        <View style={[styles.iconWrap, { backgroundColor: colors.background }]}>
          <StatusIcon size={22} color={meta.color} strokeWidth={2.2} />
        </View>
        <Text style={styles.heroTitle}>{meta.label}</Text>
        <Text style={styles.heroHint}>{meta.hint}</Text>
        <Text style={styles.businessType}>{config?.title ?? 'Partner'} application</Text>
      </View>

      <GlassCard style={styles.section}>
        <Text style={styles.sectionTitle}>Verification timeline</Text>
        <VerificationTimeline
          theme="light"
          currentStage={vendor.verificationStage}
          statusHistory={vendor.statusHistory}
        />
      </GlassCard>

      {vendor.reviewNotes ? (
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Admin notes</Text>
          <Text style={styles.note}>{vendor.reviewNotes}</Text>
        </GlassCard>
      ) : null}

      {vendor.documents.length > 0 ? (
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          {vendor.documents.map(doc => (
            <View key={doc.id} style={styles.docRow}>
              <Text style={styles.docLabel}>{doc.documentType.replace(/_/g, ' ')}</Text>
              <DocumentStatusChip status={doc.verificationStatus} />
            </View>
          ))}
        </GlassCard>
      ) : (
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <Text style={styles.note}>No documents uploaded yet.</Text>
        </GlassCard>
      )}
    </PartnerScreenLayout>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xxl },
  emptyTitle: {
    color: colors.dark,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  emptySubtitle: {
    color: colors.grey,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: typography.lineHeights.normal,
  },
  heroCard: {
    alignItems: 'center',
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  emoji: { fontSize: 36, marginBottom: spacing.sm },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    color: colors.dark,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  heroHint: {
    color: colors.grey,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: typography.lineHeights.normal,
  },
  businessType: {
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
  section: { marginBottom: spacing.md },
  sectionTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    fontSize: typography.sizes.lg,
  },
  note: {
    color: colors.grey,
    lineHeight: typography.lineHeights.normal,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  docLabel: {
    color: colors.dark,
    textTransform: 'capitalize',
    flex: 1,
    paddingRight: spacing.sm,
  },
});
