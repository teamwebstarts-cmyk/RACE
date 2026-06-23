import React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import {
  Bike,
  Car,
  Circle,
  Fuel,
  Info,
  Plus,
} from 'lucide-react-native';
import Svg, { Rect } from 'react-native-svg';

import ProfileSubScreenLayout, { useProfilePx } from '../../components/profile/ProfileSubScreenLayout';
import { VEHICLES } from '../../constants/demo';
import { images } from '../../assets';
import type { Vehicle } from '../../types/models';
import { colors, shadows, typography } from '../../theme';

function MiniQR({ size }: { size: number }) {
  const pattern = ['1111011', '1010101', '1111011', '1010001', '1111011'];
  const cell = size / pattern[0].length;
  return (
    <Svg width={size} height={size}>
      {pattern.map((row, ri) =>
        row.split('').map((cellVal, ci) =>
          cellVal === '1' ? (
            <Rect
              key={`${ri}-${ci}`}
              x={ci * cell}
              y={ri * cell}
              width={cell - 0.5}
              height={cell - 0.5}
              fill={colors.dark}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}

function vehicleImage(vehicle: Vehicle) {
  if (vehicle.type === 'Bike') return images.booking.vehicleBike;
  return images.booking.vehicleSedan;
}

function VehicleCard({ vehicle, px }: { vehicle: Vehicle; px: (n: number) => number }) {
  const isPrimary = vehicle.isPrimary;

  return (
    <View
      style={[
        {
          borderRadius: px(14),
          borderWidth: isPrimary ? 1.5 : 1,
          borderColor: isPrimary ? colors.primary : colors.border,
          backgroundColor: colors.background,
          padding: px(12),
          marginBottom: px(12),
        },
        isPrimary ? shadows.card : undefined,
      ]}>
      {isPrimary ? (
        <View style={{ alignItems: 'flex-end', marginBottom: px(8) }}>
          <View
            style={{
              paddingHorizontal: px(10),
              paddingVertical: px(4),
              borderRadius: px(12),
              backgroundColor: colors.goldLight,
            }}>
            <Text
              style={{
                fontSize: px(10),
                fontWeight: typography.weights.bold,
                color: colors.primary,
              }}>
              Primary Vehicle
            </Text>
          </View>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: px(10) }}>
        <Image
          source={vehicleImage(vehicle)}
          style={{ width: px(96), height: px(72), borderRadius: px(8) }}
          resizeMode="cover"
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: px(8) }}>
            <View style={{ flex: 1, minWidth: 0, paddingRight: px(4) }}>
              <Text
                numberOfLines={2}
                style={{
                  fontSize: px(14),
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                  marginBottom: px(2),
                }}>
                {vehicle.brand} {vehicle.model}
              </Text>
              <Text style={{ fontSize: px(11), color: colors.grey, marginBottom: px(6) }}>
                {vehicle.number}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: px(10) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(4) }}>
                  <Fuel size={px(11)} color={colors.grey} />
                  <Text style={{ fontSize: px(10), color: colors.grey }}>{vehicle.fuel}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(4) }}>
                  <Circle
                    size={px(8)}
                    color={vehicle.color === 'Black' ? colors.dark : colors.error}
                    fill={vehicle.color === 'Black' ? colors.dark : colors.error}
                  />
                  <Text style={{ fontSize: px(10), color: colors.grey }}>{vehicle.color}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(4) }}>
                  {vehicle.type === 'Bike' ? (
                    <Bike size={px(11)} color={colors.grey} />
                  ) : (
                    <Car size={px(11)} color={colors.grey} />
                  )}
                  <Text style={{ fontSize: px(10), color: colors.grey }}>{vehicle.type}</Text>
                </View>
              </View>
            </View>
            <View
              style={{
                padding: px(4),
                borderRadius: px(6),
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.background,
                flexShrink: 0,
              }}>
              <MiniQR size={px(40)} />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: px(10),
              marginTop: px(8),
            }}>
            <Pressable onPress={() => Alert.alert('QR Code', vehicle.number)}>
              <Text
                style={{
                  fontSize: px(12),
                  fontWeight: typography.weights.bold,
                  color: colors.primary,
                }}>
                View QR
              </Text>
            </Pressable>
            <Text style={{ color: colors.border }}>|</Text>
            <Pressable onPress={() => Alert.alert('Edit', `Edit ${vehicle.model}`)}>
              <Text
                style={{
                  fontSize: px(12),
                  fontWeight: typography.weights.bold,
                  color: colors.primary,
                }}>
                Edit
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function MyVehiclesScreen() {
  const px = useProfilePx();

  return (
    <ProfileSubScreenLayout title="My Vehicles" subtitle="Manage your registered vehicles">
      {VEHICLES.map(vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} px={px} />
      ))}

      <Pressable
        onPress={() => Alert.alert('Add Vehicle', 'Vehicle registration coming soon.')}
        style={{
          borderRadius: px(14),
          borderWidth: 1.5,
          borderColor: colors.primary,
          borderStyle: 'dashed',
          paddingVertical: px(28),
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: px(14),
        }}>
        <Plus size={px(28)} color={colors.primary} strokeWidth={2} />
        <Text
          style={{
            marginTop: px(6),
            fontSize: px(14),
            fontWeight: typography.weights.bold,
            color: colors.primary,
          }}>
          Add New Vehicle
        </Text>
      </Pressable>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: px(10),
          borderRadius: px(12),
          backgroundColor: colors.goldLight,
          padding: px(12),
        }}>
        <Info size={px(18)} color={colors.primary} strokeWidth={2.2} />
        <Text style={{ flex: 1, fontSize: px(11), color: colors.dark, lineHeight: px(16) }}>
          Each vehicle gets a unique QR code. Scan to request emergency help instantly.
        </Text>
      </View>
    </ProfileSubScreenLayout>
  );
}
