import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthToast from '../../components/auth/AuthToast';
import FormField from '../../components/ui/FormField';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ProgressStepper from '../../components/ui/ProgressStepper';
import { useAppSelector } from '../../redux/hooks';
import { getApiErrorMessage } from '../../services/api/apiClient';
import { useRegisterVendorMutation } from '../../services/vendor/useVendorMutations';
import type { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'VendorOnboarding'>;

export default function VendorOnboardingScreen({ navigation, route }: Props) {
  const { vendorType } = route.params;
  const user = useAppSelector((state) => state.auth.user);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState(user?.fullName ?? '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [address, setAddress] = useState('');
  const [aadhaarUrl, setAadhaarUrl] = useState('');
  const [panUrl, setPanUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [towVehicleType, setTowVehicleType] = useState('flatbed');

  const registerMutation = useRegisterVendorMutation();
  const isCompany = vendorType === 'towing_company';
  const totalSteps = isCompany ? 4 : 4;

  const handleSubmit = async () => {
    setError('');
    if (!acceptedTerms) {
      setError('Please accept terms and conditions');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        vendorType,
        businessName: isCompany ? businessName : undefined,
        ownerName,
        mobileNumber,
        email: email || undefined,
        address,
        towVehicle:
          vendorType === 'tow_truck_driver'
            ? { registrationNumber: regNumber, vehicleType: towVehicleType }
            : undefined,
        bankDetails:
          vendorType === 'tow_truck_driver'
            ? { accountHolderName: accountHolder, accountNumber, ifsc: ifsc.toUpperCase() }
            : undefined,
        documents: [
          { documentType: 'aadhaar', fileUrl: aadhaarUrl },
          { documentType: 'pan', fileUrl: panUrl },
          { documentType: 'selfie', fileUrl: selfieUrl },
        ].filter((doc) => doc.fileUrl),
        acceptTerms: true,
      });
      navigation.goBack();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to submit application'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Vendor Registration</Text>
        <ProgressStepper currentStep={step} totalSteps={totalSteps} />

        <GlassCard>
          {step === 1 ? (
            <>
              <FormField dark label={isCompany ? 'Business Name' : 'Full Name'} value={isCompany ? businessName : ownerName} onChangeText={isCompany ? setBusinessName : setOwnerName} />
              {isCompany ? <FormField dark label="Owner Name" value={ownerName} onChangeText={setOwnerName} /> : null}
              <FormField dark label="Mobile" value={mobileNumber} onChangeText={(v) => setMobileNumber(v.replace(/\D/g, '').slice(0, 10))} keyboardType="number-pad" />
              <FormField dark label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
              <FormField dark label="Address" value={address} onChangeText={setAddress} />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <FormField dark label="Aadhaar Document URL" value={aadhaarUrl} onChangeText={setAadhaarUrl} autoCapitalize="none" />
              <FormField dark label="PAN Document URL" value={panUrl} onChangeText={setPanUrl} autoCapitalize="none" />
              {isCompany ? (
                <>
                  <FormField dark label="GST (optional) URL" value="" onChangeText={() => undefined} placeholder="Optional" />
                </>
              ) : null}
            </>
          ) : null}

          {step === 3 ? (
            <>
              <FormField dark label="Selfie Verification URL" value={selfieUrl} onChangeText={setSelfieUrl} autoCapitalize="none" />
              {vendorType === 'tow_truck_driver' ? (
                <>
                  <FormField dark label="Tow Vehicle Registration" value={regNumber} onChangeText={setRegNumber} autoCapitalize="characters" />
                  <FormField dark label="Vehicle Type" value={towVehicleType} onChangeText={setTowVehicleType} />
                  <FormField dark label="Account Holder" value={accountHolder} onChangeText={setAccountHolder} />
                  <FormField dark label="Account Number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" />
                  <FormField dark label="IFSC" value={ifsc} onChangeText={setIfsc} autoCapitalize="characters" />
                </>
              ) : null}
              <PrimaryButton
                label={acceptedTerms ? 'Terms Accepted' : 'Accept Terms & Conditions'}
                onPress={() => setAcceptedTerms(true)}
                variant={acceptedTerms ? 'outline' : 'primary'}
              />
            </>
          ) : null}

          {step === 4 ? (
            <View>
              <Text style={styles.reviewTitle}>Review & Submit</Text>
              <Text style={styles.reviewText}>Status after submit: Pending Approval</Text>
              <Text style={styles.reviewText}>Type: {vendorType.replace(/_/g, ' ')}</Text>
              <Text style={styles.reviewText}>Owner: {ownerName}</Text>
            </View>
          ) : null}

          <AuthToast message={error} />

          {step < totalSteps ? (
            <PrimaryButton label="Continue" onPress={() => setStep(step + 1)} />
          ) : (
            <PrimaryButton
              label={registerMutation.isPending ? 'Submitting...' : 'Submit Application'}
              onPress={() => void handleSubmit()}
              disabled={registerMutation.isPending}
            />
          )}
        </GlassCard>

        <PrimaryButton
          label="Need help? Call RACE"
          variant="outline"
          onPress={() => void Linking.openURL('tel:18001234567')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surfaceDarker },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { color: colors.textLight, fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  reviewTitle: { color: colors.textLight, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: spacing.sm },
  reviewText: { color: colors.subtext, marginBottom: spacing.xs, textTransform: 'capitalize' },
});
