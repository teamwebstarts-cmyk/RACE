import React from 'react';
import { Text, View } from 'react-native';
import { AlertTriangle, Clock, MapPin, Tag, Wrench } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { LucideIcon } from 'lucide-react-native';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import {
  ROADSIDE_ACCENT,
  ROADSIDE_ACCENT_LIGHT,
  ROADSIDE_ETA_MINUTES,
  getRoadsideServiceLabel,
  getRoadsideServicePrice,
} from '../../../constants/roadsideBooking';
import { useRoadsideBooking } from '../../../context/RoadsideBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoadsideReview'>;

function ReviewRow({
  Icon,
  label,
  value,
  valueColor = colors.dark,
  t,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  valueColor?: string;
  t: ReturnType<typeof useBookingTheme>['t'];
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: t.px(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
      <View
        style={{
          width: t.px(40),
          height: t.px(40),
          borderRadius: t.px(20),
          backgroundColor: ROADSIDE_ACCENT_LIGHT,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon size={t.px(18)} color={colors.dark} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, marginLeft: t.px(12) }}>
        <Text
          style={{
            fontSize: t.caption,
            fontWeight: typography.weights.semibold,
            color: colors.grey,
            marginBottom: t.px(2),
          }}>
          {label}
        </Text>
        <Text
          style={{
            fontSize: t.bodyLarge,
            fontWeight: typography.weights.bold,
            color: valueColor,
          }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function RoadsideReviewScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking } = useRoadsideBooking();

  const rows = [
    { Icon: Wrench, label: 'Service', value: getRoadsideServiceLabel(booking.serviceId) },
    { Icon: MapPin, label: 'Location', value: booking.location },
    { Icon: Clock, label: 'ETA', value: `${ROADSIDE_ETA_MINUTES} minutes` },
    {
      Icon: Tag,
      label: 'Price',
      value: `₹${getRoadsideServicePrice(booking.serviceId)}`,
      valueColor: ROADSIDE_ACCENT,
    },
  ];

  return (
    <TowingBookingLayout
      title="Review & Confirm"
      step={3}
      accentColor={ROADSIDE_ACCENT}
      onBack={() => navigation.goBack()}
      buttonLabel="Confirm & Get Help"
      onContinue={() =>
        navigation.navigate('BookingPayment', {
          amount: getRoadsideServicePrice(booking.serviceId),
          flow: 'roadside',
        })
      }
      footerNote={
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.px(10),
            borderRadius: t.inputRadius,
            backgroundColor: ROADSIDE_ACCENT_LIGHT,
            paddingHorizontal: t.px(14),
            paddingVertical: t.px(12),
            marginBottom: t.px(4),
          }}>
          <AlertTriangle size={t.iconSm} color={ROADSIDE_ACCENT} strokeWidth={2} />
          <Text style={{ flex: 1, fontSize: t.body, color: colors.dark }}>
            Professional will arrive within{' '}
            <Text style={{ fontWeight: typography.weights.bold, color: ROADSIDE_ACCENT }}>
              {ROADSIDE_ETA_MINUTES} min
            </Text>
          </Text>
        </View>
      }
      footerNoteBelow={
        <Text
          style={{
            fontSize: t.caption,
            color: colors.grey,
            textAlign: 'center',
            marginTop: t.px(2),
            marginBottom: t.px(4),
          }}>
          No charge if we can't help
        </Text>
      }>
      <View
        style={[
          {
            borderRadius: t.cardRadius,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
            paddingHorizontal: t.cardPadding,
            paddingTop: t.px(4),
            paddingBottom: t.px(4),
          },
          shadows.card,
        ]}>
        {rows.map(row => (
          <ReviewRow
            key={row.label}
            Icon={row.Icon}
            label={row.label}
            value={row.value}
            valueColor={row.valueColor}
            t={t}
          />
        ))}
      </View>
    </TowingBookingLayout>
  );
}
