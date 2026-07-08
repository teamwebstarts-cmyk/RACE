import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppScreenLayout from '../../components/ui/AppScreenLayout';
import PrimaryButton from '../../components/ui/PrimaryButton';
import GlassCard from '../../components/ui/GlassCard';
import { PARTNER_DEMO_DRIVERS } from '../../constants/auth';
import { getApiErrorMessage } from '../../services/auth/useAuthMutations';
import {
  useClaimVendorDriverMutation,
  useCreateVendorDriverMutation,
  useRemoveVendorDriverMutation,
  useVendorDriversQuery,
} from '../../services/vendor/useVendorDriversQueries';
import type { PartnerAccountStackParamList } from '../../types/partnerNavigation';
import { colors, radius, shadows, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<PartnerAccountStackParamList, 'VendorDrivers'>;

const DRIVER_TYPES = ['Tow Driver', 'Full-Time', 'Part-Time'] as const;

export default function VendorDriversScreen({}: Props) {
  const { data: drivers = [], isLoading, isRefetching, refetch } = useVendorDriversQuery(true);
  const createMutation = useCreateVendorDriverMutation();
  const claimMutation = useClaimVendorDriverMutation();
  const removeMutation = useRemoveVendorDriverMutation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [driverType, setDriverType] = useState<(typeof DRIVER_TYPES)[number]>('Tow Driver');
  const [showForm, setShowForm] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length >= 2 && /^[6-9]\d{9}$/.test(phone) && licenseNo.trim().length >= 4,
    [licenseNo, name, phone],
  );

  const prefillDemo = (demo: (typeof PARTNER_DEMO_DRIVERS)[number]) => {
    setName(demo.name);
    setPhone(demo.phone);
    setLicenseNo(`OD-LIC-${demo.phone.slice(-4)}`);
    setDriverType(
      demo.type.includes('Tow')
        ? 'Tow Driver'
        : demo.type.includes('Full')
          ? 'Full-Time'
          : 'Part-Time',
    );
    setShowForm(true);
  };

  const submitCreate = async () => {
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        phone,
        licenseNo: licenseNo.trim(),
        driverType,
        city: 'Bhubaneswar',
      });
      Alert.alert('Driver added', `${name} is in your fleet and can log in with OTP.`);
      setName('');
      setPhone('');
      setLicenseNo('');
      setShowForm(false);
    } catch (error) {
      // If already exists as seeded driver, try claim
      try {
        await claimMutation.mutateAsync(phone);
        Alert.alert('Driver linked', 'Existing demo driver was added to your fleet.');
        setShowForm(false);
      } catch {
        Alert.alert('Could not add', getApiErrorMessage(error, 'Add driver failed'));
      }
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
      header={
        <View style={styles.headerPad}>
          <Text style={styles.title}>My Drivers</Text>
          <Text style={styles.subtitle}>Add fleet drivers — they log in on Partner app</Text>
        </View>
      }
      scrollable={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
        }>
        <PrimaryButton
          label={showForm ? 'Hide form' : 'Add driver'}
          variant="outline"
          onPress={() => setShowForm(v => !v)}
        />

        {showForm ? (
          <View style={styles.form}>
            <Text style={styles.formHint}>Quick-add demo drivers (Om / Ramesh / Vaibhav)</Text>
            <View style={styles.demoRow}>
              {PARTNER_DEMO_DRIVERS.map(d => (
                <Pressable key={d.phone} onPress={() => prefillDemo(d)} style={styles.demoChip}>
                  <Text style={styles.demoChipText}>{d.name}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Full name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Driver name" placeholderTextColor={colors.grey} />
            <Text style={styles.label}>Mobile (10 digit)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              keyboardType="number-pad"
              placeholder="8888880001"
              placeholderTextColor={colors.grey}
            />
            <Text style={styles.label}>License no</Text>
            <TextInput style={styles.input} value={licenseNo} onChangeText={setLicenseNo} placeholder="DL number" placeholderTextColor={colors.grey} />
            <Text style={styles.label}>Type</Text>
            <View style={styles.demoRow}>
              {DRIVER_TYPES.map(type => (
                <Pressable
                  key={type}
                  onPress={() => setDriverType(type)}
                  style={[styles.demoChip, driverType === type && styles.demoChipActive]}>
                  <Text style={[styles.demoChipText, driverType === type && styles.demoChipTextActive]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
            <PrimaryButton
              label={createMutation.isPending ? 'Saving…' : 'Save to fleet'}
              onPress={() => void submitCreate()}
              disabled={!canSubmit || createMutation.isPending}
            />
          </View>
        ) : null}

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : drivers.length === 0 ? (
          <Text style={styles.empty}>No drivers yet. Add Om / Ramesh / Vaibhav for the demo.</Text>
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
      </ScrollView>
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
  scroll: { paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  form: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  formHint: { color: colors.grey, fontSize: typography.sizes.sm },
  demoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  demoChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.lightGrey,
  },
  demoChipActive: { backgroundColor: colors.goldLight, borderWidth: 1, borderColor: colors.primary },
  demoChipText: { color: colors.dark, fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs },
  demoChipTextActive: { color: colors.primaryDark },
  label: { color: colors.grey, fontSize: typography.sizes.xs, marginTop: spacing.xs },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.dark,
  },
  card: { gap: 4 },
  driverName: { color: colors.dark, fontWeight: typography.weights.bold, fontSize: typography.sizes.lg },
  meta: { color: colors.grey, fontSize: typography.sizes.sm },
  removeBtn: { marginTop: spacing.sm },
  removeText: { color: colors.error, fontWeight: typography.weights.semibold },
  empty: { color: colors.grey, textAlign: 'center', marginTop: spacing.xl, lineHeight: 22 },
});
