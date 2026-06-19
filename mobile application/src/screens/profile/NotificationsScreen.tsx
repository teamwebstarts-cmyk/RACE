import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import LoadingState from '../../components/ui/LoadingState';
import Screen, { Card, ScreenContent } from '../../components/ui/Screen';
import { useAppSelector } from '../../redux/hooks';
import {
  useNotificationPrefsQuery,
  useUpdateNotificationPrefMutation,
} from '../../services/profile/useProfileQueries';
import type { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Notifications'>;

export default function NotificationsScreen({}: Props) {
  const { isLoading } = useNotificationPrefsQuery();
  const updatePref = useUpdateNotificationPrefMutation();
  const preferences = useAppSelector((state) => state.profile.notificationPreferences);

  if (isLoading && preferences.length === 0) {
    return (
      <Screen>
        <LoadingState message="Loading notification settings..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenContent>
            <Text style={styles.subtitle}>Choose what you want to be notified about</Text>
            {preferences.map((pref) => (
              <Card key={pref.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.info}>
                    <Text style={styles.title}>{pref.title}</Text>
                    <Text style={styles.desc}>{pref.description}</Text>
                  </View>
                  <Switch
                    value={pref.enabled}
                    disabled={updatePref.isPending}
                    onValueChange={(enabled) => {
                      updatePref.mutate({ prefId: pref.id, enabled });
                    }}
                    trackColor={{ true: colors.primary, false: colors.border }}
                  />
                </View>
              </Card>
            ))}
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg, textAlign: 'center' },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1 },
  title: { fontWeight: typography.weights.bold, color: colors.textDark },
  desc: { color: colors.textMuted, fontSize: typography.sizes.sm, marginTop: spacing.xs },
});
