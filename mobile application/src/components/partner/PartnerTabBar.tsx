import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Briefcase,
  LayoutDashboard,
  User,
  type LucideIcon,
} from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '../../theme';
import type { PartnerTabParamList } from '../../types/partnerNavigation';

type TabRouteName = keyof PartnerTabParamList;

const TAB_CONFIG: Record<TabRouteName, { label: string; Icon: LucideIcon }> = {
  PartnerHome: { label: 'Dashboard', Icon: LayoutDashboard },
  PartnerJobs: { label: 'Jobs', Icon: Briefcase },
  PartnerAccount: { label: 'Account', Icon: User },
};

export default function PartnerTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const routeName = route.name as TabRouteName;
        const { options } = descriptors[route.key];
        const tabConfig = TAB_CONFIG[routeName];
        if (!tabConfig) return null;
        const isFocused = state.index === index;
        const { label, Icon } = tabConfig;
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
});
