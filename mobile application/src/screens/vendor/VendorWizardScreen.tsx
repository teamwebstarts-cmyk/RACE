import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthToast from '../../components/auth/AuthToast';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ProgressStepper from '../../components/ui/ProgressStepper';
import BankDetailsStep from '../../components/vendor/steps/BankDetailsStep';
import BusinessInfoStep from '../../components/vendor/steps/BusinessInfoStep';
import DocumentsStep from '../../components/vendor/steps/DocumentsStep';
import ExperienceStep, { AvailabilityStep } from '../../components/vendor/steps/ExperienceStep';
import SelfieStep from '../../components/vendor/steps/SelfieStep';
import VehicleInfoStep from '../../components/vendor/steps/VehicleInfoStep';
import { getVendorConfig } from '../../data/vendorWizardConfig';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  removeVendorDocument,
  setVendorStep,
  startVendorWizard,
  updateVendorDraft,
  upsertVendorDocument,
} from '../../redux/vendor/vendorOnboardingSlice';
import { getApiErrorMessage } from '../../services/api/apiClient';
import {
  useRegisterVendorMutation,
  useSaveVendorDraftMutation,
  useUploadVendorDocumentMutation,
  useUploadVendorSelfieMutation,
} from '../../services/vendor/useVendorMutations';
import type { AuthStackParamList, ProfileStackParamList } from '../../types/navigation';
import type { VendorDraft, WizardStepConfig, UploadedDocument } from '../../types/vendor';
import { colors, spacing, typography } from '../../theme';
import type { PickedFile } from '../../components/vendor/DocumentUpload';

type Props = NativeStackScreenProps<
  AuthStackParamList & ProfileStackParamList,
  'VendorWizard'
>;

function validateStep(step: WizardStepConfig, draft: VendorDraft): string | null {
  if (step.kind === 'business_info' || step.kind === 'personal_info') {
    if (draft.vendorType === 'towing_company' && !draft.businessName?.trim()) {
      return 'Business name is required';
    }
    if (!draft.ownerName.trim()) return 'Name is required';
    if (draft.mobileNumber.length < 10) return 'Valid mobile number is required';
    if (!draft.address?.trim()) return 'Address is required';
  }
  if (step.kind === 'documents' && step.documents) {
    for (const doc of step.documents) {
      if (doc.required) {
        const uploaded = draft.documents.find((d) => d.documentType === doc.type);
        if (!uploaded?.fileUrl) return `${doc.label} is required`;
      }
    }
  }
  if (step.kind === 'vehicle_info') {
    if (!draft.towVehicle?.registrationNumber?.trim()) return 'Vehicle registration is required';
  }
  if (step.kind === 'bank_details') {
    if (!draft.bankDetails?.accountHolderName?.trim()) return 'Account holder name is required';
    if (!draft.bankDetails?.accountNumber?.trim()) return 'Account number is required';
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(draft.bankDetails?.ifsc ?? '')) return 'Valid IFSC is required';
  }
  if (step.kind === 'selfie') {
    const selfie = draft.documents.find((d) => d.documentType === 'selfie');
    if (!selfie?.fileUrl) return 'Selfie verification is required';
    if (!draft.acceptTerms) return 'Please accept terms and digital consent';
  }
  return null;
}

