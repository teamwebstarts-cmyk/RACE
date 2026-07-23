import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Calendar, Car, Clock, MapPin } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DriverFareBreakdownCard } from '../../../components/booking/FareBreakdownCard';
import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import {
  DRIVER_ACCENT,
  DRIVER_PACKAGES,
  getDateReviewLabel,
  getDriverTypeLabel,
  getDurationReviewLabel,
  getShortLocation,
} from '../../../constants/driverBooking';
import { useDriverBooking } from '../../../context/DriverBookingContext';
import { estimateDriverFare } from '../../../services/bookings/fareApi';
import type { HomeStackParamList } from '../../../types/navigation';
import type { DriverDurationId } from '../../../types/driverBooking';
import type { DriverFareBreakdown, DriverPackageHours } from '../../../types/fare';
import { calculateDriverPricing, formatRupee } from '../../../utils/driverPricing';
import { parseStoredDate } from '../../../utils/driverCalendar';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'DriverReview'>;

const PRICE_BG = '#FEF3C7';

const DURATION_TO_HOURS: Record<DriverDurationId, DriverPackageHours> = {
  '2': 2,
  '4': 4,
  '8': 8,
  custom: 2,
};

function SummaryRow({
  Icon,
  label,
  value,
  t,
}: {
  Icon: typeof Clock;
  label: string;
  value: string;
  t: ReturnType<typeof useBookingTheme>['t'];
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: t.px(10),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
      <Icon size={t.px(18)} color={colors.grey} strokeWidth={2} style={{ marginTop: t.px(2) }} />
      <View style={{ flex: 1, marginLeft: t.px(12), minWidth: 0 }}>
        <Text style={{ fontSize: t.caption, color: colors.grey, marginBottom: t.px(2) }}>{label}</Text>
        <Text
          numberOfLines={2}
          style={{
            fontSize: t.body,
            fontWeight: typography.weights.semibold,
            color: colors.dark,
            lineHeight: t.px(20),
          }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function DriverReviewScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking, updateBooking } = useDriverBooking();
  const [fareBreakdown, setFareBreakdown] = useState<DriverFareBreakdown | null>(
    booking.fareBreakdown ?? null,
  );
  const [isLoadingFare, setIsLoadingFare] = useState(false);

  const packageHours = DURATION_TO_HOURS[booking.durationId] ?? 2;
  const vehicleCategory = booking.vehicleCategory ?? 'hatchback';
  const selectedPackage = DRIVER_PACKAGES.find(pkg => pkg.hours === packageHours);

  const localPricing = useMemo(
    () => calculateDriverPricing(packageHours, vehicleCategory, booking.driverType),
    [packageHours, vehicleCategory, booking.driverType],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadFare() {
      setIsLoadingFare(true);
      try {
        const estimate = await estimateDriverFare({
          packageHours,
          vehicleCategory,
        });
        if (!cancelled) {
          setFareBreakdown(estimate.fareBreakdown);
        }
      } catch {
        if (!cancelled) {
          setFareBreakdown(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingFare(false);
        }
      }
    }

    void loadFare();
    return () => {
      cancelled = true;
    };
  }, [packageHours, vehicleCategory]);

  useEffect(() => {
    if (!fareBreakdown) return;

    updateBooking({
      packageHours,
      hours: packageHours,
      subtotal: fareBreakdown.totalFare,
      totalPrice: fareBreakdown.totalFare,
      advancePayment: fareBreakdown.advanceAmount,
      includedKm: fareBreakdown.includedKm,
      fareBreakdown,
    });
  }, [fareBreakdown, packageHours, updateBooking]);

  const totalPrice = fareBreakdown?.totalFare ?? localPricing.totalPrice;
  const advancePayment = fareBreakdown?.advanceAmount ?? localPricing.advancePayment;
  const canContinue = Boolean(booking.vehicleId && booking.vehicleCategory) && !isLoadingFare && totalPrice > 0;

  const handleContinue = () => {
    if (!booking.vehicleCategory || !totalPrice) return;

    updateBooking({
      hours: packageHours,
      packageHours,
      subtotal: totalPrice,
      totalPrice,
      advancePayment,
      includedKm: fareBreakdown?.includedKm ?? selectedPackage?.km ?? localPricing.includedKm,
      fareBreakdown: fareBreakdown ?? undefined,
    });
    navigation.navigate('DriverBookingPayment');
  };

  return (
    <TowingBookingLayout
      title="Review & Confirm"
      step={4}
      accentColor={DRIVER_ACCENT}
      scrollable
      onBack={() => navigation.goBack()}
      buttonLabel="Continue"
      onContinue={handleContinue}
      continueDisabled={!canContinue}
      footerNoteBelow={
        <Text
          style={{
            fontSize: t.caption,
            color: colors.grey,
            textAlign: 'center',
            marginTop: t.px(2),
            marginBottom: t.px(4),
          }}>
          You won't be charged until service begins
        </Text>
      }>
      <View style={{ gap: t.px(14), paddingBottom: t.px(8) }}>
        <View
          style={[
            {
              borderRadius: t.cardRadius,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              paddingHorizontal: t.px(16),
              paddingTop: t.px(4),
              paddingBottom: t.px(4),
            },
            shadows.card,
          ]}>
          <Text
            style={{
              fontSize: t.labelBold,
              fontWeight: typography.weights.bold,
              color: colors.dark,
              paddingVertical: t.px(10),
            }}>
            Booking Details
          </Text>
          <SummaryRow
            Icon={Clock}
            label="Driver Type"
            value={getDriverTypeLabel(booking.driverType)}
            t={t}
          />
          <SummaryRow
            Icon={Car}
            label="Vehicle"
            value={booking.vehicleLabel || '—'}
            t={t}
          />
          <SummaryRow
            Icon={Calendar}
            label="Date"
            value={getDateReviewLabel(parseStoredDate(booking.dateId))}
            t={t}
          />
          <SummaryRow
            Icon={Clock}
            label="Duration"
            value={`${getDurationReviewLabel(booking.durationId)} • starts ${booking.startTime}`}
            t={t}
          />
          <View style={{ paddingVertical: t.px(10) }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <MapPin
                size={t.px(18)}
                color={colors.grey}
                strokeWidth={2}
                style={{ marginTop: t.px(2) }}
              />
              <View style={{ flex: 1, marginLeft: t.px(12) }}>
                <Text style={{ fontSize: t.caption, color: colors.grey, marginBottom: t.px(2) }}>
                  Pickup
                </Text>
                <Text
                  style={{
                    fontSize: t.body,
                    fontWeight: typography.weights.semibold,
                    color: colors.dark,
                  }}>
                  {getShortLocation(booking.pickup, booking.pickupLabel)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {isLoadingFare ? (
          <View style={{ alignItems: 'center', paddingVertical: t.px(20) }}>
            <ActivityIndicator color={DRIVER_ACCENT} />
            <Text style={{ marginTop: t.px(8), fontSize: t.caption, color: colors.grey }}>
              Loading fare from server...
            </Text>
          </View>
        ) : fareBreakdown ? (
          <DriverFareBreakdownCard breakdown={fareBreakdown} accentColor={DRIVER_ACCENT} />
        ) : (
          <View
            style={{
              borderRadius: t.cardRadius,
              backgroundColor: PRICE_BG,
              borderWidth: 1,
              borderColor: DRIVER_ACCENT,
              padding: t.px(16),
              gap: t.px(10),
            }}>
            <Text
              style={{
                fontSize: t.labelBold,
                fontWeight: typography.weights.bold,
                color: colors.dark,
              }}>
              Price Estimate
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: t.caption, color: colors.grey }}>
                {packageHours} hr package
                {selectedPackage?.km ? ` • ${selectedPackage.km} km` : ''}
              </Text>
              <Text
                style={{
                  fontSize: t.caption,
                  fontWeight: typography.weights.semibold,
                  color: colors.dark,
                }}>
                {formatRupee(totalPrice)}
              </Text>
            </View>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: 'rgba(245, 158, 11, 0.35)',
                paddingTop: t.px(12),
                gap: t.px(4),
              }}>
              <Text style={{ fontSize: t.caption, color: colors.grey }}>Advance (30%)</Text>
              <Text
                style={{
                  fontSize: t.px(20),
                  fontWeight: typography.weights.extrabold,
                  color: DRIVER_ACCENT,
                }}>
                {formatRupee(advancePayment)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TowingBookingLayout>
  );
}
