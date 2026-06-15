import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthToast, { AuthLoadingOverlay } from '../../components/auth/AuthToast';
import BrandLogo from '../../components/ui/BrandLogo';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAppSelector } from '../../redux/hooks';
import {
  getApiErrorMessage,
  useCompleteProfileMutation,
} from '../../services/auth/useAuthMutations';
import type { AuthStackParamList } from '../../types/navigation';
import type { CompleteProfileRequest } from '../../types/auth';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileCompletion'>;

const GENDERS: CompleteProfileRequest['gender'][] = [
  'male',
  'female',
  'other',
  'prefer_not_to_say',
];

export default function ProfileCompletionScreen(_props: Props) {
  const loading = useAppSelector((state) => state.auth.loading);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<CompleteProfileRequest['gender']>('male');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyMobile, setEmergencyMobile] = useState('');
  const [error, setError] = useState('');

  const completeProfileMutation = useCompleteProfileMutation();

  const handleContinue = async () => {
    setError('');

    if (!fullName.trim() || !email.trim() || !emergencyName.trim() || emergencyMobile.length !== 10) {
      setError('Please fill all required fields correctly');
      return;
    }

    try {
      await completeProfileMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        gender,
        emergencyContact: {
          name: emergencyName.trim(),
          mobileNumber: emergencyMobile,
        },
      });
    } catch (err) {
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
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>
              One-time setup — you will not need to enter this again on future logins.
            </Text>
          </View>

          <View style={styles.card}>
            <Field label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Your full name" />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDERS.map((item) => (
                <Text
                  key={item}
                  onPress={() => setGender(item)}
                  style={[styles.genderChip, gender === item && styles.genderChipActive]}>
                  {item.replace(/_/g, ' ')}
                </Text>
              ))}
            </View>

            <Field
              label="Emergency Contact Name"
              value={emergencyName}
              onChangeText={setEmergencyName}
              placeholder="Contact person name"
            />
            <Field
              label="Emergency Contact Mobile"
              value={emergencyMobile}
              onChangeText={(text) => setEmergencyMobile(text.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile"
              keyboardType="number-pad"
            />

            <AuthToast message={error} />

            <PrimaryButton
              label={loading ? 'Saving...' : 'Continue'}
              onPress={handleContinue}
              disabled={loading}
            />
          </View>
        </ScrollView>
        <AuthLoadingOverlay visible={loading} label="Saving profile..." />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences';
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceDarker,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  title: {
    marginTop: spacing.md,
    color: colors.textLight,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 195, 38, 0.25)',
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textDark,
    backgroundColor: colors.backgroundSoft,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  genderChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundSoft,
    color: colors.textDark,
    overflow: 'hidden',
    textTransform: 'capitalize',
  },
  genderChipActive: {
    backgroundColor: colors.primary,
    color: colors.textDark,
    fontWeight: typography.weights.bold,
  },
});
