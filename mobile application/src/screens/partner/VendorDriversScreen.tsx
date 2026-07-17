import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  ChevronDown,
  FileStack,
  IdCard,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Star,
  Truck,
  User,
  Users,
  UserCog,
  XCircle,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import FormField from '../../components/auth/FormField';
import PartnerDocumentUploadList, {
  type PartnerDocumentFieldConfig,
} from '../../components/partner/PartnerDocumentUploadList';
import AppScreenLayout from '../../components/ui/AppScreenLayout';
import { useAppSelector } from '../../redux/hooks';
import { getApiErrorMessage } from '../../services/auth/useAuthMutations';
import {
  uploadVendorDriverDocument,
  type FleetDriver,
} from '../../services/vendor/vendorDriversApi';
import {
  useCreateVendorDriverMutation,
  useRemoveVendorDriverMutation,
  useVendorDriversQuery,
} from '../../services/vendor/useVendorDriversQueries';
import { useVendorFleetVehiclesQuery } from '../../services/vendor/useVendorBookingsQueries';
import { useVendorStatusQuery } from '../../services/vendor/useVendorMutations';
import type { PartnerAccountStackParamList } from '../../types/partnerNavigation';
import { PARTNER_WAITING_ADMIN_APPROVAL } from '../../constants/partnerCopy';
import { colors, radius, shadows, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<PartnerAccountStackParamList, 'VendorDrivers'>;

const PAGE_BG = '#F7F7F5';
const SUCCESS_GREEN = '#22C55E';
const INFO_BLUE = '#2563EB';
const ON_JOB_ORANGE = '#EA580C';
const PAGE_SIZE = 5;

const DRIVER_TYPES = ['Tow Driver', 'Full-Time', 'Part-Time'] as const;

const FLEET_DRIVER_DOCUMENTS: PartnerDocumentFieldConfig[] = [
  { id: 'driving_license', label: 'Driving License', required: true, Icon: IdCard },
  { id: 'aadhaar', label: 'Aadhaar Card', required: true, Icon: IdCard },
  { id: 'police_verification', label: 'Police Verification', required: true, Icon: BadgeCheck },
  {
    id: 'medical_certificate',
    label: 'Medical Fitness Certificate',
    required: true,
    Icon: FileStack,
  },
];

type StatusFilter = 'all' | 'active' | 'on_job' | 'inactive';
type SortKey = 'newest' | 'name' | 'rating';

function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

function normalizeReg(value?: string) {
  return (value ?? '').replace(/\s+/g, '').toUpperCase();
}

function formatPlate(reg?: string) {
  if (!reg) return '';
  const clean = normalizeReg(reg);
  const match = clean.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/);
  if (!match) return reg.toUpperCase();
  return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone;
}

function driverUiStatus(driver: FleetDriver): {
  key: 'active' | 'on_job' | 'inactive';
  label: string;
  sub: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
} {
  if (driver.isBusy) {
    return {
      key: 'on_job',
      label: 'On job',
      sub: 'En route to job',
      badgeBg: '#FFEDD5',
      badgeText: ON_JOB_ORANGE,
      dot: colors.primary,
    };
  }

  const status = String(driver.status).toUpperCase();
  const blocked = ['INACTIVE', 'SUSPENDED', 'REJECTED'].includes(status);
  if (!driver.isAvailable || blocked) {
    return {
      key: 'inactive',
      label: 'Inactive',
      sub: 'Not in service',
      badgeBg: '#FEE2E2',
      badgeText: colors.error,
      dot: colors.error,
    };
  }

  return {
    key: 'active',
    label: 'Active',
    sub: 'Available',
    badgeBg: '#DCFCE7',
    badgeText: SUCCESS_GREEN,
    dot: SUCCESS_GREEN,
  };
}

function isVerified(driver: FleetDriver) {
  return String(driver.status).toUpperCase() === 'APPROVED';
}

