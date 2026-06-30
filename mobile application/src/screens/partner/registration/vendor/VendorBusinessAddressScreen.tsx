import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { ChevronDown, MapPin } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import FormField from '../../../../components/auth/FormField';
import PartnerRegistrationLayout from '../../../../components/partner/PartnerRegistrationLayout';
import {
  PartnerInfoBox,
  PartnerRegistrationFooter,
  PartnerSectionHeader,
} from '../../../../components/partner/PartnerRegistrationSections';
import { INDIAN_STATE_OPTIONS, VENDOR_REGISTRATION_STEPS } from '../../../../constants/partnerRegistration';
import { usePartnerRegistrationStore } from '../../../../store/partnerRegistrationStore';
import type { PartnerRegistrationStackParamList } from '../../../../types/partnerNavigation';
import { isValidIndianPin, showSelectOptions } from '../../../../utils/partnerRegistration';
import { colors, spacing, typography } from '../../../../theme';

type Props = NativeStackScreenProps<PartnerRegistrationStackParamList, 'VendorBusinessAddress'>;

export default function VendorBusinessAddressScreen({ navigation, route }: Props) {
  const vendorAddress = usePartnerRegistrationStore((s) => s.vendorAddress);
  const setVendorAddress = usePartnerRegistrationStore((s) => s.setVendorAddress);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!vendorAddress.addressLine1.trim()) next.addressLine1 = 'Address line 1 is required';
    if (!vendorAddress.city.trim()) next.city = 'City is required';
    if (!vendorAddress.state) next.state = 'Select state';
    if (!isValidIndianPin(vendorAddress.pinCode)) next.pinCode = 'Enter a valid 6-digit PIN code';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <PartnerRegistrationLayout
      title="Vendor Registration"
      stepLabel="Step 1 of 4"
      steps={VENDOR_REGISTRATION_STEPS}
      activeStep={1}
      onBack={() => navigation.goBack()}
      footer={
        <PartnerRegistrationFooter
          showBack
          onBack={() => navigation.goBack()}
          onContinue={() => {
            if (!validate()) return;
            navigation.navigate('VendorDocuments', route.params);
          }}
        />
      }>
      <Text style={styles.subtitle}>Enter your business address details.</Text>

      <PartnerSectionHeader
        Icon={MapPin}
        title="Business Address"
        subtitle="Provide the address used for verification and service operations"
      />

      <FormField
        label="Address Line 1"
        required
        Icon={MapPin}
        value={vendorAddress.addressLine1}
        onChangeText={(addressLine1) => setVendorAddress({ addressLine1 })}
        placeholder="Enter address line 1"
        error={errors.addressLine1}
      />
      <FormField
        label="Address Line 2"
        optional
        value={vendorAddress.addressLine2}
        onChangeText={(addressLine2) => setVendorAddress({ addressLine2 })}
        placeholder="Enter address line 2 (optional)"
      />
      <FormField
        label="City"
        required
        value={vendorAddress.city}
        onChangeText={(city) => setVendorAddress({ city })}
        placeholder="Enter city"
        error={errors.city}
      />
      <FormField
        label="State"
        required
        value={vendorAddress.state}
        placeholder="Select state"
        editable={false}
        onPress={() =>
          showSelectOptions(
            'State',
            INDIAN_STATE_OPTIONS,
            (state) => setVendorAddress({ state }),
            vendorAddress.state,
          )
        }
        rightElement={<ChevronDown size={18} color={colors.primary} />}
        error={errors.state}
      />
      <FormField
        label="PIN Code"
        required
        keyboardType="number-pad"
        maxLength={6}
        value={vendorAddress.pinCode}
        onChangeText={(pinCode) =>
          setVendorAddress({ pinCode: pinCode.replace(/\D/g, '').slice(0, 6) })
        }
        placeholder="Enter PIN code"
        error={errors.pinCode}
      />
      <FormField
        label="Landmark"
        optional
        value={vendorAddress.landmark}
        onChangeText={(landmark) => setVendorAddress({ landmark })}
        placeholder="Enter landmark (optional)"
      />

      <PartnerInfoBox>
        <Text style={styles.noteText}>
          Note: Please enter the correct address. This will be used for verification and service
          operations.
        </Text>
      </PartnerInfoBox>
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
  noteText: {
    color: colors.dark,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.relaxed,
  },
});
