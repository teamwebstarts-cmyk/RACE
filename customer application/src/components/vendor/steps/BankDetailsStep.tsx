import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import FormField from '../../ui/FormField';
import { colors, spacing, typography } from '../../../theme';
import type { VendorDraft } from '../../../types/vendor';

interface Props {
  draft: VendorDraft;
  onChange: (patch: Partial<VendorDraft>) => void;
}

export default function BankDetailsStep({ draft, onChange }: Props) {
  const bank = draft.bankDetails ?? {
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
  };

  const updateBank = (patch: Partial<typeof bank>) => {
    onChange({ bankDetails: { ...bank, ...patch } });
  };

  return (
    <View>
      <Text style={styles.title}>Bank Details</Text>
      <FormField
        dark
        label="Account Holder Name"
        value={bank.accountHolderName}
        onChangeText={(v) => updateBank({ accountHolderName: v })}
      />
      <FormField
        dark
        label="Account Number"
        value={bank.accountNumber}
        onChangeText={(v) => updateBank({ accountNumber: v.replace(/\D/g, '') })}
        keyboardType="number-pad"
      />
      <FormField
        dark
        label="IFSC Code"
        value={bank.ifsc}
        onChangeText={(v) => updateBank({ ifsc: v.toUpperCase() })}
        autoCapitalize="characters"
      />
      <FormField
        dark
        label="Bank Name"
        value={bank.bankName ?? ''}
        onChangeText={(v) => updateBank({ bankName: v })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textLight,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
});
