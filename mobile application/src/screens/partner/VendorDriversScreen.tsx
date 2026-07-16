import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Clock3, FileStack, IdCard, Phone, ShieldCheck, User } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import FormField from '../../components/auth/FormField';
import PartnerDocumentUploadList, {
  type PartnerDocumentFieldConfig,
} from '../../components/partner/PartnerDocumentUploadList';
import AppScreenLayout from '../../components/ui/AppScreenLayout';
import PrimaryButton from '../../components/ui/PrimaryButton';
import GlassCard from '../../components/ui/GlassCard';
import { useAppSelector } from '../../redux/hooks';
import { getApiErrorMessage } from '../../services/auth/useAuthMutations';
import { uploadVendorDriverDocument } from '../../services/vendor/vendorDriversApi';
import {
  useCreateVendorDriverMutation,
  useRemoveVendorDriverMutation,
  useVendorDriversQuery,
} from '../../services/vendor/useVendorDriversQueries';
import { useVendorStatusQuery } from '../../services/vendor/useVendorMutations';
import type { PartnerAccountStackParamList } from '../../types/partnerNavigation';
import { PARTNER_WAITING_ADMIN_APPROVAL } from '../../constants/partnerCopy';
import { colors, radius, shadows, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<PartnerAccountStackParamList, 'VendorDrivers'>;

const DRIVER_TYPES = ['Tow Driver', 'Full-Time', 'Part-Time'] as const;

const FLEET_DRIVER_DOCUMENTS: PartnerDocumentFieldConfig[] = [
  { id: 'driving_license', label: 'Driving License', required: true, Icon: IdCard },
  { id: 'aadhaar', label: 'Aadhaar Card', required: true, Icon: IdCard },
  { id: 'police_verification', label: 'Police Verification', required: true, Icon: ShieldCheck },
  {
    id: 'medical_certificate',
    label: 'Medical Fitness Certificate',
    required: true,
    Icon: FileStack,
  },
];

function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

export default function VendorDriversScreen({}: Props) {
  const user = useAppSelector(state => state.auth.user);
  const isVendor = user?.role === 'vendor';
  const { data: vendor, isLoading: vendorLoading } = useVendorStatusQuery(isVendor);
  const isApproved = vendor?.status === 'approved';

  const { data: drivers = [], isLoading, isRefetching, refetch } = useVendorDriversQuery(isVendor);
  const createMutation = useCreateVendorDriverMutation();
  const removeMutation = useRemoveVendorDriverMutation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [driverType, setDriverType] = useState<(typeof DRIVER_TYPES)[number]>('Tow Driver');
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [driverDocuments, setDriverDocuments] = useState<
    Array<{ id: string; label: string; uri: string; name: string; mimeType?: string }>
  >([]);

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

  const onToggleForm = () => {
    if (!isApproved) {
      Alert.alert('Approval required', PARTNER_WAITING_ADMIN_APPROVAL);
      return;
    }
    setShowForm(v => !v);
  };

  const submitCreate = async () => {
    if (!isApproved) {
      Alert.alert('Approval required', PARTNER_WAITING_ADMIN_APPROVAL);
      return;
    }
    if (!validate()) return;

    try {
      const created = await createMutation.mutateAsync({
        name: name.trim(),
        phone: phoneDigits,
        licenseNo: licenseNo.trim(),
        driverType,
        city: 'Bhubaneswar',
      });

      for (const doc of driverDocuments) {
        try {
          await uploadVendorDriverDocument(created.id, doc.id, {
            uri: doc.uri,
            name: doc.name,
            mimeType: doc.mimeType ?? 'image/jpeg',
          });
        } catch {
          // Driver created; doc upload can be retried later.
        }
      }

      Alert.alert('Driver added', `${name.trim()} has been added to your fleet.`);
      setName('');
      setPhone('');
      setLicenseNo('');
      setDriverDocuments([]);
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


  if (!isVendor) {
    return (
      <AppScreenLayout
        scrollable={false}
        header={
          <View style={styles.headerPad}>
            <Text style={styles.title}>My Drivers</Text>
          </View>
        }>
        <View style={styles.pendingCard}>
          <Text style={styles.pendingTitle}>Vendor accounts only</Text>
          <Text style={{ color: colors.grey, fontSize: typography.sizes.sm, flex: 1 }}>
            Fleet driver management is available after signing in as a vendor.
          </Text>
        </View>
      </AppScreenLayout>
    );
  }

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
        </View>
      }>
      {!vendorLoading && !isApproved ? (
        <View style={styles.pendingCard}>
          <Clock3 size={22} color={colors.warning} strokeWidth={2.2} />
          <Text style={styles.pendingTitle}>{PARTNER_WAITING_ADMIN_APPROVAL}</Text>
        </View>
      ) : null}

      {isApproved ? (
        <View style={styles.approvedBanner}>
          <ShieldCheck size={18} color={colors.success} strokeWidth={2.2} />
          <Text style={styles.approvedText}>Vendor approved — you can add drivers</Text>
        </View>
      ) : null}

      <PrimaryButton
        label={showForm ? 'Hide form' : 'Add driver'}
        variant="outline"
        onPress={onToggleForm}
        disabled={!isApproved && !vendorLoading}
      />

      {showForm && isApproved ? (
        <View style={styles.form}>
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

          <Text style={styles.sectionTitle}>Documents</Text>
          <Text style={styles.helperText}>
            Upload documents. Status stays pending until admin approves.
          </Text>
          <PartnerDocumentUploadList
            documents={FLEET_DRIVER_DOCUMENTS}
            uploadedIds={driverDocuments.map((d) => d.id)}
            onUpload={(id, uri, name, mimeType) => {
              const label = FLEET_DRIVER_DOCUMENTS.find((doc) => doc.id === id)?.label ?? id;
              setDriverDocuments((prev) => [
                ...prev.filter((d) => d.id !== id),
                { id, label, uri, name, mimeType },
              ]);
            }}
          />

          <PrimaryButton
            label={createMutation.isPending ? 'Saving…' : 'Save to fleet'}
            onPress={() => void submitCreate()}
            disabled={createMutation.isPending}
          />
        </View>
      ) : null}

      {isLoading || vendorLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : drivers.length > 0 ? (
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
      ) : null}
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
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.md,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(244, 161, 21, 0.35)',
    backgroundColor: 'rgba(244, 161, 21, 0.08)',
  },
  pendingTitle: {
    flex: 1,
    color: colors.dark,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.md,
  },
  approvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  approvedText: {
    color: colors.success,
    fontWeight: typography.weights.semibold,
    flex: 1,
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
  sectionTitle: {
    color: colors.dark,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
    marginTop: spacing.md,
  },
  helperText: {
    color: colors.grey,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeights.relaxed,
  },
  typeLabel: {
    color: colors.dark,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
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
});