export default function VendorDriversScreen({}: Props) {
  const user = useAppSelector(state => state.auth.user);
  const isVendor = user?.role === 'vendor';
  const { data: vendor, isLoading: vendorLoading } = useVendorStatusQuery(isVendor);
  const isApproved = vendor?.status === 'approved';

  const { data: drivers = [], isLoading, isRefetching, refetch } = useVendorDriversQuery(isVendor);
  const { data: vehicles = [] } = useVendorFleetVehiclesQuery(isVendor, false);
  const createMutation = useCreateVendorDriverMutation();
  const removeMutation = useRemoveVendorDriverMutation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [city, setCity] = useState('Bhubaneswar');
  const [driverType, setDriverType] = useState<(typeof DRIVER_TYPES)[number]>('Tow Driver');
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [driverDocuments, setDriverDocuments] = useState<
    Array<{ id: string; label: string; uri: string; name: string; mimeType?: string }>
  >([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);
  const [menuDriver, setMenuDriver] = useState<FleetDriver | null>(null);

  const phoneDigits = phone.replace(/\D/g, '');

  const vehicleByReg = useMemo(() => {
    const map = new Map<string, { model: string; type: string }>();
    for (const vehicle of vehicles) {
      map.set(normalizeReg(vehicle.registrationNo), {
        model: vehicle.model,
        type: vehicle.type,
      });
    }
    return map;
  }, [vehicles]);

  const stats = useMemo(() => {
    let active = 0;
    let onJob = 0;
    let inactive = 0;
    for (const driver of drivers) {
      const status = driverUiStatus(driver).key;
      if (status === 'on_job') onJob += 1;
      else if (status === 'inactive') inactive += 1;
      else active += 1;
    }
    return { total: drivers.length, active, onJob, inactive };
  }, [drivers]);

  const locationOptions = useMemo(() => {
    const set = new Set(drivers.map(d => d.city).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [drivers]);

  const typeOptions = useMemo(() => {
    const set = new Set(drivers.map(d => d.driverType).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [drivers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = drivers.filter(driver => {
      const ui = driverUiStatus(driver);
      if (statusFilter !== 'all' && ui.key !== statusFilter) return false;
      if (locationFilter !== 'all' && driver.city !== locationFilter) return false;
      if (typeFilter !== 'all' && driver.driverType !== typeFilter) return false;
      if (!q) return true;
      return (
        driver.name.toLowerCase().includes(q) ||
        driver.phone.includes(q) ||
        driver.licenseNo.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      return b.id.localeCompare(a.id);
    });

    return list;
  }, [drivers, search, statusFilter, locationFilter, typeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, filtered.length);

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
        city: city.trim() || 'Bhubaneswar',
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
      setCity('Bhubaneswar');
      setDriverDocuments([]);
      setErrors({});
      setShowForm(false);
      setPage(1);
    } catch (error) {
      Alert.alert('Could not add', getApiErrorMessage(error, 'Add driver failed'));
    }
  };

  const onRemove = (driver: FleetDriver) => {
    setMenuDriver(null);
    Alert.alert('Remove driver?', `Unlink ${driver.name} from your fleet?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void removeMutation.mutateAsync(driver.id).catch(error => {
            Alert.alert('Remove failed', getApiErrorMessage(error, 'Could not remove'));
          });
        },
      },
    ]);
  };

  const cycleStatusFilter = () => {
    const order: StatusFilter[] = ['all', 'active', 'on_job', 'inactive'];
    setStatusFilter(order[(order.indexOf(statusFilter) + 1) % order.length] ?? 'all');
    setPage(1);
  };

  const cycleLocationFilter = () => {
    const idx = locationOptions.indexOf(locationFilter);
    setLocationFilter(locationOptions[(idx + 1) % locationOptions.length] ?? 'all');
    setPage(1);
  };

  const cycleTypeFilter = () => {
    const idx = typeOptions.indexOf(typeFilter);
    setTypeFilter(typeOptions[(idx + 1) % typeOptions.length] ?? 'all');
    setPage(1);
  };

  const cycleSort = () => {
    const order: SortKey[] = ['newest', 'name', 'rating'];
    setSortBy(order[(order.indexOf(sortBy) + 1) % order.length] ?? 'newest');
    setPage(1);
  };

  const statusFilterLabel =
    statusFilter === 'all'
      ? 'All status'
      : statusFilter === 'active'
        ? 'Active'
        : statusFilter === 'on_job'
          ? 'On job'
          : 'Inactive';

  const sortLabel =
    sortBy === 'newest' ? 'Newest' : sortBy === 'name' ? 'Name' : 'Rating';

  if (!isVendor) {
    return (
      <AppScreenLayout
        backgroundColor={PAGE_BG}
        scrollable={false}
        header={
          <View style={styles.headerPad}>
            <Text style={styles.title}>Fleet drivers</Text>
          </View>
        }>
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingText}>
            Fleet driver management is available after signing in as a vendor.
          </Text>
        </View>
      </AppScreenLayout>
    );
  }

  return (
    <AppScreenLayout
      backgroundColor={PAGE_BG}
      keyboardAvoiding
      scrollable
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      header={
        <View style={styles.headerPad}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Fleet drivers</Text>
              <Text style={styles.subtitle}>
                Manage your fleet drivers and keep your team ready for every call.
              </Text>
            </View>
            <Pressable
              onPress={onToggleForm}
              style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}>
              <Plus size={16} color={colors.dark} strokeWidth={2.6} />
              <Text style={styles.addLabel}>{showForm ? 'Close' : 'Add Driver'}</Text>
            </Pressable>
          </View>
        </View>
      }>
      <View style={styles.content}>
        {!vendorLoading && !isApproved ? (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingText}>{PARTNER_WAITING_ADMIN_APPROVAL}</Text>
          </View>
        ) : null}

        {showForm && isApproved ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add driver</Text>
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
              placeholder="e.g. Rakesh Behera"
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
            <FormField
              variant="outlined"
              label="Location"
              optional
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Bhubaneswar"
            />

            <Text style={styles.typeLabel}>Driver type</Text>
            <View style={styles.typeRow}>
              {DRIVER_TYPES.map(type => (
                <Pressable
                  key={type}
                  onPress={() => setDriverType(type)}
                  style={[styles.typeChip, driverType === type && styles.typeChipActive]}>
                  <Text
                    style={[styles.typeChipText, driverType === type && styles.typeChipTextActive]}>
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
              uploadedIds={driverDocuments.map(d => d.id)}
              onUpload={(id, uri, fileName, mimeType) => {
                const label = FLEET_DRIVER_DOCUMENTS.find(doc => doc.id === id)?.label ?? id;
                setDriverDocuments(prev => [
                  ...prev.filter(d => d.id !== id),
                  { id, label, uri, name: fileName, mimeType },
                ]);
              }}
            />

            <Pressable
              onPress={() => void submitCreate()}
              disabled={createMutation.isPending}
              style={({ pressed }) => [
                styles.saveBtn,
                pressed && styles.pressed,
                createMutation.isPending && styles.disabled,
              ]}>
              <Text style={styles.saveLabel}>
                {createMutation.isPending ? 'Saving…' : 'Save to fleet'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Users size={16} color={INFO_BLUE} strokeWidth={2.2} />
            </View>
            <Text style={styles.statValue}>{String(stats.total)}</Text>
            <Text style={styles.statLabel}>Total drivers</Text>
            <Text style={styles.statHint}>Across all locations</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <CheckCircle2 size={16} color={SUCCESS_GREEN} strokeWidth={2.2} />
            </View>
            <Text style={styles.statValue}>{String(stats.active)}</Text>
            <Text style={styles.statLabel}>Active</Text>
            <Text style={styles.statHint}>On duty and available</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.goldLight }]}>
              <UserCog size={16} color={colors.primaryDark} strokeWidth={2.2} />
            </View>
            <Text style={styles.statValue}>{String(stats.onJob)}</Text>
            <Text style={styles.statLabel}>On job</Text>
            <Text style={styles.statHint}>Currently assigned</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <XCircle size={16} color={colors.error} strokeWidth={2.2} />
            </View>
            <Text style={styles.statValue}>{String(stats.inactive)}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
            <Text style={styles.statHint}>Not in service</Text>
          </View>
        </ScrollView>

        <View style={styles.searchBox}>
          <Search size={16} color={colors.grey} strokeWidth={2.2} />
          <TextInput
            value={search}
            onChangeText={text => {
              setSearch(text);
              setPage(1);
            }}
            placeholder="Search by name or phone"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filterRow}>
          <Pressable onPress={cycleStatusFilter} style={styles.filterPill}>
            <Text style={styles.filterText}>{statusFilterLabel}</Text>
            <ChevronDown size={14} color={colors.grey} strokeWidth={2.4} />
          </Pressable>
          <Pressable onPress={cycleLocationFilter} style={styles.filterPill}>
            <Text style={styles.filterText}>
              {locationFilter === 'all' ? 'All locations' : locationFilter}
            </Text>
            <ChevronDown size={14} color={colors.grey} strokeWidth={2.4} />
          </Pressable>
          <Pressable onPress={cycleTypeFilter} style={styles.filterPill}>
            <Text style={styles.filterText}>
              {typeFilter === 'all' ? 'All vehicle types' : typeFilter}
            </Text>
            <ChevronDown size={14} color={colors.grey} strokeWidth={2.4} />
          </Pressable>
          <Pressable onPress={cycleSort} style={styles.filterPill}>
            <Text style={styles.filterText}>Sort: {sortLabel}</Text>
            <ChevronDown size={14} color={colors.grey} strokeWidth={2.4} />
          </Pressable>
        </View>

        {isLoading || vendorLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : pageItems.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.iconWrap}>
              <Users size={36} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No fleet drivers yet</Text>
            <Text style={styles.emptySubtitle}>
              Add drivers to your fleet so you can assign them to vehicles and jobs.
            </Text>
          </View>
        ) : (
          pageItems.map(driver => {
            const ui = driverUiStatus(driver);
            const vehicle = vehicleByReg.get(normalizeReg(driver.vehicleRegistration));
            const plate = formatPlate(driver.vehicleRegistration);
            return (
              <View key={driver.id} style={styles.driverCard}>
                <View style={styles.driverTop}>
                  <View style={styles.avatarWrap}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {driver.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: ui.dot }]} />
                  </View>

                  <View style={styles.driverMain}>
                    <View style={styles.nameRow}>
                      <Text style={styles.driverName} numberOfLines={1}>
                        {driver.name}
                      </Text>
                      {isVerified(driver) ? (
                        <BadgeCheck size={16} color={INFO_BLUE} strokeWidth={2.2} />
                      ) : null}
                    </View>
                    <View style={styles.metaRow}>
                      <Phone size={12} color={colors.grey} strokeWidth={2.2} />
                      <Text style={styles.metaText}>{formatPhone(driver.phone)}</Text>
                    </View>
                    <Text style={styles.dlText}>DL: {driver.licenseNo || '—'}</Text>
                  </View>

                  <Pressable
                    onPress={() => setMenuDriver(driver)}
                    hitSlop={10}
                    style={styles.menuBtn}>
                    <MoreVertical size={18} color={colors.grey} strokeWidth={2.2} />
                  </Pressable>
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <Star size={13} color={colors.primary} strokeWidth={2.2} fill={colors.primary} />
                    <Text style={styles.metricText}>
                      {(driver.rating || 0).toFixed(1)} Rating
                    </Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricText}>{driver.driverType}</Text>
                  </View>
                  {driver.city ? (
                    <View style={styles.metric}>
                      <Calendar size={12} color={colors.grey} strokeWidth={2.2} />
                      <Text style={styles.metricText}>{driver.city}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.driverBottom}>
                  <View style={styles.vehicleBlock}>
                    <Truck size={16} color={colors.grey} strokeWidth={2.2} />
                    <View style={{ flex: 1 }}>
                      {plate ? (
                        <>
                          <Text style={styles.vehiclePlate}>{plate}</Text>
                          <Text style={styles.vehicleModel}>
                            {vehicle
                              ? `${vehicle.model} · ${vehicle.type}`
                              : driver.driverType}
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.vehicleEmpty}>— Not assigned</Text>
                      )}
                    </View>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: ui.badgeBg }]}>
                    <Text style={[styles.statusLabel, { color: ui.badgeText }]}>{ui.label}</Text>
                    <Text style={styles.statusSub}>{ui.sub}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {filtered.length > 0 ? (
          <View style={styles.pagination}>
            <Text style={styles.pageMeta}>
              Showing {showingFrom} to {showingTo} of {filtered.length} drivers
            </Text>
            <View style={styles.pageControls}>
              <Pressable
                disabled={currentPage <= 1}
                onPress={() => setPage(p => Math.max(1, p - 1))}
                style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]}>
                <Text style={styles.pageBtnText}>‹</Text>
              </Pressable>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(0, 4)
                .map(num => (
                  <Pressable
                    key={num}
                    onPress={() => setPage(num)}
                    style={[styles.pageBtn, num === currentPage && styles.pageBtnActive]}>
                    <Text
                      style={[
                        styles.pageBtnText,
                        num === currentPage && styles.pageBtnTextActive,
                      ]}>
                      {String(num)}
                    </Text>
                  </Pressable>
                ))}
              <Pressable
                disabled={currentPage >= totalPages}
                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                style={[styles.pageBtn, currentPage >= totalPages && styles.pageBtnDisabled]}>
                <Text style={styles.pageBtnText}>›</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>

      <Modal
        visible={Boolean(menuDriver)}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuDriver(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuDriver(null)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{menuDriver?.name ?? 'Driver'}</Text>
            <Pressable
              style={styles.sheetItem}
              onPress={() => {
                const driver = menuDriver;
                setMenuDriver(null);
                if (driver) {
                  Alert.alert(
                    driver.name,
                    `${formatPhone(driver.phone)}\nDL: ${driver.licenseNo || '—'}\nStatus: ${driverUiStatus(driver).label}`,
                  );
                }
              }}>
              <Text style={styles.sheetItemText}>View details</Text>
            </Pressable>
            <Pressable
              style={styles.sheetItem}
              onPress={() => menuDriver && onRemove(menuDriver)}>
              <Text style={[styles.sheetItemText, { color: colors.error }]}>
                Remove from fleet
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: PAGE_BG,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  title: {
    color: colors.dark,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.grey,
    fontSize: typography.sizes.sm,
    lineHeight: 18,
    paddingRight: spacing.sm,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addLabel: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  pendingBanner: {
    backgroundColor: colors.goldLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F5D98A',
  },
  pendingText: {
    color: colors.primaryDark,
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  formTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.xs,
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.goldLight,
    borderColor: colors.primary,
  },
  typeChipText: {
    color: colors.dark,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.xs,
  },
  typeChipTextActive: { color: colors.primaryDark },
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
  saveBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  disabled: { opacity: 0.6 },
  statsRow: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  statCard: {
    width: 140,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.card,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    color: colors.dark,
    fontSize: 22,
    fontWeight: typography.weights.extrabold,
  },
  statLabel: {
    marginTop: 2,
    color: colors.dark,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
  statHint: {
    marginTop: 2,
    color: colors.grey,
    fontSize: 11,
    lineHeight: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  searchInput: {
    flex: 1,
    color: colors.dark,
    fontSize: typography.sizes.sm,
    paddingVertical: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  filterText: {
    color: colors.grey,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
  },
  emptySubtitle: {
    marginTop: spacing.sm,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 20,
  },
  driverCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  driverTop: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  avatarWrap: {
    width: 52,
    height: 52,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
  },
  statusDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background,
  },
  driverMain: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
    fontSize: typography.sizes.md,
    flexShrink: 1,
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
  },
  dlText: {
    marginTop: 2,
    color: colors.grey,
    fontSize: typography.sizes.xs,
  },
  menuBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    color: colors.dark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  driverBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  vehicleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  vehiclePlate: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  vehicleModel: {
    marginTop: 1,
    color: colors.grey,
    fontSize: typography.sizes.xs,
  },
  vehicleEmpty: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'flex-end',
    minWidth: 88,
  },
  statusLabel: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  statusSub: {
    marginTop: 2,
    color: colors.grey,
    fontSize: 10,
  },
  pagination: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  pageMeta: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
  },
  pageControls: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  pageBtn: {
    minWidth: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pageBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  pageBtnTextActive: {
    color: colors.dark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: 4,
  },
  sheetTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.sm,
  },
  sheetItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sheetItemText: {
    color: colors.dark,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.md,
  },
  pressed: { opacity: 0.92 },
});
