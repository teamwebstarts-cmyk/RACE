import React from 'react';
import { FileStack } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PartnerDocumentUploadList from '../../../../components/partner/PartnerDocumentUploadList';
import PartnerRegistrationLayout from '../../../../components/partner/PartnerRegistrationLayout';
import {
  PartnerRegistrationFooter,
  PartnerSectionHeader,
} from '../../../../components/partner/PartnerRegistrationSections';
import { DRIVER_REGISTRATION_STEPS } from '../../../../constants/partnerRegistration';
import { DRIVER_DOCUMENTS } from '../../../../constants/partnerRegistrationDocuments';
import { usePartnerRegistrationStore } from '../../../../store/partnerRegistrationStore';
import type { PartnerRegistrationStackParamList } from '../../../../types/partnerNavigation';
import { partnerRegistrationGoBack } from '../../../../utils/partnerRegistration';

type Props = NativeStackScreenProps<PartnerRegistrationStackParamList, 'DriverDocuments'>;

export default function DriverDocumentsScreen({ navigation, route }: Props) {
  const driverDocuments = usePartnerRegistrationStore((s) => s.driverDocuments);
  const addDriverDocument = usePartnerRegistrationStore((s) => s.addDriverDocument);

  const uploadedIds = driverDocuments.map((doc) => doc.id);
  const handleBack = () => partnerRegistrationGoBack(navigation, 'DriverDocuments', route.params);

  return (
    <PartnerRegistrationLayout
      title="Driver Registration"
      stepLabel="Step 3 of 4"
      steps={DRIVER_REGISTRATION_STEPS}
      activeStep={3}
      onBack={handleBack}
      footer={
        <PartnerRegistrationFooter
          showBack
          onBack={handleBack}
          onContinue={() => navigation.navigate('DriverReview', route.params)}
        />
      }>
      <PartnerSectionHeader
        Icon={FileStack}
        title="Upload Documents"
        subtitle="Optional for now — you can upload clear photos later, or continue without them"
      />

      <PartnerDocumentUploadList
        documents={DRIVER_DOCUMENTS}
        uploadedIds={uploadedIds}
        onUpload={(id, uri, name, mimeType) => {
          const label = DRIVER_DOCUMENTS.find((doc) => doc.id === id)?.label ?? id;
          addDriverDocument({ id, label, uri, name, mimeType });
        }}
      />
    </PartnerRegistrationLayout>
  );
}