export default function VendorWizardScreen({ navigation, route }: Props) {
  const { vendorType } = route.params;
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const draft = useAppSelector((state) => state.vendorOnboarding.draft);
  const currentStep = useAppSelector((state) => state.vendorOnboarding.currentStep);

  const config = useMemo(() => getVendorConfig(vendorType), [vendorType]);
  const steps = config?.steps ?? [];
  const stepConfig = steps[currentStep - 1];

  const [error, setError] = useState('');
  const [uploadingType, setUploadingType] = useState<string | undefined>();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<Record<string, PickedFile>>({});

  const saveDraftMutation = useSaveVendorDraftMutation();
  const registerMutation = useRegisterVendorMutation();
  const uploadDocMutation = useUploadVendorDocumentMutation();
  const uploadSelfieMutation = useUploadVendorSelfieMutation();

  React.useEffect(() => {
    if (!draft || draft.vendorType !== vendorType) {
      dispatch(
        startVendorWizard({
          vendorType,
          prefill: {
            ownerName: user?.fullName ?? '',
            mobileNumber: user?.mobileNumber ?? '',
            email: user?.email,
          },
        }),
      );
    }
  }, [dispatch, draft, user, vendorType]);

  const handleChange = useCallback(
    (patch: Partial<VendorDraft>) => {
      dispatch(updateVendorDraft(patch));
    },
    [dispatch],
  );

  const uploadFile = useCallback(
    async (documentType: string, file: PickedFile) => {
      setUploadingType(documentType);
      setUploadProgress(0);
      setError('');
      setPendingFiles((prev) => ({ ...prev, [documentType]: file }));

      dispatch(
        upsertVendorDocument({
          documentType: documentType as VendorDraft['documents'][number]['documentType'],
          fileUrl: '',
          fileName: file.name,
          mimeType: file.mimeType,
          localUri: file.uri,
        }),
      );

      try {
        if (!draft) return;
        await saveDraftMutation.mutateAsync({
          vendorType: draft.vendorType,
          ownerName: draft.ownerName,
          mobileNumber: draft.mobileNumber,
        });

        const result =
          documentType === 'selfie'
            ? await uploadSelfieMutation.mutateAsync({
                file,
                onProgress: setUploadProgress,
              })
            : await uploadDocMutation.mutateAsync({
                documentType,
                file,
                onProgress: setUploadProgress,
              });

        const uploaded = result.documents.find((d) => d.documentType === documentType);
        if (uploaded) {
          dispatch(
            upsertVendorDocument({
              documentType: documentType as VendorDraft['documents'][number]['documentType'],
              fileUrl: uploaded.fileUrl,
              fileName: uploaded.fileName,
              mimeType: uploaded.mimeType,
              verificationStatus: uploaded.verificationStatus,
            }),
          );
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Upload failed'));
      } finally {
        setUploadingType(undefined);
      }
    },
    [dispatch, draft, saveDraftMutation, uploadDocMutation, uploadSelfieMutation],
  );

  const handleContinue = async () => {
    if (!draft || !stepConfig) return;
    setError('');
    const validationError = validateStep(stepConfig, draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await saveDraftMutation.mutateAsync({
        vendorType: draft.vendorType,
        businessName: draft.businessName,
        ownerName: draft.ownerName,
        mobileNumber: draft.mobileNumber,
        email: draft.email,
        address: draft.address,
        towVehicle: draft.towVehicle,
        bankDetails: draft.bankDetails,
        driverProfile: draft.driverProfile,
        documents: draft.documents
          .filter((d: UploadedDocument) => d.fileUrl)
          .map((d: UploadedDocument) => ({
            documentType: d.documentType,
            fileUrl: d.fileUrl,
            fileName: d.fileName,
          })),
      });
    } catch {
      // non-blocking draft save
    }

    if (currentStep < steps.length) {
      dispatch(setVendorStep(currentStep + 1));
      return;
    }

    navigation.navigate('VendorReview', { vendorType });
  };

  const renderStep = () => {
    if (!draft || !stepConfig) return null;

    switch (stepConfig.kind) {
      case 'business_info':
        return (
          <BusinessInfoStep draft={draft} onChange={handleChange} isCompany />
        );
      case 'personal_info':
        return <BusinessInfoStep draft={draft} onChange={handleChange} />;
      case 'documents':
        return (
          <DocumentsStep
            documents={stepConfig.documents ?? []}
            uploaded={draft.documents}
            uploadingType={uploadingType}
            uploadProgress={uploadProgress}
            uploadError={error}
            onUpload={(type, file) => void uploadFile(type, file)}
            onRemove={(type) => dispatch(removeVendorDocument(type))}
            onRetry={(type) => {
              const file = pendingFiles[type];
              if (file) void uploadFile(type, file);
            }}
          />
        );
      case 'vehicle_info':
        return (
          <>
            <VehicleInfoStep draft={draft} onChange={handleChange} />
            {stepConfig.documents?.length ? (
              <DocumentsStep
                documents={stepConfig.documents}
                uploaded={draft.documents}
                uploadingType={uploadingType}
                uploadProgress={uploadProgress}
                onUpload={(type, file) => void uploadFile(type, file)}
                onRemove={(type) => dispatch(removeVendorDocument(type))}
              />
            ) : null}
          </>
        );
      case 'bank_details':
        return <BankDetailsStep draft={draft} onChange={handleChange} />;
      case 'experience':
        return <ExperienceStep draft={draft} onChange={handleChange} />;
      case 'availability':
        return <AvailabilityStep draft={draft} onChange={handleChange} />;
      case 'selfie':
        return (
          <SelfieStep
            selfie={draft.documents.find((d: UploadedDocument) => d.documentType === 'selfie')}
            accepted={draft.acceptTerms}
            uploading={uploadingType === 'selfie'}
            progress={uploadProgress}
            error={error}
            onAcceptTerms={() => handleChange({ acceptTerms: true })}
            onUpload={(file) => void uploadFile('selfie', file)}
            onRemove={() => dispatch(removeVendorDocument('selfie'))}
          />
        );
      case 'review':
        return (
          <View>
            <Text style={styles.reviewTitle}>Almost there</Text>
            <Text style={styles.reviewText}>
              Review your details on the next screen before submitting for verification.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (!config) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Unknown vendor type</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.emoji}>{config.emoji}</Text>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{stepConfig?.subtitle ?? stepConfig?.title}</Text>

          <ProgressStepper
            currentStep={currentStep}
            totalSteps={steps.length}
            labels={steps.map((s) => s.title)}
          />

          <GlassCard>{renderStep()}</GlassCard>

          <AuthToast message={error} />

          <PrimaryButton
            label={currentStep >= steps.length ? 'Review Application' : 'Continue'}
            onPress={() => void handleContinue()}
            disabled={saveDraftMutation.isPending || registerMutation.isPending}
          />

          {currentStep > 1 ? (
            <PrimaryButton
              label="Back"
              variant="outline"
              onPress={() => dispatch(setVendorStep(currentStep - 1))}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surfaceDarker },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  emoji: { fontSize: 36, textAlign: 'center' },
  title: {
    color: colors.textLight,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  reviewTitle: {
    color: colors.textLight,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  reviewText: { color: colors.subtext, lineHeight: 20 },
});
