import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { IdCard, Phone, User } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import FormField from '../../components/auth/FormField';
import AppScreenLayout from '../../components/ui/AppScreenLayout';
import PrimaryButton from '../../components/ui/PrimaryButton';
import GlassCard from '../../components/ui/GlassCard';
import { getApiErrorMessage } from '../../services/auth/useAuthMutations';
import {
  useCreateVendorDriverMutation,
  useRemoveVendorDriverMutation,
  useVendorDriversQuery,
} from '../../services/vendor/useVendorDriversQueries';
import type { PartnerAccountStackParamList } from '../../types/partnerNavigation';
import { colors, radius, shadows, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<PartnerAccountStackParamList, 'VendorDrivers'>;

const DRIVER_TYPES = ['Tow Driver', 'Full-Time', 'Part-Time'] as const;

function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

export default function VendorDriversScreen({}: Props) {
  const { data: drivers = [], isLoading, isRefetching, refetch } = useVendorDriversQuery(true);
  const createMutation = useCreateVendorDriverMutation();
  const removeMutation = useRemoveVendorDriverMutation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [driverType, setDriverType] = useState<(typeof DRIVER_TYPES)[number]>('Tow Driver');
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const phoneDigits = phone.replace(/\D/g, '');

  const validate = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Enter driver full name';
    if (!isValidIndianMobile(phoneDigits)) {
      next.phone =
        phoneDigits.length === 0
          ? 'Enter mobile number'
          : phoneDigits.length < 10
            ? `Enter ${10 - phoneDigits.length} more digit(s)`
            : 'Mobile must start with 6, 7, 8, or 9';
    }
    if (licenseNo.trim().length < 4) next.licenseNo = 'Enter a valid license number';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitCreate = async () => {
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        phone: phoneDigits,
        licenseNo: licenseNo.trim(),
        driverType,
        city: 'Bhubaneswar',
      });
      Alert.alert(
        'Driver added',
        `${name.trim()} is in your fleet. They can log in on the Partner app with this number (OTP SMS).`,
      );
      setName('');
      setPhone('');
      setLicenseNo('');
      setErrors({});
      setShowForm(false);
    } catch (error) {
      Alert.alert('Could not add', getApiErrorMessage(error, 'Add driver failed'));
    }
  };

  const onRemove = (id: string, driverName: string) => {
    Alert.alert('Remove driver?', `Unlink ${driverName} from your fleet?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void removeMutation.mutateAsync(id).catch(error => {
            Alert.alert('Remove failed', getApiErrorMessage(error, 'Could not remove'));
          });
        },
      },
    ]);
  };

  return (
    <AppScreenLayout
      keyboardAvoiding
      scrollable
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      contentStyle={styles.scrollContent}
      header={
        <View style={styles.headerPad}>
          <Text style={styles.title}>My Drivers</Text>
          <Text style={styles.subtitle}>Add fleet drivers — they log in on Partner app</Text>
        </View>
      }>
      <PrimaryButton
        label={showForm ? 'Hide form' : 'Add driver'}
        variant="outline"
        onPress={() => setShowForm(v => !v)}
      />

      {showForm ? (
        <View style={styles.form}>
          <Text style={styles.formHint}>
            Use a real 10-digit mobile. Driver receives SMS OTP on the Partner app.
          </Text>

          <FormField
            variant="outlined"
            label="Full name"
            required
            Icon={User}
            value={name}
            onChangeText={text => {
              setName(text);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. Shivam Kumar"
            error={errors.name}
          />
          <FormField
            variant="outlined"
            label="Mobile"
            required
            Icon={Phone}
            value={phone}
            onChangeText={text => {
              setPhone(text.replace(/\D/g, '').slice(0, 10));
              if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
            }}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="e.g. 9876543210"
            error={errors.phone}
          />
          <FormField
            variant="outlined"
            label="License no"
            required
            Icon={IdCard}
            value={licenseNo}
            onChangeText={text => {
              setLicenseNo(text);
              if (errors.licenseNo) setErrors(prev => ({ ...prev, licenseNo: '' }));
            }}
            placeholder="e.g. OD1420200012345"
            autoCapitalize="characters"
            error={errors.licenseNo}
          />

          <Text style={styles.typeLabel}>Driver type</Text>
          <View style={styles.typeRow}>
            {DRIVER_TYPES.map(type => (
              <Pressable
                key={type}
                onPress={() => setDriverType(type)}
                style={[styles.typeChip, driverType === type && styles.typeChipActive]}>
                <Text style={[styles.typeChipText, driverType === type && styles.typeChipTextActive]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          <PrimaryButton
            label={createMutation.isPending ? 'Saving…' : 'Save to fleet'}
            onPress={() => void submitCreate()}
            disabled={createMutation.isPending}
          />
        </View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : drivers.length === 0 ? (
        <Text style={styles.empty}>No drivers yet. Add a driver with a fresh mobile number.</Text>
      ) : (
        drivers.map(driver => (
          <GlassCard key={driver.id} style={styles.card}>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.meta}>{driver.phone}</Text>
            <Text style={styles.meta}>
              {driver.driverType} · {driver.status}
              {driver.isBusy ? ' · Busy' : driver.isAvailable ? ' · Online-ready' : ' · Offline'}
            </Text>
            <Pressable onPress={() => onRemove(driver.id, driver.name)} style={styles.removeBtn}>
              <Text style={styles.removeText}>Remove from fleet</Text>
            </Pressable>
          </GlassCard>
        ))
      )}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.dark,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
  },
  subtitle: { marginTop: spacing.xs, color: colors.grey, fontSize: typography.sizes.sm },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.md,
  },
  form: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.card,
  },
  formHint: { color: colors.grey, fontSize: typography.sizes.sm, marginBottom: spacing.sm },
  typeLabel: {
    color: colors.dark,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs, marginBottom: spacing.sm },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.lightGrey,
  },
  typeChipActive: { backgroundColor: colors.goldLight, borderWidth: 1, borderColor: colors.primary },
  typeChipText: { color: colors.dark, fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs },
  typeChipTextActive: { color: colors.primaryDark },
  card: { gap: 4 },
  driverName: { color: colors.dark, fontWeight: typography.weights.bold, fontSize: typography.sizes.lg },
  meta: { color: colors.grey, fontSize: typography.sizes.sm },
  removeBtn: { marginTop: spacing.sm },
  removeText: { color: colors.error, fontWeight: typography.weights.semibold },
  empty: { color: colors.grey, textAlign: 'center', marginTop: spacing.xl, lineHeight: 22 },
});
