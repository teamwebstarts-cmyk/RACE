import React from 'react';
import { HardHat, Wrench, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { colors } from '../../theme';

type Props = {
  size: number;
  accentColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  role?: 'driver' | 'mechanic';
};

const ROLE_ICONS: Record<NonNullable<Props['role']>, LucideIcon> = {
  driver: HardHat,
  mechanic: Wrench,
};

export default function DriverAvatar({
  size,
  accentColor = colors.primary,
  borderColor = colors.primary,
  backgroundColor = colors.background,
  role = 'driver',
}: Props) {
  const iconSize = Math.max(14, Math.round(size * 0.46));
  const Icon = ROLE_ICONS[role];

  return (
    <View style={{ flexShrink: 0 }}>
      <View
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          borderRadius: size / 2,
          backgroundColor,
          borderWidth: 2,
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
        <Icon size={iconSize} color={accentColor} strokeWidth={2.2} />
      </View>
    </View>
  );
}
