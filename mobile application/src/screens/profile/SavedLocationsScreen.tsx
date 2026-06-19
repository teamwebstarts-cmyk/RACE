import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import LoadingState from '../../components/ui/LoadingState';
import Screen, { Card, ScreenContent } from '../../components/ui/Screen';
import { useAppSelector } from '../../redux/hooks';
import { useSavedLocationsQuery } from '../../services/profile/useProfileQueries';
import type { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SavedLocations'>;

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home',
  office: 'business',
  custom: 'location',
};

export default function SavedLocationsScreen({}: Props) {
  const { isLoading, isError, refetch } = useSavedLocationsQuery();
  const locations = useAppSelector((state) => state.profile.savedLocations);

  if (isLoading && locations.length === 0) {
    return (
      <Screen>
        <LoadingState message="Loading saved locations..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenContent>
            <Text style={styles.subtitle}>Your frequently used locations</Text>
            {isError ? (
              <Pressable onPress={() => void refetch()}>
                <Text style={styles.error}>Could not load locations. Tap to retry.</Text>
              </Pressable>
            ) : null}
            {locations.length === 0 ? (
              <Text style={styles.empty}>No saved locations yet.</Text>
            ) : (
              locations.map((loc) => (
                <Card key={loc.id} style={styles.card}>
                  <View style={styles.row}>
                    <View style={styles.iconWrap}>
                      <Ionicons name={ICONS[loc.type] ?? 'location'} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.label}>{loc.label}</Text>
                      <Text style={styles.address}>{loc.address}</Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
            <Pressable
              style={styles.addBtn}
              onPress={() => Alert.alert('Add Location', 'Use the booking flow to save new locations for now.')}>
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={styles.addText}>Add Location</Text>
            </Pressable>
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
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,195,38,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  label: { fontWeight: typography.weights.bold, color: colors.textDark },
  address: { color: colors.textMuted, marginTop: spacing.xs, fontSize: typography.sizes.sm },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  addText: { color: colors.primary, fontWeight: typography.weights.bold },
  empty: { color: colors.textMuted, textAlign: 'center', marginVertical: spacing.lg },
  error: { color: colors.accentRed, textAlign: 'center', marginBottom: spacing.md },
});
