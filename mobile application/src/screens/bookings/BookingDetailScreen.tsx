import React from 'react';
import { Linking, Pressable, Text, useWindowDimensions, View } from 'react-native';
import {
  Calendar,
  Car,
  Clock,
  IndianRupee,
  MapPin,
  Star,
  Truck,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import DriverAvatar from '../../components/bookings/DriverAvatar';
import ProfileSubScreenLayout from '../../components/profile/ProfileSubScreenLayout';
import GoldButton from '../../components/auth/GoldButton';
import { getBookingDetail, getBookingDetailFromHistory } from '../../constants/bookingDetail';
import { COMPLETED_BOOKINGS } from '../../constants/bookingsScreen';
import { brand } from '../../theme/brand';
import type { BookingsStackParamList } from '../../types/navigation';
import { colors, shadows, typography } from '../../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<BookingsStackParamList, 'BookingDetail'>;

function DetailRow({
  label,
  value,
  px,
}: {
  label: string;
  value: string;
  px: (n: number) => number;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: px(10),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
      <Text style={{ fontSize: px(13), color: colors.grey }}>{label}</Text>
      <Text
        style={{
          fontSize: px(13),
          fontWeight: typography.weights.bold,
          color: colors.dark,
          textAlign: 'right',
          flex: 1,
          marginLeft: px(12),
        }}>
        {value}
      </Text>
    </View>
  );
}

export default function BookingDetailScreen({ navigation, route }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const historyItem = COMPLETED_BOOKINGS.find(item => item.id === route.params.bookingId);
  const detail = historyItem
    ? getBookingDetailFromHistory(historyItem)
    : getBookingDetail(route.params.bookingId);

  const isCompleted = detail.status === 'Completed';

  return (
    <ProfileSubScreenLayout
      title="Booking Detail"
      subtitle={detail.id}
      onBack={() => navigation.goBack()}
      headerRight={
        <View
          style={{
            paddingHorizontal: px(10),
            paddingVertical: px(5),
            borderRadius: px(12),
            backgroundColor: isCompleted ? '#E8F8EE' : colors.goldLight,
          }}>
          <Text
            style={{
              fontSize: px(11),
              fontWeight: typography.weights.bold,
              color: isCompleted ? colors.success : colors.primary,
            }}>
            {detail.status}
          </Text>
        </View>
      }>
        <View style={[styles.card, { borderRadius: px(14), padding: px(14), marginBottom: px(14) }, shadows.card]}>
          <Text style={{ fontSize: px(16), fontWeight: typography.weights.bold, color: colors.dark, marginBottom: px(4) }}>
            {detail.service}
          </Text>
          <Text style={{ fontSize: px(12), color: colors.grey, marginBottom: px(12) }}>{detail.subService}</Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: px(10) }}>
            {[
              { Icon: Calendar, text: detail.date },
              { Icon: Clock, text: detail.duration },
              { Icon: Car, text: detail.vehicle },
              { Icon: Truck, text: detail.towingType },
            ].map(row => (
              <View key={row.text} style={{ flexDirection: 'row', alignItems: 'center', gap: px(6), width: '47%' }}>
                <row.Icon size={px(14)} color={colors.primary} strokeWidth={2} />
                <Text style={{ fontSize: px(11), color: colors.dark, flex: 1 }} numberOfLines={1}>
                  {row.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { borderRadius: px(14), padding: px(14), marginBottom: px(14) }, shadows.card]}>
          <Text style={{ fontSize: px(14), fontWeight: typography.weights.bold, color: colors.dark, marginBottom: px(10) }}>
            Route
          </Text>
          <View style={{ flexDirection: 'row', gap: px(10) }}>
            <View style={{ alignItems: 'center', paddingTop: px(4) }}>
              <View style={{ width: px(8), height: px(8), borderRadius: px(4), backgroundColor: colors.primary }} />
              <View style={{ width: 1, flex: 1, backgroundColor: colors.border, marginVertical: px(4) }} />
              <MapPin size={px(14)} color={colors.error} />
            </View>
            <View style={{ flex: 1, gap: px(14) }}>
              <View>
                <Text style={{ fontSize: px(11), color: colors.grey }}>Pickup</Text>
                <Text style={{ fontSize: px(13), fontWeight: typography.weights.semibold, color: colors.dark }}>
                  {detail.pickup}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: px(11), color: colors.grey }}>Drop</Text>
                <Text style={{ fontSize: px(13), fontWeight: typography.weights.semibold, color: colors.dark }}>
                  {detail.drop}
                </Text>
              </View>
            </View>
          </View>
          <Text style={{ fontSize: px(11), color: colors.grey, marginTop: px(10) }}>
            Distance: {detail.distance} · Time: {detail.time}
          </Text>
        </View>

        <View style={[styles.card, { borderRadius: px(14), padding: px(14), marginBottom: px(14) }, shadows.card]}>
          <Text style={{ fontSize: px(14), fontWeight: typography.weights.bold, color: colors.dark, marginBottom: px(10) }}>
            Driver
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(12) }}>
            <DriverAvatar size={px(48)} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: px(15), fontWeight: typography.weights.bold, color: colors.dark }}>
                {detail.driver.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(4), marginTop: px(2) }}>
                <Star size={px(12)} color={colors.primary} fill={colors.primary} />
                <Text style={{ fontSize: px(12), color: colors.grey }}>
                  {detail.driver.rating} · {detail.driver.experience}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => void Linking.openURL(`tel:${brand.phoneRaw}`)}
              style={{
                paddingHorizontal: px(12),
                paddingVertical: px(8),
                borderRadius: px(10),
                borderWidth: 1.5,
                borderColor: colors.primary,
              }}>
              <Text style={{ fontSize: px(11), fontWeight: typography.weights.bold, color: colors.primary }}>
                Call
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, { borderRadius: px(14), padding: px(14), marginBottom: px(20) }, shadows.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(8), marginBottom: px(10) }}>
            <IndianRupee size={px(16)} color={colors.primary} />
            <Text style={{ fontSize: px(14), fontWeight: typography.weights.bold, color: colors.dark }}>
              Payment Summary
            </Text>
          </View>
          <DetailRow label="Base Fare" value={`₹${detail.payment.baseFare}`} px={px} />
          <DetailRow label="Distance Charge" value={`₹${detail.payment.distanceCharge}`} px={px} />
          <DetailRow label="Platform Fee" value={`₹${detail.payment.platformFee}`} px={px} />
          <DetailRow label="Payment Method" value={detail.payment.method} px={px} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: px(12),
              marginTop: px(4),
            }}>
            <Text style={{ fontSize: px(15), fontWeight: typography.weights.bold, color: colors.dark }}>Total Paid</Text>
            <Text style={{ fontSize: px(20), fontWeight: typography.weights.extrabold, color: colors.primary }}>
              ₹{detail.payment.total}
            </Text>
          </View>
        </View>

        {isCompleted ? (
          <GoldButton
            label="Rate Experience"
            onPress={() => navigation.navigate('TowingRate')}
            style={{ width: '100%', marginBottom: px(10) }}
            height={px(52)}
            labelSize={px(16)}
            borderRadius={px(14)}
          />
        ) : (
          <GoldButton
            label="Track Live"
            onPress={() => navigation.navigate('TowingTrack')}
            style={{ width: '100%', marginBottom: px(10) }}
            height={px(52)}
            labelSize={px(16)}
            borderRadius={px(14)}
          />
        )}

        <Pressable
          onPress={() => void Linking.openURL(`tel:${brand.phoneRaw}`)}
          style={{ alignItems: 'center', paddingVertical: px(8) }}>
          <Text style={{ fontSize: px(13), fontWeight: typography.weights.semibold, color: colors.grey }}>
            Need help? Contact Support
          </Text>
        </Pressable>
    </ProfileSubScreenLayout>
  );
}

const styles = {
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
};
