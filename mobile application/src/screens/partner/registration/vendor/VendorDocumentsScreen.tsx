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
import { VENDOR_REGISTRATION_STEPS } from '../../../../constants/partnerRegistration';
import {
  VENDOR_DOCUMENTS,
  getRequiredDocumentIds,
} from '../../../../constants/partnerRegistrationDocuments';
import { usePartnerRegistrationStore } from '../../../../store/partnerRegistrationStore';
import type { PartnerRegistrationStackParamList } from '../../../../types/partnerNavigation';
import { colors, spacing, typography } from '../../../../theme';

type Props = NativeStackScreenProps<PartnerRegistrationStackParamList, 'VendorDocuments'>;

const REQUIRED_IDS = getRequiredDocumentIds(VENDOR_DOCUMENTS);

export default function VendorDocumentsScreen({ navigation, route }: Props) {
  const vendorDocuments = usePartnerRegistrationStore((s) => s.vendorDocuments);
  const addVendorDocument = usePartnerRegistrationStore((s) => s.addVendorDocument);
  const [error, setError] = useState('');

  const uploadedIds = vendorDocuments.map((doc) => doc.id);
  const missingCount = REQUIRED_IDS.filter((id) => !uploadedIds.includes(id)).length;

  return (
    <PartnerRegistrationLayout
      title="Vendor Registration"
      stepLabel="Step 3 of 4"
      steps={VENDOR_REGISTRATION_STEPS}
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
            navigation.navigate('VendorReview', route.params);
          }}
        />
      }>
      <PartnerSectionHeader
        Icon={FileStack}
        title="Upload Documents"
        subtitle="Please upload clear photos or scans of the required documents"
      />

      <PartnerDocumentUploadList
        documents={VENDOR_DOCUMENTS}
        uploadedIds={uploadedIds}
        onUpload={(id, uri, name, mimeType) => {
          const label = VENDOR_DOCUMENTS.find((doc) => doc.id === id)?.label ?? id;
          addVendorDocument({ id, label, uri, name, mimeType });
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
