import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../components/ui/PrimaryButton';
import Screen, { Card, ScreenContent } from '../components/ui/Screen';
import type { HomeStackParamList } from '../types/navigation';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'MoreServices'>;

const COMING_SOON = [
  { id: 'wash', name: 'Car Wash', desc: 'Doorstep car wash & detailing' },
  { id: 'inspect', name: 'Vehicle Inspection', desc: 'Pre-purchase & periodic checks' },
  { id: 'insurance', name: 'Insurance Assistance', desc: 'Claims & renewal support' },
  { id: 'ev', name: 'EV Charging Support', desc: 'Mobile charging assistance' },
  { id: 'ambulance', name: 'Ambulance Service', desc: 'Medical emergency transport' },
  { id: 'fleet', name: 'Corporate Fleet', desc: 'Fleet management solutions' },
];

export default function MoreServicesScreen({}: Props) {
  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenContent>
            <Text style={styles.subtitle}>Coming Soon — Exciting new services!</Text>

            <View style={styles.banner}>
              <Text style={styles.bannerEmoji}>🚀</Text>
              <Text style={styles.bannerText}>
                Expanding Soon! We're working hard to bring you more amazing services.
              </Text>
            </View>

            {COMING_SOON.map((service) => (
              <Card key={service.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="construct" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{service.name}</Text>
                    <Text style={styles.desc}>{service.desc}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Coming Soon</Text>
                  </View>
                </View>
                <Pressable style={styles.notify}>
                  <Text style={styles.notifyText}>Notify Me</Text>
                </Pressable>
              </Card>
            ))}

            <View style={styles.cta}>
              <Text style={styles.ctaText}>Get notified when services launch!</Text>
              <PrimaryButton label="Enable Notifications" onPress={() => undefined} />
            </View>
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  subtitle: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  banner: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  bannerEmoji: { fontSize: 32 },
  bannerText: { flex: 1, color: colors.textLight, lineHeight: 22 },
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
  name: { fontWeight: typography.weights.bold, color: colors.textDark },
  desc: { color: colors.textMuted, fontSize: typography.sizes.sm, marginTop: spacing.xs },
  badge: { backgroundColor: 'rgba(255,195,38,0.15)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8 },
  badgeText: { color: colors.primary, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  notify: { marginTop: spacing.md, alignSelf: 'flex-end', borderWidth: 1, borderColor: colors.primary, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  notifyText: { color: colors.primary, fontWeight: typography.weights.semibold, fontSize: typography.sizes.sm },
  cta: { backgroundColor: colors.primary, borderRadius: 16, padding: spacing.lg, marginTop: spacing.lg },
  ctaText: { color: colors.textDark, marginBottom: spacing.md, fontWeight: typography.weights.semibold },
});
