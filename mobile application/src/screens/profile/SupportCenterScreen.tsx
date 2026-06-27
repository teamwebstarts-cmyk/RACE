import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../../components/ui/PrimaryButton';
import Screen, { Card, ScreenContent } from '../../components/ui/Screen';
import { brand } from '../../theme';
import type { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SupportCenter'>;

const FAQS = [
  { q: 'How fast is roadside assistance?', a: 'Average response time is 25 minutes in Bhubaneswar.' },
  { q: 'Can I track my driver?', a: 'Yes, use Live Tracking from your active booking.' },
  { q: 'What payment methods are accepted?', a: 'UPI, cards, net banking, and RACE Wallet.' },
];

export default function SupportCenterScreen({}: Props) {
  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenContent>
            <Text style={styles.subtitle}>We're here 24/7 to help you</Text>

            <View style={styles.actions}>
              <PrimaryButton label="Call Support" onPress={() => Linking.openURL(`tel:${brand.phoneRaw}`)} />
              <PrimaryButton
                label="WhatsApp Support"
                onPress={() => Linking.openURL(`https://wa.me/${brand.phoneRaw.replace('+', '')}`)}
                variant="outline"
              />
              <PrimaryButton label="Raise a Ticket" onPress={() => undefined} variant="outline" />
            </View>

            <Text style={styles.section}>FAQs</Text>
            {FAQS.map((faq, i) => (
              <Card key={i} style={styles.faq}>
                <View style={styles.faqHeader}>
                  <Ionicons name="help-circle" size={20} color={colors.primary} />
                  <Text style={styles.faqQ}>{faq.q}</Text>
                </View>
                <Text style={styles.faqA}>{faq.a}</Text>
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
  actions: { gap: spacing.md, marginBottom: spacing.xl },
  section: { fontWeight: typography.weights.bold, color: colors.textDark, marginBottom: spacing.md, fontSize: typography.sizes.lg },
  faq: { marginBottom: spacing.md },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  faqQ: { fontWeight: typography.weights.bold, color: colors.textDark, flex: 1 },
  faqA: { color: colors.textMuted, lineHeight: 22 },
});
