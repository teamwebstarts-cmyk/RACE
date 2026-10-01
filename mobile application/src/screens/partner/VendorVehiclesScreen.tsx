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
  Calendar,
  CheckCircle2,
  ChevronDown,
  MoreVertical,
  Plus,
  Search,
  Truck,
  User,
  Wrench,
  XCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import FormField from '../../components/auth/FormField';
import AppScreenLayout from '../../components/ui/AppScreenLayout';
import { getApiErrorMessage } from '../../services/auth/useAuthMutations';
import { useVendorStatusQuery } from '../../services/vendor/useVendorMutations';
import type { FleetDriver } from '../../services/vendor/vendorDriversApi';
import type { FleetVehicle, FleetVehicleStatus } from '../../services/vendor/vendorVehiclesApi';
import {
  useAssignDriverToVehicleMutation,
  useCreateVendorVehicleMutation,
  useRemoveVendorVehicleMutation,
  useUpdateVendorVehicleMutation,
  useVendorFleetDriversQuery,
  useVendorFleetVehiclesQuery,
} from '../../services/vendor/useVendorBookingsQueries';
import { PARTNER_WAITING_ADMIN_APPROVAL } from '../../constants/partnerCopy';
import { colors, radius, shadows, spacing, typography } from '../../theme';

const PAGE_BG = '#F7F7F5';
const SUCCESS_GREEN = '#22C55E';
const INFO_BLUE = '#2563EB';
const PAGE_SIZE = 5;

const VEHICLE_TYPES = [
  'Car Tow',
  'Truck Tow',
  'Jump Start',
  'Flatbed',
  'Wheel-lift',
  'Recovery',
  'Other',
] as const;

type StatusFilter = 'all' | FleetVehicleStatus;
type SortKey = 'newest' | 'oldest' | 'reg';

function normalizeReg(value?: string) {
  return (value ?? '').replace(/\s+/g, '').toUpperCase();
}

function formatPlate(reg: string) {
  const clean = normalizeReg(reg);
  // OD02AT1234 → OD 02 AT 1234
  const match = clean.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/);
  if (!match) return reg.toUpperCase();
  return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
}

function typeBadge(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes('truck')) return { bg: '#EDE9FE', text: '#7C3AED', label: type };
  if (lower.includes('jump')) return { bg: '#FFEDD5', text: '#C2410C', label: type };
  if (lower.includes('car') || lower.includes('wheel')) {
    return { bg: '#DBEAFE', text: '#1D4ED8', label: type };
  }
  return { bg: colors.goldLight, text: colors.primaryDark, label: type };
}

function tonnageFor(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes('truck') || lower.includes('recovery')) return '3.5 Ton';
  if (lower.includes('flat')) return '2.5 Ton';
  if (lower.includes('wheel') || lower.includes('car')) return '1.5 Ton';
  if (lower.includes('jump')) return '—';
  return '2.0 Ton';
}

function statusMeta(status: string, driverBusy?: boolean) {
  if (status === 'UNDER_MAINTENANCE') {
    return {
      key: 'service' as const,
      label: 'In service',
      sub: 'Maintenance',
      color: colors.primaryDark,
    };
  }
  if (status === 'INACTIVE') {
    return {
      key: 'inactive' as const,
      label: 'Inactive',
      sub: 'Not in use',
      color: colors.error,
    };
  }
  return {
    key: 'active' as const,
    label: 'Active',
    sub: driverBusy ? 'On duty' : 'Available',
    color: SUCCESS_GREEN,
  };
}

function driverTypeLabel(driverType?: string): CreateDriverType {
  if (driverType === 'Full-Time' || driverType === 'Part-Time' || driverType === 'Tow Driver') {
    return driverType;
  }
  return 'Tow Driver';
}

type CreateDriverType = 'Tow Driver' | 'Full-Time' | 'Part-Time';

