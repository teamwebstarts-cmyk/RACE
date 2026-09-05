import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { brand } from '../../theme/brand';
import { colors, radius, spacing, typography } from '../../theme';

export default function SosButton() {
  const handlePress = () => {
    void Linking.openURL(`tel:${brand.phone.replace(/\s/g, '')}`);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.iconWrap}>
        <Ionicons name="warning" size={22} color={colors.textLight} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Emergency SOS</Text>
        <Text style={styles.subtitle}>Tap for immediate roadside help</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  title: { color: colors.textLight, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: typography.sizes.sm, marginTop: 2 },
});
