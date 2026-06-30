import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PartnerRegistrationLayout from '../../../../components/partner/PartnerRegistrationLayout';
import { PartnerRegistrationFooter } from '../../../../components/partner/PartnerRegistrationSections';
import { VENDOR_REGISTRATION_STEPS } from '../../../../constants/partnerRegistration';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { completeOnboarding } from '../../../../redux/auth/authSlice';
import { finishPartnerSignup } from '../../../../redux/onboarding/onboardingSlice';
import { usePartnerRegistrationStore } from '../../../../store/partnerRegistrationStore';
import type {
  PartnerRegistrationStackParamList,
  PartnerRootStackParamList,
} from '../../../../types/partnerNavigation';
import { colors, radius, spacing, typography } from '../../../../theme';

type Props = NativeStackScreenProps<PartnerRegistrationStackParamList, 'VendorReview'>;

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  );
}

export default function VendorReviewScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const { vendorBusiness, vendorAddress, vendorDocuments } = usePartnerRegistrationStore();

  const submit = () => {
    dispatch(finishPartnerSignup());
    if (authUser) {
      dispatch(
        completeOnboarding({
          ...authUser,
          fullName: vendorBusiness.ownerName || authUser.fullName,
          email: vendorBusiness.email || authUser.email,
          isProfileCompleted: true,
        }),
      );
    } else {
      dispatch(completeOnboarding());
    }
    const rootNavigation =
      navigation.getParent<NativeStackScreenProps<PartnerRootStackParamList>['navigation']>();
    rootNavigation?.reset({
      index: 0,
      routes: [{ name: 'PartnerMain' }],
    });
  };

  return (
    <PartnerRegistrationLayout
      title="Vendor Registration"
      stepLabel="Step 4 of 4"
      steps={VENDOR_REGISTRATION_STEPS}
      activeStep={4}
      onBack={() => navigation.goBack()}
      footer={
        <PartnerRegistrationFooter
          showBack
          onBack={() => navigation.goBack()}
          continueLabel="Submit Application"
          onContinue={submit}
        />
      }>
      <View style={styles.successCard}>
        <CheckCircle2 size={28} color={colors.partnerRed} strokeWidth={2} />
        <Text style={styles.successTitle}>Review your application</Text>
        <Text style={styles.successSubtitle}>
          Admin will verify your business and documents before activation.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Business Information</Text>
      <View style={styles.card}>
        <ReviewRow label="Business Name" value={vendorBusiness.businessName} />
        <ReviewRow label="Owner Name" value={vendorBusiness.ownerName} />
        <ReviewRow label="Mobile" value={vendorBusiness.mobileNumber} />
        <ReviewRow label="Email" value={vendorBusiness.email} />
        <ReviewRow label="Business Type" value={vendorBusiness.businessType} />
      </View>

      <Text style={styles.sectionTitle}>Business Address</Text>
      <View style={styles.card}>
        <ReviewRow label="Address Line 1" value={vendorAddress.addressLine1} />
        <ReviewRow label="Address Line 2" value={vendorAddress.addressLine2} />
        <ReviewRow label="City" value={vendorAddress.city} />
        <ReviewRow label="State" value={vendorAddress.state} />
        <ReviewRow label="PIN Code" value={vendorAddress.pinCode} />
        <ReviewRow label="Landmark" value={vendorAddress.landmark} />
      </View>

      <Text style={styles.sectionTitle}>Documents ({vendorDocuments.length})</Text>
      <View style={styles.card}>
        {vendorDocuments.map((doc) => (
          <ReviewRow
            key={doc.id}
            label={doc.label}
            value={doc.mimeType === 'application/pdf' ? `PDF · ${doc.name}` : 'Uploaded'}
          />
        ))}
      </View>
    </PartnerRegistrationLayout>
  );
}

const styles = StyleSheet.create({
  successCard: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.partnerRedLight,
    marginBottom: spacing.lg,
  },
  successTitle: {
    marginTop: spacing.sm,
    color: colors.dark,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  successSubtitle: {
    marginTop: spacing.xs,
    color: colors.grey,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed,
  },
  sectionTitle: {
    color: colors.dark,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  rowLabel: {
    color: colors.grey,
    fontSize: typography.sizes.xs,
    marginBottom: 2,
  },
  rowValue: {
    color: colors.dark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