export default function VendorVehiclesScreen() {
  const navigation = useNavigation();
  const { data: vendor, isLoading: vendorLoading } = useVendorStatusQuery(true);
  const isApproved = vendor?.status === 'approved';

  const {
    data: vehicles = [],
    isLoading,
    isRefetching,
    refetch,
  } = useVendorFleetVehiclesQuery(true, false);
  const { data: drivers = [], refetch: refetchDrivers } = useVendorFleetDriversQuery(true);

  const createMutation = useCreateVendorVehicleMutation();
  const updateMutation = useUpdateVendorVehicleMutation();
  const removeMutation = useRemoveVendorVehicleMutation();
  const assignMutation = useAssignDriverToVehicleMutation();

  const [showForm, setShowForm] = useState(false);
  const [registrationNo, setRegistrationNo] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState<(typeof VEHICLE_TYPES)[number]>('Car Tow');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);

  const [menuVehicle, setMenuVehicle] = useState<FleetVehicle | null>(null);
  const [assignVehicle, setAssignVehicle] = useState<FleetVehicle | null>(null);

  const driverByReg = useMemo(() => {
    const map = new Map<string, FleetDriver>();
    for (const driver of drivers) {
      const key = normalizeReg(driver.vehicleRegistration);
      if (key) map.set(key, driver);
    }
    return map;
  }, [drivers]);

  const stats = useMemo(() => {
    const active = vehicles.filter(v => v.status === 'ACTIVE').length;
    const service = vehicles.filter(v => v.status === 'UNDER_MAINTENANCE').length;
    const inactive = vehicles.filter(v => v.status === 'INACTIVE').length;
    return { total: vehicles.length, active, service, inactive };
  }, [vehicles]);

  const typeOptions = useMemo(() => {
    const set = new Set(vehicles.map(v => v.type).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [vehicles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = vehicles.filter(v => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (typeFilter !== 'all' && v.type !== typeFilter) return false;
      if (!q) return true;
      return (
        v.registrationNo.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'reg') return a.registrationNo.localeCompare(b.registrationNo);
      const aTime = +new Date(a.createdAt ?? 0);
      const bTime = +new Date(b.createdAt ?? 0);
      return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
    });

    return list;
  }, [vehicles, search, statusFilter, typeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const goDrivers = () => {
    const parent = navigation.getParent();
    if (parent) {
      (parent as any).navigate('PartnerAccount', { screen: 'VendorDrivers' });
      return;
    }
    navigation.navigate('VendorDrivers' as never);
  };

  const unassignedDrivers = useMemo(
    () => drivers.filter(d => !normalizeReg(d.vehicleRegistration)),
    [drivers],
  );

  const validate = () => {
    const next: Record<string, string> = {};
    if (registrationNo.trim().length < 4) next.registrationNo = 'Enter registration number';
    if (model.trim().length < 1) next.model = 'Enter vehicle model';
    if (year && (Number(year) < 1990 || Number(year) > 2100)) next.year = 'Enter a valid year';
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
      await createMutation.mutateAsync({
        registrationNo: registrationNo.trim().toUpperCase(),
        type,
        model: model.trim(),
        year: year ? Number(year) : undefined,
        status: 'ACTIVE',
      });
      setRegistrationNo('');
      setModel('');
      setYear('');
      setType('Car Tow');
      setShowForm(false);
      setPage(1);
      Alert.alert('Vehicle added', 'Vendor vehicle is ready to assign on jobs.');
    } catch (error) {
      Alert.alert('Could not add vehicle', getApiErrorMessage(error, 'Please try again'));
    }
  };

  const setVehicleStatus = async (vehicle: FleetVehicle, status: FleetVehicleStatus) => {
    try {
      await updateMutation.mutateAsync({ vehicleId: vehicle.id, payload: { status } });
      setMenuVehicle(null);
    } catch (error) {
      Alert.alert('Update failed', getApiErrorMessage(error, 'Please try again'));
    }
  };

  const onRemove = (vehicle: FleetVehicle) => {
    setMenuVehicle(null);
    Alert.alert('Remove vehicle?', `Remove ${formatPlate(vehicle.registrationNo)} from your vendor team?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await removeMutation.mutateAsync(vehicle.id);
            } catch (error) {
              Alert.alert('Remove failed', getApiErrorMessage(error, 'Please try again'));
            }
          })();
        },
      },
    ]);
  };

  const onAssignDriver = async (driver: FleetDriver) => {
    if (!assignVehicle) return;
    try {
      await assignMutation.mutateAsync({
        name: driver.name,
        phone: driver.phone,
        licenseNo: driver.licenseNo || 'PENDING',
        driverType: driverTypeLabel(driver.driverType),
        city: driver.city,
        vehicleRegistration: assignVehicle.registrationNo,
      } as any);
      setAssignVehicle(null);
      await refetchDrivers();
      Alert.alert('Driver assigned', `${driver.name} is linked to ${formatPlate(assignVehicle.registrationNo)}.`);
    } catch (error) {
      Alert.alert('Assign failed', getApiErrorMessage(error, 'Please try again'));
    }
  };

  const openAssign = (vehicle: FleetVehicle) => {
    if (!isApproved) {
      Alert.alert('Approval required', PARTNER_WAITING_ADMIN_APPROVAL);
      return;
    }
    if (drivers.length === 0) {
      Alert.alert('No drivers', 'Add a vendor driver first, then assign them to this vehicle.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add driver',
          onPress: () => goDrivers(),
        },
      ]);
      return;
    }
    setAssignVehicle(vehicle);
  };

  const cycleStatusFilter = () => {
    const order: StatusFilter[] = ['all', 'ACTIVE', 'UNDER_MAINTENANCE', 'INACTIVE'];
    const next = order[(order.indexOf(statusFilter) + 1) % order.length] ?? 'all';
    setStatusFilter(next);
    setPage(1);
  };

  const cycleTypeFilter = () => {
    const idx = typeOptions.indexOf(typeFilter);
    const next = typeOptions[(idx + 1) % typeOptions.length] ?? 'all';
    setTypeFilter(next);
    setPage(1);
  };

  const cycleSort = () => {
    const order: SortKey[] = ['newest', 'oldest', 'reg'];
    setSortBy(order[(order.indexOf(sortBy) + 1) % order.length] ?? 'newest');
    setPage(1);
  };

  const statusFilterLabel =
    statusFilter === 'all'
      ? 'All status'
      : statusFilter === 'ACTIVE'
        ? 'Active'
        : statusFilter === 'UNDER_MAINTENANCE'
          ? 'In service'
          : 'Inactive';

  const sortLabel =
    sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Plate no.';

  return (
    <AppScreenLayout
      backgroundColor={PAGE_BG}
      refreshing={isRefetching}
      onRefresh={() => {
        void refetch();
        void refetchDrivers();
      }}
      header={
        <View style={styles.headerPad}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Vendor vehicles</Text>
              <Text style={styles.subtitle}>
                Manage your vendor vehicles and keep them road-ready.
              </Text>
            </View>
            <Pressable
              onPress={onToggleForm}
              style={({ pressed }) => [styles.registerBtn, pressed && styles.pressed]}>
              <Plus size={16} color={colors.dark} strokeWidth={2.6} />
              <Text style={styles.registerLabel}>
                {showForm ? 'Close' : 'Register'}
              </Text>
            </Pressable>
          </View>
        </View>
      }>
      {vendorLoading || isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <View style={styles.content}>
          {!isApproved ? (
            <View style={styles.pendingBanner}>
              <Text style={styles.pendingText}>{PARTNER_WAITING_ADMIN_APPROVAL}</Text>
            </View>
          ) : null}

          {showForm ? (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Register vehicle</Text>
              <FormField
                label="Registration number"
                required
                value={registrationNo}
                onChangeText={setRegistrationNo}
                autoCapitalize="characters"
                error={errors.registrationNo}
                placeholder="e.g. OD02AT1234"
              />
              <Text style={styles.typeLabel}>Vehicle type</Text>
              <View style={styles.typeRow}>
                {VEHICLE_TYPES.map(item => (
                  <Pressable
                    key={item}
                    onPress={() => setType(item)}
                    style={[styles.typeChip, type === item && styles.typeChipActive]}>
                    <Text style={[styles.typeChipText, type === item && styles.typeChipTextActive]}>
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <FormField
                label="Model"
                required
                value={model}
                onChangeText={setModel}
                error={errors.model}
                placeholder="e.g. Tata 407"
              />
              <FormField
                label="Year"
                optional
                value={year}
                onChangeText={text => setYear(text.replace(/\D/g, '').slice(0, 4))}
                keyboardType="number-pad"
                error={errors.year}
                placeholder="2022"
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
                  {createMutation.isPending ? 'Saving…' : 'Save vehicle'}
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
                <Truck size={16} color={INFO_BLUE} strokeWidth={2.2} />
              </View>
              <Text style={styles.statValue}>{String(stats.total)}</Text>
              <Text style={styles.statLabel}>Total vehicles</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
                <CheckCircle2 size={16} color={SUCCESS_GREEN} strokeWidth={2.2} />
              </View>
              <Text style={styles.statValue}>{String(stats.active)}</Text>
              <Text style={styles.statLabel}>Active</Text>
              <Text style={styles.statHint}>On duty and available.</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.goldLight }]}>
                <Wrench size={16} color={colors.primaryDark} strokeWidth={2.2} />
              </View>
              <Text style={styles.statValue}>{String(stats.service)}</Text>
              <Text style={styles.statLabel}>In service</Text>
              <Text style={styles.statHint}>Maintenance ongoing.</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
                <XCircle size={16} color={colors.error} strokeWidth={2.2} />
              </View>
              <Text style={styles.statValue}>{String(stats.inactive)}</Text>
              <Text style={styles.statLabel}>Inactive</Text>
              <Text style={styles.statHint}>Not in operation.</Text>
            </View>
          </ScrollView>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Search size={16} color={colors.grey} strokeWidth={2.2} />
              <TextInput
                value={search}
                onChangeText={text => {
                  setSearch(text);
                  setPage(1);
                }}
                placeholder="Search by vehicle number or type"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
              />
            </View>
          </View>

          <View style={styles.filterRow}>
            <Pressable onPress={cycleStatusFilter} style={styles.filterPill}>
              <Text style={styles.filterText}>{statusFilterLabel}</Text>
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

          {pageItems.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.iconWrap}>
                <Truck size={36} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.emptyTitle}>No vendor vehicles yet</Text>
              <Text style={styles.emptySubtitle}>
                Register a tow vehicle so you can assign it with a driver when a job comes in.
              </Text>
            </View>
          ) : (
            pageItems.map(vehicle => {
              const driver = driverByReg.get(normalizeReg(vehicle.registrationNo));
              const badge = typeBadge(vehicle.type);
              const status = statusMeta(vehicle.status, driver?.isBusy);
              return (
                <View key={vehicle.id} style={styles.vehicleCard}>
                  <View style={styles.vehicleTop}>
                    <View style={styles.thumb}>
                      <Truck size={28} color={colors.primaryDark} strokeWidth={2} />
                    </View>
                    <View style={styles.vehicleMain}>
                      <View style={styles.plateRow}>
                        <Text style={styles.plate}>{formatPlate(vehicle.registrationNo)}</Text>
                        <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.typeBadgeText, { color: badge.text }]}>
                            {badge.label}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.modelLine}>
                        {vehicle.model} • {vehicle.type}
                      </Text>
                      <View style={styles.specRow}>
                        <Text style={styles.specText}>{tonnageFor(vehicle.type)}</Text>
                        {vehicle.year ? (
                          <>
                            <Text style={styles.specDot}>•</Text>
                            <Calendar size={12} color={colors.grey} strokeWidth={2.2} />
                            <Text style={styles.specText}>{String(vehicle.year)}</Text>
                          </>
                        ) : null}
                      </View>
                    </View>
                    <Pressable
                      onPress={() => setMenuVehicle(vehicle)}
                      hitSlop={10}
                      style={styles.menuBtn}>
                      <MoreVertical size={18} color={colors.grey} strokeWidth={2.2} />
                    </Pressable>
                  </View>

                  <View style={styles.vehicleBottom}>
                    <View style={styles.driverBlock}>
                      <View
                        style={[
                          styles.driverAvatar,
                          !driver && styles.driverAvatarEmpty,
                        ]}>
                        {driver ? (
                          <Text style={styles.driverInitial}>
                            {driver.name.charAt(0).toUpperCase()}
                          </Text>
                        ) : (
                          <User size={14} color={colors.grey} strokeWidth={2.2} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        {driver ? (
                          <>
                            <Text style={styles.driverName}>{driver.name}</Text>
                            <Text style={styles.driverPhone}>{driver.phone}</Text>
                          </>
                        ) : (
                          <>
                            <Text style={styles.driverNameMuted}>Not assigned</Text>
                            <Pressable onPress={() => openAssign(vehicle)} hitSlop={6}>
                              <Text style={styles.assignLink}>Assign driver</Text>
                            </Pressable>
                          </>
                        )}
                      </View>
                    </View>

                    <View style={styles.statusBlock}>
                      <Text style={[styles.statusLabel, { color: status.color }]}>
                        {status.label}
                      </Text>
                      <Text style={styles.statusSub}>{status.sub}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}

          {filtered.length > 0 ? (
            <View style={styles.pagination}>
              <Text style={styles.pageMeta}>
                Showing {showingFrom} to {showingTo} of {filtered.length} vehicles
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
                  style={[
                    styles.pageBtn,
                    currentPage >= totalPages && styles.pageBtnDisabled,
                  ]}>
                  <Text style={styles.pageBtnText}>›</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      )}

      <Modal
        visible={Boolean(menuVehicle)}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVehicle(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVehicle(null)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {menuVehicle ? formatPlate(menuVehicle.registrationNo) : 'Vehicle'}
            </Text>
            <Pressable
              style={styles.sheetItem}
              onPress={() => menuVehicle && void setVehicleStatus(menuVehicle, 'ACTIVE')}>
              <Text style={styles.sheetItemText}>Mark Active</Text>
            </Pressable>
            <Pressable
              style={styles.sheetItem}
              onPress={() =>
                menuVehicle && void setVehicleStatus(menuVehicle, 'UNDER_MAINTENANCE')
              }>
              <Text style={styles.sheetItemText}>Mark In service</Text>
            </Pressable>
            <Pressable
              style={styles.sheetItem}
              onPress={() => menuVehicle && void setVehicleStatus(menuVehicle, 'INACTIVE')}>
              <Text style={styles.sheetItemText}>Mark Inactive</Text>
            </Pressable>
            {!driverByReg.get(normalizeReg(menuVehicle?.registrationNo)) ? (
              <Pressable
                style={styles.sheetItem}
                onPress={() => {
                  const vehicle = menuVehicle;
                  setMenuVehicle(null);
                  if (vehicle) openAssign(vehicle);
                }}>
                <Text style={[styles.sheetItemText, { color: colors.primaryDark }]}>
                  Assign driver
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              style={styles.sheetItem}
              onPress={() => menuVehicle && onRemove(menuVehicle)}>
              <Text style={[styles.sheetItemText, { color: colors.error }]}>Remove vehicle</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={Boolean(assignVehicle)}
        transparent
        animationType="slide"
        onRequestClose={() => setAssignVehicle(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAssignVehicle(null)}>
          <Pressable style={styles.assignSheet} onPress={e => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>
              Assign driver
              {assignVehicle ? ` · ${formatPlate(assignVehicle.registrationNo)}` : ''}
            </Text>
            <Text style={styles.assignHint}>
              Choose a vendor driver to link with this vehicle.
            </Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {(unassignedDrivers.length > 0 ? unassignedDrivers : drivers).map(driver => (
                <Pressable
                  key={driver.id}
                  style={styles.driverPick}
                  onPress={() => void onAssignDriver(driver)}
                  disabled={assignMutation.isPending}>
                  <View style={styles.driverAvatar}>
                    <Text style={styles.driverInitial}>{driver.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <Text style={styles.driverPhone}>{driver.phone}</Text>
                  </View>
                  <Text style={styles.assignLink}>Assign</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              onPress={() => {
                setAssignVehicle(null);
                goDrivers();
              }}
              style={styles.addDriverLink}>
              <Text style={styles.assignLink}>Manage drivers</Text>
            </Pressable>
          </Pressable>
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
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  registerLabel: {
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
    gap: spacing.md,
    ...shadows.card,
  },
  formTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
  },
  typeLabel: {
    color: colors.dark,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.lightGrey,
  },
  typeChipActive: {
    backgroundColor: colors.goldLight,
    borderColor: colors.primary,
  },
  typeChipText: {
    color: colors.grey,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  typeChipTextActive: { color: colors.primaryDark },
  saveBtn: {
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
  searchRow: {},
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
  vehicleCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  vehicleTop: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleMain: { flex: 1 },
  plateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  plate: {
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
    fontSize: typography.sizes.lg,
  },
  typeBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  modelLine: {
    marginTop: 4,
    color: colors.grey,
    fontSize: typography.sizes.sm,
  },
  specRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    color: colors.grey,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  specDot: { color: colors.textMuted },
  menuBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  driverBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarEmpty: {
    backgroundColor: colors.lightGrey,
  },
  driverInitial: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  driverName: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  driverNameMuted: {
    color: colors.grey,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
  driverPhone: {
    color: colors.grey,
    fontSize: typography.sizes.xs,
    marginTop: 1,
  },
  assignLink: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  statusBlock: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  statusSub: {
    marginTop: 2,
    color: colors.grey,
    fontSize: typography.sizes.xs,
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
  assignSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
  assignHint: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
  },
  driverPick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  addDriverLink: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  pressed: { opacity: 0.92 },
});
