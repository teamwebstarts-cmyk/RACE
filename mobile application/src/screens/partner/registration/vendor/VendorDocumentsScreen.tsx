import React from 'react';
import { Alert } from 'react-native';
import { FileStack } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PartnerDocumentUploadList from '../../../../components/partner/PartnerDocumentUploadList';
import PartnerRegistrationLayout from '../../../../components/partner/PartnerRegistrationLayout';
import {
  PartnerRegistrationFooter,
  PartnerSectionHeader,
} from '../../../../components/partner/PartnerRegistrationSections';
import { VENDOR_REGISTRATION_STEPS } from '../../../../constants/partnerRegistration';
import { VENDOR_DOCUMENTS } from '../../../../constants/partnerRegistrationDocuments';
import {
  getMissingRequiredDocuments,
  mapVendorTypeFromBusinessLabel,
} from '../../../../constants/backendRequiredDocuments';
import { usePartnerRegistrationStore } from '../../../../store/partnerRegistrationStore';
import type { PartnerRegistrationStackParamList } from '../../../../types/partnerNavigation';
import { partnerRegistrationGoBack } from '../../../../utils/partnerRegistration';

type Props = NativeStackScreenProps<PartnerRegistrationStackParamList, 'VendorDocuments'>;

export default function VendorDocumentsScreen({ navigation, route }: Props) {
  const vendorBusiness = usePartnerRegistrationStore(s => s.vendorBusiness);
  const vendorDocuments = usePartnerRegistrationStore(s => s.vendorDocuments);
  const addVendorDocument = usePartnerRegistrationStore(s => s.addVendorDocument);

  const uploadedIds = vendorDocuments.map(doc => doc.id);
  const handleBack = () => partnerRegistrationGoBack(navigation, 'VendorDocuments', route.params);

  const handleContinue = () => {
    const vendorType = mapVendorTypeFromBusinessLabel(
      vendorBusiness.businessType || 'towing company',
    );
    const missing = getMissingRequiredDocuments(vendorType, uploadedIds);
    if (missing.length > 0) {
      Alert.alert(
        'Required documents',
        `Upload these before continuing: ${missing.join(', ').replace(/_/g, ' ')}`,
      );
      return;
    }
    navigation.navigate('VendorReview', route.params);
  };

  return (
    <PartnerRegistrationLayout
      title="Vendor Registration"
      stepLabel="Step 3 of 4"
      steps={VENDOR_REGISTRATION_STEPS}
      activeStep={3}
      onBack={handleBack}
      footer={
        <PartnerRegistrationFooter showBack onBack={handleBack} onContinue={handleContinue} />
      }>
      <PartnerSectionHeader
        Icon={FileStack}
        title="Upload Documents"
        subtitle="Upload the required KYC documents for your business type before submitting"
      />

      <PartnerDocumentUploadList
        documents={VENDOR_DOCUMENTS}
        uploadedIds={uploadedIds}
        onUpload={(id, uri, name, mimeType) => {
          const label = VENDOR_DOCUMENTS.find(doc => doc.id === id)?.label ?? id;
          addVendorDocument({ id, label, uri, name, mimeType });
        }}
      />
    </PartnerRegistrationLayout>
  );
}
