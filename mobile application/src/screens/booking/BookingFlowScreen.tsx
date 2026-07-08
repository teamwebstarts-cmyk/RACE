import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../../components/ui/PrimaryButton';
import Screen, { ScreenContent } from '../../components/ui/Screen';
import type { BookingsStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<BookingsStackParamList, 'BookingFlow'>;

function resolveHomeScreen(categoryId?: string): 'TowingService' | 'DriverService' | 'RoadsideAssistance' {
  const normalized = (categoryId ?? '').toLowerCase();
  if (normalized.includes('driver')) return 'DriverService';
  if (normalized.includes('roadside') || normalized.includes('battery') || normalized.includes('tyre') || normalized.includes('fuel')) {
    return 'RoadsideAssistance';
  }
  return 'TowingService';
}

export default function BookingFlowScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;

  useEffect(() => {
    const tabNav = navigation.getParent();
    const targetScreen = resolveHomeScreen(categoryId);
    tabNav?.navigate('Home', { screen: targetScreen });
    navigation.goBack();
  }, [categoryId, navigation]);

  return (
    <Screen>
      <ScreenContent>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ fontSize: typography.sizes.md, color: colors.textMuted, textAlign: 'center' }}>
            Opening booking flow...
          </Text>
          <PrimaryButton
            label="Go to Services"
            onPress={() => {
              navigation.getParent()?.navigate('Home', {
                screen: resolveHomeScreen(categoryId),
              });
            }}
          />
        </View>
      </ScreenContent>
    </Screen>
  );
}
