import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import SosButton from '../../components/dashboard/SosButton';
import PrimaryButton from '../../components/ui/PrimaryButton';
import Screen, { Card, ScreenContent } from '../../components/ui/Screen';
import { useAppSelector } from '../../redux/hooks';
import { brand } from '../../theme';
import type { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EmergencySos'>;

export default function EmergencySosScreen({}: Props) {
  const user = useAppSelector((state) => state.auth.user);
  const emergencyContact = user?.emergencyContact?.name
    ? `${user.emergencyContact.name} (${user.emergencyContact.mobileNumber})`
    : 'Not set — update in profile';

  const notifyContact = () => {
    Alert.alert('Emergency Contact', `Notifying ${emergencyContact}`);
  };

  return (
    <Screen backgroundColor={colors.surfaceDarker}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenContent>
            <Text style={styles.title}>Emergency SOS</Text>
            <Text style={styles.subtitle}>Immediate help when you need it most</Text>

            <View style={styles.sosWrap}>
              <SosButton />
            </View>

            <Card dark style={styles.card}>
              <PrimaryButton label="Call Support" onPress={() => Linking.openURL(`tel:${brand.phoneRaw}`)} />
            </Card>
            <Card dark style={styles.card}>
              <PrimaryButton
                label="Request Emergency Tow"
                onPress={() => Linking.openURL(`tel:${brand.phoneRaw}`)}
                variant="outline"
              />
            </Card>
            <Card dark style={styles.card}>
              <PrimaryButton label="Share Live Location" onPress={() => Alert.alert('Location shared with RACE support')} variant="outline" />
            </Card>
            <Card dark style={styles.card}>
              <PrimaryButton label="Notify Emergency Contact" onPress={notifyContact} variant="outline" />
            </Card>

            <Text style={styles.contactLabel}>Emergency contact: {emergencyContact}</Text>
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: colors.textLight, textAlign: 'center' },
  subtitle: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  sosWrap: { alignItems: 'center', marginBottom: spacing.xl },
  card: { marginBottom: spacing.md },
  contactLabel: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg, fontSize: typography.sizes.sm },
});
