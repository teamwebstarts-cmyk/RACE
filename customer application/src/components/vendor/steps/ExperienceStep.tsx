import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import FormField from '../../ui/FormField';
import { colors, radius, spacing, typography } from '../../../theme';
import type { VendorDraft } from '../../../types/vendor';

interface Props {
  draft: VendorDraft;
  onChange: (patch: Partial<VendorDraft>) => void;
}

export default function ExperienceStep({ draft, onChange }: Props) {
  const profile = draft.driverProfile ?? {};

  const update = (patch: Partial<NonNullable<VendorDraft['driverProfile']>>) => {
    onChange({ driverProfile: { ...profile, ...patch } });
  };

  return (
    <View>
      <Text style={styles.title}>Experience</Text>
      <FormField
        dark
        label="Years of Experience"
        value={profile.yearsOfExperience?.toString() ?? ''}
        onChangeText={(v) => update({ yearsOfExperience: Number(v.replace(/\D/g, '')) || 0 })}
        keyboardType="number-pad"
      />
      <FormField
        dark
        label="Vehicle Categories Driven"
        value={(profile.vehicleCategories ?? []).join(', ')}
        onChangeText={(v) =>
          update({
            vehicleCategories: v.split(',').map((s) => s.trim()).filter(Boolean),
          })
        }
        placeholder="Sedan, SUV, Truck..."
      />
      <FormField
        dark
        label="Languages Known"
        value={(profile.languages ?? []).join(', ')}
        onChangeText={(v) =>
          update({ languages: v.split(',').map((s) => s.trim()).filter(Boolean) })
        }
        placeholder="Hindi, English..."
      />
      <FormField
        dark
        label="Previous Employer"
        value={profile.previousEmployer ?? ''}
        onChangeText={(v) => update({ previousEmployer: v })}
      />
      <FormField
        dark
        label="Reference Contact Name"
        value={profile.referenceContact?.name ?? ''}
        onChangeText={(v) =>
          update({
            referenceContact: {
              name: v,
              mobileNumber: profile.referenceContact?.mobileNumber ?? '',
            },
          })
        }
      />
      <FormField
        dark
        label="Reference Contact Number"
        value={profile.referenceContact?.mobileNumber ?? ''}
        onChangeText={(v) =>
          update({
            referenceContact: {
              name: profile.referenceContact?.name ?? '',
              mobileNumber: v.replace(/\D/g, '').slice(0, 10),
            },
          })
        }
        keyboardType="number-pad"
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

export function AvailabilityStep({ draft, onChange }: Props) {
  const availability = draft.driverProfile?.availability ?? {};

  const toggle = (key: 'hourly' | 'daily' | 'nightShift' | 'weekend') => {
    onChange({
      driverProfile: {
        ...draft.driverProfile,
        availability: { ...availability, [key]: !availability[key] },
      },
    });
  };

  const options = [
    { key: 'hourly' as const, label: 'Hourly Availability' },
    { key: 'daily' as const, label: 'Daily Availability' },
    { key: 'nightShift' as const, label: 'Night Shift' },
    { key: 'weekend' as const, label: 'Weekend Availability' },
  ];

  return (
    <View>
      <Text style={styles.title}>Availability</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[availabilityStyles.option, availability[opt.key] && availabilityStyles.optionActive]}
          onPress={() => toggle(opt.key)}>
          <Text
            style={[
              availabilityStyles.optionText,
              availability[opt.key] && availabilityStyles.optionTextActive,
            ]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const availabilityStyles = StyleSheet.create({
  option: {
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.glass.border,
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: 'rgba(255,193,7,0.12)' },
  optionText: { color: colors.subtext, fontWeight: typography.weights.semibold },
  optionTextActive: { color: colors.textLight },
});
