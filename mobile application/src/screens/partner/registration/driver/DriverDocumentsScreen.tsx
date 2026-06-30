import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { FileStack } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PartnerDocumentUploadList from '../../../../components/partner/PartnerDocumentUploadList';
import PartnerRegistrationLayout from '../../../../components/partner/PartnerRegistrationLayout';
import {
  PartnerRegistrationFooter,
  PartnerSectionHeader,
} from '../../../../components/partner/PartnerRegistrationSections';
import { DRIVER_REGISTRATION_STEPS } from '../../../../constants/partnerRegistration';
import {
  DRIVER_DOCUMENTS,
  getRequiredDocumentIds,
} from '../../../../constants/partnerRegistrationDocuments';
import { usePartnerRegistrationStore } from '../../../../store/partnerRegistrationStore';
import type { PartnerRegistrationStackParamList } from '../../../../types/partnerNavigation';
import { colors, spacing, typography } from '../../../../theme';

type Props = NativeStackScreenProps<PartnerRegistrationStackParamList, 'DriverDocuments'>;

const REQUIRED_IDS = getRequiredDocumentIds(DRIVER_DOCUMENTS);

export default function DriverDocumentsScreen({ navigation, route }: Props) {
  const driverDocuments = usePartnerRegistrationStore((s) => s.driverDocuments);
  const addDriverDocument = usePartnerRegistrationStore((s) => s.addDriverDocument);
  const [error, setError] = useState('');

  const uploadedIds = driverDocuments.map((doc) => doc.id);
  const missingCount = REQUIRED_IDS.filter((id) => !uploadedIds.includes(id)).length;

  return (
    <PartnerRegistrationLayout
      title="Driver Registration"
      stepLabel="Step 3 of 4"
      steps={DRIVER_REGISTRATION_STEPS}
      activeStep={3}
      onBack={() => navigation.goBack()}
      footer={
        <PartnerRegistrationFooter
          showBack
          onBack={() => navigation.goBack()}
          continueDisabled={missingCount > 0}
          onContinue={() => {
            if (missingCount > 0) {
              setError(`Upload ${missingCount} more required document(s)`);
              return;
            }
            setError('');
            navigation.navigate('DriverReview', route.params);
          }}
        />
      }>
      <PartnerSectionHeader
        Icon={FileStack}
        title="Upload Documents"
        subtitle="Please upload clear photos or scans of the required documents"
      />

      <PartnerDocumentUploadList
        documents={DRIVER_DOCUMENTS}
        uploadedIds={uploadedIds}
        onUpload={(id, uri, name, mimeType) => {
          const label = DRIVER_DOCUMENTS.find((doc) => doc.id === id)?.label ?? id;
          addDriverDocument({ id, label, uri, name, mimeType });
          setError('');
        }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </PartnerRegistrationLayout>
  );
}

const styles = StyleSheet.create({
  error: {
    marginTop: spacing.md,
    color: colors.error,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
});
