import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { ChevronDown, Mail, Phone, Store, User } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import FormField from '../../../../components/auth/FormField';
import PartnerRegistrationLayout from '../../../../components/partner/PartnerRegistrationLayout';
import {
  PartnerRegistrationFooter,
  PartnerSectionHeader,
} from '../../../../components/partner/PartnerRegistrationSections';
import {
  BUSINESS_TYPE_OPTIONS,
  VENDOR_REGISTRATION_STEPS,
} from '../../../../constants/partnerRegistration';
import { usePartnerRegistrationStore } from '../../../../store/partnerRegistrationStore';
import type { PartnerRegistrationStackParamList } from '../../../../types/partnerNavigation';
import {
  isValidEmail,
  partnerRegistrationGoBack,
  showSelectOptions,
} from '../../../../utils/partnerRegistration';
import { colors, spacing, typography } from '../../../../theme';

type Props = NativeStackScreenProps<PartnerRegistrationStackParamList, 'VendorBusinessInfo'>;

export default function VendorBusinessInfoScreen({ navigation, route }: Props) {
  const vendorBusiness = usePartnerRegistrationStore((s) => s.vendorBusiness);
  const setVendorBusiness = usePartnerRegistrationStore((s) => s.setVendorBusiness);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBack = () =>
    partnerRegistrationGoBack(navigation, 'VendorBusinessInfo', route.params);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!vendorBusiness.businessName.trim()) next.businessName = 'Business name is required';
    if (!vendorBusiness.ownerName.trim()) next.ownerName = 'Owner name is required';
    if (!/^[6-9]\d{9}$/.test(vendorBusiness.mobileNumber)) {
      next.mobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (vendorBusiness.email.trim() && !isValidEmail(vendorBusiness.email)) {
      next.email = 'Enter a valid email address';
    }
    if (!vendorBusiness.businessType) next.businessType = 'Select business type';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <PartnerRegistrationLayout
      title="Vendor Registration"
      stepLabel="Step 1 of 4"
      steps={VENDOR_REGISTRATION_STEPS}
      activeStep={1}
      onBack={handleBack}
      footer={
        <PartnerRegistrationFooter
          showBack
          onBack={handleBack}
          onContinue={() => {
            if (!validate()) return;
            navigation.navigate('VendorBusinessAddress', route.params);
          }}
        />
      }>
      <Text style={styles.subtitle}>Fill in your business details to continue.</Text>

      <PartnerSectionHeader
        Icon={Store}
        title="Business Information"
        subtitle="Enter your primary business and contact details"
      />

      <FormField
        label="Business Name"
        required
        value={vendorBusiness.businessName}
        onChangeText={(businessName) => setVendorBusiness({ businessName })}
        placeholder="Enter business name"
        error={errors.businessName}
      />
      <FormField
        label="Owner Name"
        required
        Icon={User}
        value={vendorBusiness.ownerName}
        onChangeText={(ownerName) => setVendorBusiness({ ownerName })}
        placeholder="Enter owner name"
        error={errors.ownerName}
      />
      <FormField
        label="Mobile Number"
        required
        Icon={Phone}
        keyboardType="number-pad"
        maxLength={10}
        value={vendorBusiness.mobileNumber}
        onChangeText={(mobileNumber) =>
          setVendorBusiness({ mobileNumber: mobileNumber.replace(/\D/g, '').slice(0, 10) })
        }
        placeholder="Enter mobile number"
        error={errors.mobileNumber}
      />
      <FormField
        label="Email Address"
        optional
        Icon={Mail}
        keyboardType="email-address"
        autoCapitalize="none"
        value={vendorBusiness.email}
        onChangeText={(email) => setVendorBusiness({ email })}
        placeholder="Enter email address (optional)"
        error={errors.email}
      />
      <FormField
        label="Business Type"
        required
        Icon={Store}
        value={vendorBusiness.businessType}
        placeholder="Select business type"
        editable={false}
        onPress={() =>
          showSelectOptions(
            'Business Type',
            BUSINESS_TYPE_OPTIONS,
            (businessType) => setVendorBusiness({ businessType }),
            vendorBusiness.businessType,
          )
        }
        rightElement={<ChevronDown size={18} color={colors.primary} />}
        error={errors.businessType}
      />
    </PartnerRegistrationLayout>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginBottom: spacing.lg,
    color: colors.grey,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
});
