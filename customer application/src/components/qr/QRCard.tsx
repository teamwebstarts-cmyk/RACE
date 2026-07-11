import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BrandLogo from '../ui/BrandLogo';
import { colors, radius, spacing, typography } from '../../theme';

interface QRCardProps {
  qrUri?: string;
  vehicleNumber: string;
  vehicleLabel?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function QRCard({
  qrUri,
  vehicleNumber,
  vehicleLabel,
  onDownload,
  onShare,
}: QRCardProps) {
  return (
    <View style={styles.card}>
      <BrandLogo size="small" style={styles.logo} />
      <View style={styles.qrWrap}>
        {qrUri ? (
          <Image source={{ uri: qrUri }} style={styles.qr} resizeMode="contain" />
        ) : (
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={120} color={colors.textDark} />
          </View>
        )}
      </View>
      <Text style={styles.number}>{vehicleNumber}</Text>
      {vehicleLabel ? <Text style={styles.label}>{vehicleLabel}</Text> : null}
      {(onDownload || onShare) && (
        <View style={styles.actions}>
          {onDownload ? (
            <Pressable style={styles.actionBtn} onPress={onDownload}>
              <Ionicons name="download-outline" size={18} color={colors.textDark} />
              <Text style={styles.actionText}>Download</Text>
            </Pressable>
          ) : null}
          {onShare ? (
            <Pressable style={[styles.actionBtn, styles.actionOutline]} onPress={onShare}>
              <Ionicons name="share-outline" size={18} color={colors.primary} />
              <Text style={[styles.actionText, styles.actionTextOutline]}>Share</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    padding: spacing.lg,
    alignItems: 'center',
  },
  logo: { marginBottom: spacing.md },
  qrWrap: {
    backgroundColor: colors.backgroundSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  qr: { width: 200, height: 200 },
  qrPlaceholder: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  number: {
    marginTop: spacing.md,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    letterSpacing: 1,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  actionOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionText: {
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    fontSize: typography.sizes.sm,
  },
  actionTextOutline: {
    color: colors.primary,
  },
});
