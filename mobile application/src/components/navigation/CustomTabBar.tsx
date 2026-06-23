import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Calendar,
  Home,
  LayoutGrid,
  Phone,
  User,
  type LucideIcon,
} from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, shadows, spacing, typography } from '../../theme';
import type { RootTabParamList } from '../../types/navigation';

type TabRouteName = Exclude<keyof RootTabParamList, 'Call'>;

const TAB_CONFIG: Record<
  TabRouteName,
  { label: string; Icon: LucideIcon }
> = {
  Home: { label: 'Home', Icon: Home },
  Services: { label: 'Services', Icon: LayoutGrid },
  Bookings: { label: 'Bookings', Icon: Calendar },
  Profile: { label: 'Profile', Icon: User },
};

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index];

  // Hide tab bar entirely on SOS / Call flow
  if (activeRoute.name === 'Call') {
    return null;
  }

  const handleEmergencyCall = () => {
    navigation.navigate('Call', { screen: 'CallMain' });
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        if (route.name === 'Call') {
          return (
            <View key={route.key} style={styles.fabSlot}>
              <Pressable
                onPress={handleEmergencyCall}
                style={({ pressed }) => [
                  styles.fab,
                  pressed && styles.fabPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Emergency SOS">
                <Phone color={colors.background} size={26} strokeWidth={2.5} />
              </Pressable>
            </View>
          );
        }

        const routeName = route.name as TabRouteName;
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const { label, Icon } = TAB_CONFIG[routeName];
        const tint = isFocused ? colors.primary : colors.grey;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}>
            <Icon
              size={22}
              color={tint}
              strokeWidth={isFocused ? 2.5 : 2}
              fill={isFocused ? tint : 'transparent'}
            />
            <Text style={[styles.tabLabel, { color: tint }]}>{label}</Text>
            {isFocused ? <View style={styles.activeDot} /> : <View style={styles.dotSpacer} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
    minHeight: 52,
  },
  tabLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginTop: 4,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  dotSpacer: {
    width: 5,
    height: 5,
    marginTop: 4,
  },
  fabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -28,
  },
  fab: {
    width: layout.fabSize,
    height: layout.fabSize,
    borderRadius: layout.fabSize / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
  fabPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
});
