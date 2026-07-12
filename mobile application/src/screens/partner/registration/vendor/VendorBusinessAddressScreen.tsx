import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import FormField from '../../../../components/auth/FormField';
import LocationPickerModal from '../../../../components/common/LocationPickerModal';
import PartnerRegistrationLayout from '../../../../components/partner/PartnerRegistrationLayout';
import {
  PartnerInfoBox,
  PartnerRegistrationFooter,
  PartnerSectionHeader,
} from '../../../../components/partner/PartnerRegistrationSections';
import { INDIAN_STATE_OPTIONS, VENDOR_REGISTRATION_STEPS } from '../../../../constants/partnerRegistration';
import { usePartnerRegistrationStore } from '../../../../store/partnerRegistrationStore';
import type { LocationResult } from '../../../../types/location';
import type { PartnerRegistrationStackParamList } from '../../../../types/partnerNavigation';
import { toAddressFormValues } from '../../../../utils/googlePlaces';
import {
  isValidIndianPin,
  partnerRegistrationGoBack,
  showSelectOptions,
} from '../../../../utils/partnerRegistration';
import { colors, spacing, typography } from '../../../../theme';

type Props = NativeStackScreenProps<PartnerRegistrationStackParamList, 'VendorBusinessAddress'>;

export default function VendorBusinessAddressScreen({ navigation, route }: Props) {
  const vendorAddress = usePartnerRegistrationStore((s) => s.vendorAddress);
  const setVendorAddress = usePartnerRegistrationStore((s) => s.setVendorAddress);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleBack = () =>
    partnerRegistrationGoBack(navigation, 'VendorBusinessAddress', route.params);

  const searchDisplayValue = [
    vendorAddress.addressLine1,
    vendorAddress.addressLine2,
    vendorAddress.city,
    vendorAddress.state,
    vendorAddress.pinCode,
  ]
    .filter(Boolean)
    .join(', ');

  const handleLocationSelect = (location: LocationResult) => {
    const mapped = toAddressFormValues(location);
    setVendorAddress({
      addressLine1: mapped.line1,
      addressLine2: mapped.line2,
      city: mapped.city,
      state: mapped.state,
      pinCode: mapped.pincode,
    });
    setErrors({});
  };

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
      stepLabel="Step 2 of 4"
      steps={VENDOR_REGISTRATION_STEPS}
      activeStep={2}
      onBack={handleBack}
      footer={
        <PartnerRegistrationFooter
          showBack
          onBack={handleBack}
          onContinue={() => {
            if (!validate()) return;
            navigation.navigate('VendorDocuments', route.params);
          }}
        />
      }>
      <PartnerSectionHeader
        Icon={MapPin}
        title="Business Address"
        subtitle="Provide the address used for verification and service operations"
      />

      <Text style={styles.selectLabel}>Select Address</Text>
      <Pressable onPress={() => setShowLocationPicker(true)} style={styles.selectButton}>
        <View style={styles.selectRow}>
          <MapPin size={18} color={colors.primary} />
          <Text
            style={[styles.selectText, searchDisplayValue ? styles.selectTextFilled : null]}
            numberOfLines={2}>
            {searchDisplayValue || 'Select your address'}
          </Text>
          <ChevronRight size={18} color={colors.grey} />
        </View>
      </Pressable>

      <FormField
        label="Address Line 1"
        required
        Icon={MapPin}
        value={vendorAddress.addressLine1}
        onChangeText={(addressLine1) => setVendorAddress({ addressLine1 })}
        placeholder="House / street / building"
        error={errors.addressLine1}
      />
      <FormField
        label="Address Line 2"
        optional
        value={vendorAddress.addressLine2}
        onChangeText={(addressLine2) => setVendorAddress({ addressLine2 })}
        placeholder="Area / locality (optional)"
      />
      <FormField
        label="City"
        required
        value={vendorAddress.city}
        onChangeText={(city) => setVendorAddress({ city })}
        placeholder="City"
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
        placeholder="6-digit PIN code"
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

      <LocationPickerModal
        visible={showLocationPicker}
        title="Select your address"
        confirmLabel="Confirm address"
        openSearchOnShow
        onClose={() => setShowLocationPicker(false)}
        onLocationSelected={handleLocationSelect}
      />
    </PartnerRegistrationLayout>
  );
}

const styles = StyleSheet.create({
  selectLabel: {
    marginBottom: spacing.sm,
    color: colors.dark,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  selectButton: {
    marginBottom: spacing.md,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    minHeight: 52,
    gap: 10,
  },
  selectText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.grey,
    fontWeight: typography.weights.regular,
  },
  selectTextFilled: {
    color: colors.dark,
    fontWeight: typography.weights.semibold,
  },
  noteText: {
    color: colors.dark,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.relaxed,
  },
});
