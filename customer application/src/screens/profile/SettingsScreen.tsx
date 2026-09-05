import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Switch, Text, View } from 'react-native';
import { ChevronRight, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ProfileSubScreenLayout, { useProfilePx } from '../../components/profile/ProfileSubScreenLayout';
import {
  SETTINGS_SECTIONS,
  type SettingsToggleId,
} from '../../constants/profileSubScreens';
import { getApiErrorMessage } from '../../services/api';
import {
  useNotificationPrefsQuery,
  useUpdateNotificationPrefMutation,
} from '../../services/profile/useProfileQueries';
import type { ProfileStackParamList } from '../../types/navigation';
import { colors, shadows, typography } from '../../theme';

const SETTINGS_ROUTES: Partial<Record<string, keyof ProfileStackParamList>> = {
  pin: 'CreatePin',
  mobile: 'ChangeMobileNumber',
};

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const px = useProfilePx();
  const { data: serverPrefs, isLoading: prefsLoading } = useNotificationPrefsQuery();
  const updatePref = useUpdateNotificationPrefMutation();

  const initialToggles = useMemo(() => {
    const map: Record<SettingsToggleId, boolean> = {
      push: true,
      email: false,
      sms: true,
      emergency: true,
    };
    if (serverPrefs) {
      serverPrefs.forEach(pref => {
        if (pref.id === 'booking_updates') map.push = pref.enabled;
        if (pref.id === 'offers') map.email = pref.enabled;
        if (pref.id === 'subscription') map.sms = pref.enabled;
        if (pref.id === 'push') map.push = pref.enabled;
      });
    }
    SETTINGS_SECTIONS.forEach(section => {
      section.items.forEach(item => {
        if (item.kind === 'toggle' && !serverPrefs) {
          map[item.id] = item.defaultOn;
        }
      });
    });
    return map;
  }, [serverPrefs]);

  const [toggles, setToggles] = useState(initialToggles);

  React.useEffect(() => {
    setToggles(initialToggles);
  }, [initialToggles]);

  const setToggle = (id: SettingsToggleId, value: boolean) => {
    setToggles(prev => ({ ...prev, [id]: value }));
    if (id === 'emergency') return;

    const prefId =
      id === 'push' ? 'push' : id === 'email' ? 'offers' : id === 'sms' ? 'subscription' : id;

    updatePref.mutate(
      { prefId, enabled: value },
      {
        onError: err => {
          setToggles(prev => ({ ...prev, [id]: !value }));
          Alert.alert('Update failed', getApiErrorMessage(err));
        },
      },
    );
  };

  const handleNavPress = (id: string, title: string, danger?: boolean) => {
    if (danger) {
      Alert.alert(title, 'This action requires confirmation. Coming soon.');
      return;
    }
    const route = SETTINGS_ROUTES[id];
    if (route) {
      navigation.navigate(route as never);
      return;
    }
    Alert.alert(title, 'Coming soon.');
  };

  return (
    <ProfileSubScreenLayout title="Settings" subtitle="App settings and privacy">
      {prefsLoading ? (
        <View style={{ alignItems: 'center', paddingVertical: px(20) }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
      {SETTINGS_SECTIONS.map(section => (
        <View key={section.title} style={{ marginBottom: px(16) }}>
          <Text
            style={{
              fontSize: px(10),
              fontWeight: typography.weights.bold,
              color: colors.grey,
              letterSpacing: 0.6,
              marginBottom: px(8),
            }}>
            {section.title}
          </Text>
          <View
            style={[
              {
                borderRadius: px(14),
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.background,
                overflow: 'hidden',
              },
              shadows.card,
            ]}>
            {section.items.map((item, index) => {
              const muted = item.kind === 'nav' && item.muted;
              const iconColor = item.kind === 'nav' && item.danger
                ? colors.error
                : muted
                  ? colors.grey
                  : colors.primary;

              return (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: px(12),
                    paddingHorizontal: px(14),
                    paddingVertical: px(12),
                    borderBottomWidth: index < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}>
                  <View
                    style={{
                      width: px(34),
                      height: px(34),
                      borderRadius: px(17),
                      backgroundColor: muted ? colors.lightGrey : colors.goldLight,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                    <item.Icon size={px(16)} color={iconColor} strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        fontSize: px(13),
                        fontWeight: typography.weights.bold,
                        color: item.kind === 'nav' && item.danger ? colors.error : colors.dark,
                      }}>
                      {item.title}
                    </Text>
                    {item.subtitle ? (
                      <Text style={{ fontSize: px(10), color: colors.grey, marginTop: px(2) }}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                  </View>
                  {item.kind === 'toggle' ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(4) }}>
                      {item.locked ? <Lock size={px(12)} color={colors.grey} /> : null}
                      <Switch
                        value={toggles[item.id]}
                        onValueChange={value => setToggle(item.id, value)}
                        trackColor={{ false: colors.lightGrey, true: colors.primary }}
                        thumbColor={colors.background}
                      />
                    </View>
                  ) : (
                    <Pressable
                      onPress={() =>
                        item.kind === 'nav'
                          ? handleNavPress(item.id, item.title, item.danger)
                          : undefined
                      }
                      style={{ flexDirection: 'row', alignItems: 'center', gap: px(4) }}>
                      {item.value ? (
                        <Text
                          style={{
                            fontSize: px(12),
                            fontWeight: typography.weights.bold,
                            color: item.danger ? colors.error : colors.primary,
                          }}>
                          {item.value}
                        </Text>
                      ) : null}
                      {!item.danger && !muted ? (
                        <ChevronRight size={px(16)} color={colors.grey} />
                      ) : null}
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </ProfileSubScreenLayout>
  );
}
