import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../../components/ui/PrimaryButton';
import Screen, { Card, ScreenContent } from '../../components/ui/Screen';
import { useAppSelector } from '../../redux/hooks';
import type { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PaymentMethods'>;

export default function PaymentMethodsScreen({}: Props) {
  const wallet = useAppSelector((state) => state.profile.wallet);
  const methods = useAppSelector((state) => state.profile.paymentMethods);

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenContent>
            <Text style={styles.subtitle}>Manage your payment options</Text>

            <View style={styles.wallet}>
              <Ionicons name="wallet" size={28} color={colors.textLight} />
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>RACE Wallet</Text>
                <Text style={styles.walletBalance}>₹{wallet.balance.toLocaleString()}</Text>
                <Text style={styles.walletSub}>Available Balance</Text>
              </View>
              <PrimaryButton label="Add Money +" onPress={() => undefined} />
            </View>

            <Text style={styles.section}>Saved Cards</Text>
            {methods
              .filter((m) => m.type === 'card')
              .map((card) => (
                <View key={card.id} style={styles.cardDark}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.visa}>VISA</Text>
                    {card.isDefault ? <Text style={styles.defaultBadge}>Default</Text> : null}
                  </View>
                  <Text style={styles.cardNumber}>{card.details}</Text>
                  <Text style={styles.cardHolder}>{card.provider}</Text>
                </View>
              ))}
            <Pressable style={styles.addCard}>
              <Text style={styles.addCardText}>+ Add New Card</Text>
            </Pressable>

            <Text style={styles.section}>UPI</Text>
            <Card>
              {methods
                .filter((m) => m.type === 'upi')
                .map((upi) => (
                  <View key={upi.id} style={styles.upiRow}>
                    <Text style={styles.upiLabel}>{upi.label}</Text>
                    <Text style={styles.upiId}>{upi.details}</Text>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  </View>
                ))}
              <Pressable>
                <Text style={styles.linkUpi}>+ Link UPI ID</Text>
              </Pressable>
            </Card>
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
  wallet: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  walletInfo: { flex: 1 },
  walletLabel: { color: colors.textDark, fontWeight: typography.weights.semibold },
  walletBalance: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.extrabold, color: colors.textDark },
  walletSub: { color: colors.textDark, opacity: 0.7, fontSize: typography.sizes.sm },
  section: { fontWeight: typography.weights.bold, color: colors.textDark, marginBottom: spacing.md, fontSize: typography.sizes.lg },
  cardDark: {
    backgroundColor: colors.textDark,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  visa: { color: colors.textLight, fontWeight: typography.weights.bold },
  defaultBadge: { backgroundColor: colors.primary, color: colors.textDark, paddingHorizontal: spacing.sm, borderRadius: 8, fontSize: typography.sizes.xs, overflow: 'hidden' },
  cardNumber: { color: colors.textLight, fontSize: typography.sizes.lg, marginVertical: spacing.md, letterSpacing: 2 },
  cardHolder: { color: colors.textMuted },
  addCard: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: 12, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.xl },
  addCardText: { color: colors.primary, fontWeight: typography.weights.bold },
  upiRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  upiLabel: { fontWeight: typography.weights.bold, color: colors.textDark },
  upiId: { flex: 1, color: colors.textMuted },
  linkUpi: { color: colors.primary, fontWeight: typography.weights.semibold },
});
