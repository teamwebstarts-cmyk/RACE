import React from 'react';
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
import { usePartnerRegistrationStore } from '../../../../store/partnerRegistrationStore';
import type { PartnerRegistrationStackParamList } from '../../../../types/partnerNavigation';
import { partnerRegistrationGoBack } from '../../../../utils/partnerRegistration';

type Props = NativeStackScreenProps<PartnerRegistrationStackParamList, 'VendorDocuments'>;

export default function VendorDocumentsScreen({ navigation, route }: Props) {
  const vendorDocuments = usePartnerRegistrationStore((s) => s.vendorDocuments);
  const addVendorDocument = usePartnerRegistrationStore((s) => s.addVendorDocument);

  const uploadedIds = vendorDocuments.map((doc) => doc.id);
  const handleBack = () => partnerRegistrationGoBack(navigation, 'VendorDocuments', route.params);

  return (
    <PartnerRegistrationLayout
      title="Vendor Registration"
      stepLabel="Step 3 of 4"
      steps={VENDOR_REGISTRATION_STEPS}
      activeStep={3}
      onBack={handleBack}
      footer={
        <PartnerRegistrationFooter
          showBack
          onBack={handleBack}
          onContinue={() => navigation.navigate('VendorReview', route.params)}
        />
      }>
      <PartnerSectionHeader
        Icon={FileStack}
        title="Upload Documents"
        subtitle="Optional for now — you can upload clear photos later, or continue without them"
      />

      <PartnerDocumentUploadList
        documents={VENDOR_DOCUMENTS}
        uploadedIds={uploadedIds}
        onUpload={(id, uri, name, mimeType) => {
          const label = VENDOR_DOCUMENTS.find((doc) => doc.id === id)?.label ?? id;
          addVendorDocument({ id, label, uri, name, mimeType });
        }}
      />
    </PartnerRegistrationLayout>
  );
}
