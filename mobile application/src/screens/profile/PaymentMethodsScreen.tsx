import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowUpRight,
  BatteryCharging,
  Check,
  ChevronRight,
  CreditCard,
  IndianRupee,
  Pencil,
  Plus,
  Truck,
  Wallet,
} from 'lucide-react-native';

import GooglePayIcon from '../../components/icons/GooglePayIcon';
import ProfileSubScreenLayout, { useProfilePx } from '../../components/profile/ProfileSubScreenLayout';
import { PAYMENT_DATA } from '../../constants/demo';
import { colors, shadows, typography } from '../../theme';

export default function PaymentMethodsScreen() {
  const px = useProfilePx();
  const { walletBalance, savedCard, upi, transactions } = PAYMENT_DATA;

  return (
    <ProfileSubScreenLayout title="Payment Methods">
      <LinearGradient
        colors={['#FFB800', '#FF9500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: px(16),
          padding: px(16),
          marginBottom: px(18),
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: px(14) }}>
          <Text style={{ fontSize: px(14), fontWeight: typography.weights.bold, color: colors.background }}>
            RACE Wallet
          </Text>
          <Wallet size={px(22)} color={colors.background} strokeWidth={2} />
        </View>
        <Text
          style={{
            fontSize: px(28),
            fontWeight: typography.weights.extrabold,
            color: colors.background,
            marginBottom: px(2),
          }}>
          ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={{ fontSize: px(11), color: 'rgba(255,255,255,0.85)', marginBottom: px(14) }}>
          Available Balance
        </Text>
        <View style={{ flexDirection: 'row', gap: px(10) }}>
          <Pressable
            onPress={() => Alert.alert('Add Money', 'Wallet recharge coming soon.')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: px(4),
              paddingVertical: px(10),
              borderRadius: px(24),
              backgroundColor: colors.background,
            }}>
            <Plus size={px(14)} color={colors.dark} strokeWidth={2.5} />
            <Text style={{ fontSize: px(12), fontWeight: typography.weights.bold, color: colors.dark }}>
              Add Money
            </Text>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert('Withdraw', 'Withdrawal coming soon.')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: px(4),
              paddingVertical: px(10),
              borderRadius: px(24),
              borderWidth: 1.5,
              borderColor: colors.background,
            }}>
            <ArrowUpRight size={px(14)} color={colors.background} strokeWidth={2.5} />
            <Text style={{ fontSize: px(12), fontWeight: typography.weights.bold, color: colors.background }}>
              Withdraw
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      <Text
        style={{
          fontSize: px(15),
          fontWeight: typography.weights.bold,
          color: colors.dark,
          marginBottom: px(10),
        }}>
        Saved Methods
      </Text>
      <View style={{ flexDirection: 'row', gap: px(10), marginBottom: px(18) }}>
        <View
          style={{
            flex: 1,
            borderRadius: px(14),
            backgroundColor: colors.dark,
            padding: px(14),
            minHeight: px(130),
            justifyContent: 'space-between',
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: px(16), fontWeight: typography.weights.extrabold, color: colors.background }}>
              {savedCard.type}
            </Text>
            <View
              style={{
                paddingHorizontal: px(8),
                paddingVertical: px(3),
                borderRadius: px(10),
                backgroundColor: colors.primary,
              }}>
              <Text style={{ fontSize: px(9), fontWeight: typography.weights.bold, color: colors.dark }}>
                Default
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: px(15),
              fontWeight: typography.weights.bold,
              color: colors.background,
              letterSpacing: 1,
            }}>
            •••• {savedCard.last4}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: px(10), color: colors.grey }}>{savedCard.holder}</Text>
              <Text style={{ fontSize: px(10), color: colors.grey }}>{savedCard.expiry}</Text>
            </View>
            <Pencil size={px(14)} color={colors.background} strokeWidth={2} />
          </View>
        </View>
        <Pressable
          onPress={() => Alert.alert('Add Card', 'Add card coming soon.')}
          style={{
            width: px(110),
            borderRadius: px(14),
            borderWidth: 1.5,
            borderColor: colors.primary,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            padding: px(10),
          }}>
          <Plus size={px(24)} color={colors.primary} strokeWidth={2} />
          <Text
            style={{
              marginTop: px(6),
              fontSize: px(11),
              fontWeight: typography.weights.bold,
              color: colors.primary,
              textAlign: 'center',
            }}>
            Add New Card
          </Text>
        </Pressable>
      </View>

      <Text
        style={{
          fontSize: px(15),
          fontWeight: typography.weights.bold,
          color: colors.dark,
          marginBottom: px(10),
        }}>
        UPI
      </Text>
      <Pressable
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: px(10),
            borderRadius: px(12),
            borderWidth: 1,
            borderColor: colors.border,
            padding: px(12),
            marginBottom: px(8),
          },
          shadows.card,
        ]}>
        <GooglePayIcon size={px(32)} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: px(13), fontWeight: typography.weights.bold, color: colors.dark }}>
            {upi}
          </Text>
        </View>
        <Check size={px(14)} color={colors.success} strokeWidth={3} />
        <View
          style={{
            paddingHorizontal: px(8),
            paddingVertical: px(3),
            borderRadius: px(10),
            backgroundColor: colors.goldLight,
          }}>
          <Text style={{ fontSize: px(9), fontWeight: typography.weights.bold, color: colors.primary }}>
            Primary
          </Text>
        </View>
        <ChevronRight size={px(16)} color={colors.grey} />
      </Pressable>
      <Pressable onPress={() => Alert.alert('Add UPI', 'Add UPI coming soon.')}>
        <Text
          style={{
            fontSize: px(12),
            fontWeight: typography.weights.bold,
            color: colors.primary,
            marginBottom: px(18),
          }}>
          + Add UPI ID
        </Text>
      </Pressable>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: px(10),
        }}>
        <Text style={{ fontSize: px(15), fontWeight: typography.weights.bold, color: colors.dark }}>
          Recent Transactions
        </Text>
        <Text style={{ fontSize: px(12), fontWeight: typography.weights.bold, color: colors.primary }}>
          View All →
        </Text>
      </View>
      <View
        style={{
          borderRadius: px(14),
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
          marginBottom: px(14),
          overflow: 'hidden',
        }}>
        {transactions.map((tx, index) => {
          const isCredit = tx.type === 'credit';
          const Icon = tx.label.includes('Battery') ? BatteryCharging : tx.label.includes('Towing') ? Truck : IndianRupee;
          return (
            <View
              key={tx.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: px(10),
                paddingHorizontal: px(12),
                paddingVertical: px(12),
                borderBottomWidth: index < transactions.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}>
              <View
                style={{
                  width: px(34),
                  height: px(34),
                  borderRadius: px(17),
                  backgroundColor: isCredit ? '#E8F8EE' : '#FFF0F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon size={px(16)} color={isCredit ? colors.success : colors.error} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: px(13), fontWeight: typography.weights.bold, color: colors.dark }}>
                  {tx.label}
                </Text>
                <Text style={{ fontSize: px(10), color: colors.grey, marginTop: px(1) }}>{tx.date}</Text>
              </View>
              <Text
                style={{
                  fontSize: px(13),
                  fontWeight: typography.weights.bold,
                  color: isCredit ? colors.success : colors.error,
                }}>
                {isCredit ? '+' : '-'} ₹{tx.amount}
              </Text>
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={() => Alert.alert('Withdraw', 'Bank withdrawal coming soon.')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: px(10),
          borderRadius: px(12),
          backgroundColor: colors.goldLight,
          padding: px(12),
        }}>
        <CreditCard size={px(20)} color={colors.primary} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: px(13), fontWeight: typography.weights.bold, color: colors.dark }}>
            Withdraw to Bank Account
          </Text>
          <Text style={{ fontSize: px(11), color: colors.grey, marginTop: px(2) }}>HDFC •••• 1234</Text>
        </View>
        <Text style={{ fontSize: px(12), fontWeight: typography.weights.bold, color: colors.primary }}>
          Withdraw →
        </Text>
      </Pressable>
    </ProfileSubScreenLayout>
  );
}
