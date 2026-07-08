import React from 'react';
import { Image, type ImageSourcePropType, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import {
  Bike,
  Bus,
  Car,
  CarTaxiFront,
  CircleEllipsis,
  Droplet,
  Flame,
  Fuel,
  Leaf,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { images } from '../../assets';
import type { FuelType, VehicleType } from '../../types/vehicle';
import { colors, typography } from '../../theme';

export const VEHICLE_YELLOW = '#F59E0B';
export const VEHICLE_BANNER_BG = '#FEF3C7';

export const VEHICLE_COLOR_OPTIONS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#1F2937' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Gray', hex: '#9CA3AF' },
  { name: 'Brown', hex: '#92400E' },
] as const;

export type UiVehicleType = VehicleType;

export const VEHICLE_TYPE_OPTIONS: Array<{
  id: VehicleType;
  label: string;
  Icon: LucideIcon;
}> = [
  { id: 'car', label: 'Car', Icon: Car },
  { id: 'bike', label: 'Bike', Icon: Bike },
  { id: 'ev', label: 'EV', Icon: Zap },
  { id: 'truck', label: 'Truck', Icon: Truck },
  { id: 'auto', label: 'Auto', Icon: CarTaxiFront },
  { id: 'bus', label: 'Bus', Icon: Bus },
  { id: 'other', label: 'Other', Icon: CircleEllipsis },
];

export const VEHICLE_TYPE_IDS: VehicleType[] = VEHICLE_TYPE_OPTIONS.map(option => option.id);

export const FUEL_TYPE_OPTIONS: Array<{
  id: FuelType;
  label: string;
  Icon: LucideIcon;
}> = [
  { id: 'petrol', label: 'Petrol', Icon: Fuel },
  { id: 'diesel', label: 'Diesel', Icon: Droplet },
  { id: 'cng', label: 'CNG', Icon: Flame },
  { id: 'electric', label: 'EV', Icon: Zap },
  { id: 'hybrid', label: 'Hybrid', Icon: Leaf },
  { id: 'other', label: 'Other', Icon: CircleEllipsis },
];

export const FUEL_TYPE_IDS: FuelType[] = FUEL_TYPE_OPTIONS.map(option => option.id);

export function getVehicleImageSource(type: VehicleType): ImageSourcePropType {
  switch (type) {
    case 'bike':
      return images.booking.vehicleBike;
    case 'truck':
    case 'bus':
    case 'ev':
      return images.booking.vehicleSuv;
    default:
      return images.booking.vehicleSedan;
  }
}

export function getColorHex(colorName?: string): string {
  if (!colorName) return colors.grey;
  const match = VEHICLE_COLOR_OPTIONS.find(
    option => option.name.toLowerCase() === colorName.toLowerCase(),
  );
  return match?.hex ?? colors.grey;
}

export function formatFuelLabel(fuelType: FuelType): string {
  const option = FUEL_TYPE_OPTIONS.find(item => item.id === fuelType);
  if (option) return option.label;
  return fuelType.charAt(0).toUpperCase() + fuelType.slice(1);
}

export function formatVehicleTypeLabel(type: VehicleType): string {
  const option = VEHICLE_TYPE_OPTIONS.find(item => item.id === type);
  if (option) return option.label;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatVehicleTypeWithSubtype(vehicle: {
  vehicleType: VehicleType;
  vehicleSubtype?: string;
}): string {
  const typeLabel = formatVehicleTypeLabel(vehicle.vehicleType);
  if (vehicle.vehicleSubtype) {
    return `${typeLabel} • ${vehicle.vehicleSubtype}`;
  }
  return typeLabel;
}

export function VehicleTypeIcon({
  type,
  size,
  color = colors.grey,
  selected = false,
}: {
  type: VehicleType;
  size: number;
  color?: string;
  selected?: boolean;
}) {
  const option = VEHICLE_TYPE_OPTIONS.find(item => item.id === type);
  const Icon = option?.Icon ?? Car;
  const iconColor = selected ? VEHICLE_YELLOW : color;

  return <Icon size={size} color={iconColor} strokeWidth={2} />;
}

export function UiVehicleTypeIcon({
  type,
  size,
  color = colors.grey,
  selected = false,
}: {
  type: UiVehicleType;
  size: number;
  color?: string;
  selected?: boolean;
}) {
  return (
    <VehicleTypeIcon type={type} size={size} color={color} selected={selected} />
  );
}

export function FuelTypeIcon({
  type,
  size,
  color = colors.grey,
  selected = false,
}: {
  type: FuelType;
  size: number;
  color?: string;
  selected?: boolean;
}) {
  const option = FUEL_TYPE_OPTIONS.find(item => item.id === type);
  const Icon = option?.Icon ?? Fuel;
  const iconColor = selected ? VEHICLE_YELLOW : color;

  return <Icon size={size} color={iconColor} strokeWidth={2} />;
}

export function MiniQrCode({ size }: { size: number }) {
  const pattern = ['1111011', '1010101', '1111011', '1010001', '1111011'];
  const cell = size / pattern[0].length;
  return (
    <Svg width={size} height={size}>
      {pattern.map((row, rowIndex) =>
        row.split('').map((cellValue, colIndex) =>
          cellValue === '1' ? (
            <Rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex * cell}
              y={rowIndex * cell}
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

export function IndFlagBadge({ px }: { px: (n: number) => number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        width: px(38),
        height: px(26),
        borderRadius: px(4),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: px(10),
      }}>
      <View
        style={{
          width: px(14),
          backgroundColor: '#1E40AF',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontSize: px(6),
            fontWeight: typography.weights.bold,
            color: colors.background,
          }}>
          IND
        </Text>
      </View>
      <View style={{ flex: 1, backgroundColor: colors.background }} />
    </View>
  );
}

export function VehiclePlaceholderImage({
  type,
  size,
}: {
  type: VehicleType;
  size: number;
}) {
  return (
    <Image
      source={getVehicleImageSource(type)}
      style={{ width: size, height: size * 0.72, borderRadius: 8 }}
      resizeMode="cover"
    />
  );
}
