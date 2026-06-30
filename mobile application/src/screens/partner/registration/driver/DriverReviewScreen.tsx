import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PartnerRegistrationLayout from '../../../../components/partner/PartnerRegistrationLayout';
import { PartnerRegistrationFooter } from '../../../../components/partner/PartnerRegistrationSections';
import { DRIVER_REGISTRATION_STEPS } from '../../../../constants/partnerRegistration';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { completeOnboarding } from '../../../../redux/auth/authSlice';
import { finishPartnerSignup } from '../../../../redux/onboarding/onboardingSlice';
import { usePartnerRegistrationStore } from '../../../../store/partnerRegistrationStore';
import type {
  PartnerRegistrationStackParamList,
  PartnerRootStackParamList,
} from '../../../../types/partnerNavigation';
import { colors, radius, spacing, typography } from '../../../../theme';

type Props = NativeStackScreenProps<PartnerRegistrationStackParamList, 'DriverReview'>;

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  );
}

export default function DriverReviewScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const { driverPersonal, driverVehicle, driverDocuments } = usePartnerRegistrationStore();

  const submit = () => {
    dispatch(finishPartnerSignup());
    if (authUser) {
      dispatch(
        completeOnboarding({
          ...authUser,
          fullName: driverPersonal.fullName || authUser.fullName,
          email: driverPersonal.email || authUser.email,
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
      title="Driver Registration"
      stepLabel="Step 4 of 4"
      steps={DRIVER_REGISTRATION_STEPS}
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
          Your application will be verified by Admin before you can start receiving jobs.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Personal Information</Text>
      <View style={styles.card}>
        <ReviewRow label="Full Name" value={driverPersonal.fullName} />
        <ReviewRow label="Mobile" value={driverPersonal.mobileNumber} />
        <ReviewRow label="Email" value={driverPersonal.email} />
        <ReviewRow label="Date of Birth" value={driverPersonal.dateOfBirth} />
        <ReviewRow label="Address" value={driverPersonal.address} />
      </View>

      <Text style={styles.sectionTitle}>Vehicle Information</Text>
      <View style={styles.card}>
        <ReviewRow label="Vehicle Type" value={driverVehicle.vehicleType} />
        <ReviewRow label="Vehicle Number" value={driverVehicle.vehicleNumber} />
        <ReviewRow label="RC Number" value={driverVehicle.rcNumber} />
        <ReviewRow label="Insurance" value={driverVehicle.insuranceProvider} />
        <ReviewRow label="Policy Number" value={driverVehicle.insurancePolicyNumber} />
        <ReviewRow label="Model" value={driverVehicle.vehicleModel} />
      </View>

      <Text style={styles.sectionTitle}>Documents ({driverDocuments.length})</Text>
      <View style={styles.card}>
        {driverDocuments.map((doc) => (
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
