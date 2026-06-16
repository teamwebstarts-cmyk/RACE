import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthToast, { AuthLoadingOverlay } from '../../components/auth/AuthToast';
import BrandLogo from '../../components/ui/BrandLogo';
import FormField from '../../components/ui/FormField';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ProgressStepper from '../../components/ui/ProgressStepper';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { completeOnboarding } from '../../redux/auth/authSlice';
import { setCurrentStep, setProfileDraft, startVehicleOnboarding } from '../../redux/onboarding/onboardingSlice';
import {
  getApiErrorMessage,
  useCompleteProfileMutation,
} from '../../services/auth/useAuthMutations';
import type { AuthStackParamList } from '../../types/navigation';
import type { CompleteProfileRequest } from '../../types/auth';
import { isVendorRole } from '../../utils/roleRouting';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileWizard'>;

const STEP_LABELS = [
  'Personal Information',
  'Emergency Details',
  'Address',
  'Profile Photo',
  'Complete',
];

const GENDERS: CompleteProfileRequest['gender'][] = [
  'male',
  'female',
  'other',
  'prefer_not_to_say',
];

function resetToLogin(navigation: Props['navigation']) {
  navigation.reset({
    index: 0,
    routes: [{ name: 'MobileNumber' }],
  });
}

export default function ProfileWizardScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.auth.loading);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const draft = useAppSelector((state) => state.onboarding.profileDraft);
  const currentStep = useAppSelector((state) => state.onboarding.currentStep);

  const [error, setError] = useState('');
  const completeProfileMutation = useCompleteProfileMutation();

  useEffect(() => {
    if (!accessToken) {
      setError('Your session expired. Please log in again.');
      resetToLogin(navigation);
    }
  }, [accessToken, navigation]);

  const form = useMemo(
    () => ({
      fullName: draft.fullName ?? '',
      email: draft.email ?? '',
      gender: draft.gender ?? ('male' as CompleteProfileRequest['gender']),
      dateOfBirth: draft.dateOfBirth ?? '',
      emergencyName: draft.emergencyContact?.name ?? '',
      emergencyMobile: draft.emergencyContact?.mobileNumber ?? '',
      emergencyRelationship: draft.emergencyContact?.relationship ?? '',
      address: draft.address?.line1 ?? '',
      city: draft.address?.city ?? '',
      state: draft.address?.state ?? '',
      pincode: draft.address?.pincode ?? '',
      profilePhoto: draft.profilePhoto ?? '',
    }),
    [draft],
  );

  const updateDraft = (patch: Partial<CompleteProfileRequest>) => {
    dispatch(setProfileDraft(patch));
  };

  const goNext = () => {
    setError('');
    if (currentStep === 1) {
      if (!form.fullName.trim() || !form.email.trim()) {
        setError('Full name and email are required');
        return;
      }
      updateDraft({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || undefined,
      });
    }
    if (currentStep === 2) {
      if (!form.emergencyName.trim() || form.emergencyMobile.length !== 10) {
        setError('Valid emergency contact is required');
        return;
      }
      updateDraft({
        emergencyContact: {
          name: form.emergencyName.trim(),
          mobileNumber: form.emergencyMobile,
          relationship: form.emergencyRelationship.trim() || undefined,
        },
      });
    }
    if (currentStep === 3) {
      if (!form.address.trim() || !form.city.trim() || !form.state.trim() || form.pincode.length !== 6) {
        setError('Complete address with 6-digit pincode is required');
        return;
      }
      updateDraft({
        address: {
          line1: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode,
          country: 'India',
        },
      });
    }
    if (currentStep === 4) {
      updateDraft({ profilePhoto: form.profilePhoto.trim() || undefined });
    }
    dispatch(setCurrentStep(currentStep + 1));
  };

  const handleSubmit = async () => {
    setError('');

    if (!accessToken) {
      setError('Your session expired. Please log in again.');
      resetToLogin(navigation);
      return;
    }

    const payload: CompleteProfileRequest = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || undefined,
      emergencyContact: {
        name: form.emergencyName.trim(),
        mobileNumber: form.emergencyMobile,
        relationship: form.emergencyRelationship.trim() || undefined,
      },
      address: {
        line1: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode,
        country: 'India',
      },
      profilePhoto: form.profilePhoto.trim() || undefined,
    };

    try {
      const updatedUser = await completeProfileMutation.mutateAsync(payload);
      if (isVendorRole(updatedUser)) {
        dispatch(completeOnboarding(updatedUser));
        return;
      }
      dispatch(startVehicleOnboarding());
      navigation.replace('AddFirstVehicle');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Your session expired. Please log in again.');
        resetToLogin(navigation);
        return;
      }
      setError(getApiErrorMessage(err, 'Unable to save profile'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <BrandLogo size="medium" />
            <Text style={styles.title}>Profile Setup</Text>
            <Text style={styles.subtitle}>Premium onboarding for roadside assistance</Text>
          </View>

          <ProgressStepper currentStep={currentStep} totalSteps={5} labels={STEP_LABELS} />

          <GlassCard>
            {currentStep === 1 ? (
              <>
                <Text style={styles.stepTitle}>Personal Information</Text>
                <FormField dark label="Full Name" value={form.fullName} onChangeText={(v) => updateDraft({ fullName: v })} placeholder="Your full name" />
                <FormField dark label="Email" value={form.email} onChangeText={(v) => updateDraft({ email: v })} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
                <FormField dark label="Date of Birth" value={form.dateOfBirth} onChangeText={(v) => updateDraft({ dateOfBirth: v })} placeholder="YYYY-MM-DD" />
                <Text style={styles.label}>Gender</Text>
                <View style={styles.chipRow}>
                  {GENDERS.map((item) => (
                    <TouchableOpacity key={item} onPress={() => updateDraft({ gender: item })} style={[styles.chip, form.gender === item && styles.chipActive]}>
                      <Text style={[styles.chipText, form.gender === item && styles.chipTextActive]}>{item.replace(/_/g, ' ')}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : null}

            {currentStep === 2 ? (
              <>
                <Text style={styles.stepTitle}>Emergency Details</Text>
                <FormField dark label="Emergency Contact Name" value={form.emergencyName} onChangeText={(v) => updateDraft({ emergencyContact: { ...draft.emergencyContact, name: v, mobileNumber: form.emergencyMobile } })} placeholder="Contact person" />
                <FormField dark label="Emergency Contact Number" value={form.emergencyMobile} onChangeText={(v) => updateDraft({ emergencyContact: { name: form.emergencyName, mobileNumber: v.replace(/\D/g, '').slice(0, 10), relationship: form.emergencyRelationship } })} placeholder="10-digit mobile" keyboardType="number-pad" />
                <FormField dark label="Relationship (optional)" value={form.emergencyRelationship} onChangeText={(v) => updateDraft({ emergencyContact: { name: form.emergencyName, mobileNumber: form.emergencyMobile, relationship: v } })} placeholder="Spouse, Parent..." />
              </>
            ) : null}

            {currentStep === 3 ? (
              <>
                <Text style={styles.stepTitle}>Address</Text>
                <FormField dark label="Address" value={form.address} onChangeText={(v) => updateDraft({ address: { ...draft.address, line1: v, city: form.city, state: form.state, pincode: form.pincode, country: 'India' } })} placeholder="House no, street, area" />
                <FormField dark label="City" value={form.city} onChangeText={(v) => updateDraft({ address: { line1: form.address, city: v, state: form.state, pincode: form.pincode, country: 'India' } })} placeholder="City" />
                <FormField dark label="State" value={form.state} onChangeText={(v) => updateDraft({ address: { line1: form.address, city: form.city, state: v, pincode: form.pincode, country: 'India' } })} placeholder="State" />
                <FormField dark label="Pincode" value={form.pincode} onChangeText={(v) => updateDraft({ address: { line1: form.address, city: form.city, state: form.state, pincode: v.replace(/\D/g, '').slice(0, 6), country: 'India' } })} placeholder="6-digit pincode" keyboardType="number-pad" />
              </>
            ) : null}

            {currentStep === 4 ? (
              <>
                <Text style={styles.stepTitle}>Profile Photo</Text>
                <Text style={styles.hint}>Upload a clear photo for faster roadside identification. You can skip this step.</Text>
                <FormField dark label="Photo URL (optional)" value={form.profilePhoto} onChangeText={(v) => updateDraft({ profilePhoto: v })} placeholder="https://..." autoCapitalize="none" />
                <PrimaryButton label="Skip Photo" onPress={goNext} variant="outline" />
              </>
            ) : null}

            {currentStep === 5 ? (
              <View style={styles.completeWrap}>
                <Text style={styles.completeEmoji}>✓</Text>
                <Text style={styles.stepTitle}>Your account is ready</Text>
                <Text style={styles.hint}>Next, add your first vehicle to unlock emergency QR and quick booking.</Text>
              </View>
            ) : null}

            <AuthToast message={error} />

            {currentStep < 5 ? (
              <PrimaryButton label="Continue" onPress={goNext} />
            ) : (
              <PrimaryButton label={loading ? 'Saving...' : 'Continue'} onPress={() => void handleSubmit()} disabled={loading} />
            )}
          </GlassCard>
        </ScrollView>
        <AuthLoadingOverlay visible={loading} label="Saving profile..." />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surfaceDarker },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  title: { marginTop: spacing.md, color: colors.textLight, fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold },
  subtitle: { marginTop: spacing.sm, color: colors.subtext, textAlign: 'center' },
  stepTitle: { color: colors.textLight, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  label: { color: colors.subtext, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, marginBottom: spacing.xs },
  hint: { color: colors.subtext, lineHeight: 20, marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.subtext, textTransform: 'capitalize' },
  chipTextActive: { color: colors.textLight, fontWeight: typography.weights.bold },
  completeWrap: { alignItems: 'center', paddingVertical: spacing.lg },
  completeEmoji: { fontSize: 48, color: colors.secondary, marginBottom: spacing.md },
});
