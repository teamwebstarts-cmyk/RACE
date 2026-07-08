import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PartnerRegistrationLayout from '../../../../components/partner/PartnerRegistrationLayout';
import { PartnerRegistrationFooter } from '../../../../components/partner/PartnerRegistrationSections';
import { VENDOR_REGISTRATION_STEPS } from '../../../../constants/partnerRegistration';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { completeOnboarding, updateTokens, updateUser } from '../../../../redux/auth/authSlice';
import { finishPartnerSignup } from '../../../../redux/onboarding/onboardingSlice';
import { getApiErrorMessage } from '../../../../services/auth/useAuthMutations';
import { refreshAuthSession } from '../../../../services/authService';
import { registerVendor, uploadVendorDocument } from '../../../../services/vendor/vendorApi';
import { usePartnerRegistrationStore } from '../../../../store/partnerRegistrationStore';
import type {
  PartnerRegistrationStackParamList,
  PartnerRootStackParamList,
} from '../../../../types/partnerNavigation';
import type { VendorType } from '../../../../types/vendor';
import { partnerRegistrationGoBack } from '../../../../utils/partnerRegistration';
import { PARTNER_WAITING_ADMIN_APPROVAL } from '../../../../constants/partnerCopy';
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

function mapBusinessType(value: string): VendorType {
  const lower = value.toLowerCase();
  if (lower.includes('tow') && lower.includes('truck')) return 'tow_truck_driver';
  if (lower.includes('mechanic')) return 'mechanic';
  if (lower.includes('full')) return 'full_time_driver';
  if (lower.includes('part')) return 'part_time_driver';
  return 'towing_company';
}

const VENDOR_DOC_TYPE_MAP: Record<string, string> = {
  aadhaar: 'aadhaar',
  pan: 'pan',
  gst: 'gst',
  business_registration: 'shop_license',
  shop_photo: 'vehicle_photo',
  cancelled_cheque: 'cancelled_cheque',
  profile_photo: 'selfie',
};

export default function VendorReviewScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(state => state.auth.user);
  const { vendorBusiness, vendorAddress, vendorDocuments } = usePartnerRegistrationStore();
  const [submitting, setSubmitting] = useState(false);
  const handleBack = () => partnerRegistrationGoBack(navigation, 'VendorReview', route.params);

  const submit = async () => {
    setSubmitting(true);
    try {
      const address = [
        vendorAddress.addressLine1,
        vendorAddress.addressLine2,
        vendorAddress.city,
        vendorAddress.state,
        vendorAddress.pinCode,
      ]
        .filter(Boolean)
        .join(', ');

      await registerVendor({
        vendorType: mapBusinessType(vendorBusiness.businessType || 'towing company'),
        businessName: vendorBusiness.businessName,
        ownerName: vendorBusiness.ownerName || authUser?.fullName || 'Vendor',
        mobileNumber: vendorBusiness.mobileNumber || authUser?.mobileNumber || '',
        email: vendorBusiness.email || undefined,
        address: address || undefined,
        acceptTerms: true,
      });

      try {
        const session = await refreshAuthSession();
        dispatch(
          updateTokens({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
          }),
        );
        dispatch(updateUser(session.user));
      } catch {
        // Backend role middleware falls back to DB role if refresh fails.
      }

      for (const doc of vendorDocuments) {
        const documentType = VENDOR_DOC_TYPE_MAP[doc.id] ?? 'other';
        try {
          await uploadVendorDocument(documentType, {
            uri: doc.uri,
            name: doc.name,
            mimeType: doc.mimeType ?? 'image/jpeg',
          });
        } catch {
          // Registration saved — document upload can be retried from admin review.
        }
      }

      dispatch(finishPartnerSignup());
      if (authUser) {
        dispatch(
          completeOnboarding({
            ...authUser,
            role: 'vendor',
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
    } catch (error) {
      Alert.alert('Submit failed', getApiErrorMessage(error, 'Could not submit vendor application'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PartnerRegistrationLayout
      title="Vendor Registration"
      stepLabel="Step 4 of 4"
      steps={VENDOR_REGISTRATION_STEPS}
      activeStep={4}
      onBack={handleBack}
      footer={
        <PartnerRegistrationFooter
          showBack
          onBack={handleBack}
          continueLabel={submitting ? 'Submitting…' : 'Submit Application'}
          onContinue={() => {
            if (!submitting) void submit();
          }}
        />
      }>
      {submitting ? <ActivityIndicator color={colors.primary} style={{ marginBottom: spacing.md }} /> : null}
      <View style={styles.successCard}>
        <CheckCircle2 size={28} color={colors.partnerRed} strokeWidth={2} />
        <Text style={styles.successTitle}>Review your application</Text>
        <Text style={styles.successSubtitle}>{PARTNER_WAITING_ADMIN_APPROVAL}</Text>
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
        {vendorDocuments.map(doc => (
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
