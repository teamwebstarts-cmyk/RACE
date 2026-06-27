import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from '../../theme';
import type { VerificationStage } from '../../types/vendor';

const STAGES: Array<{ key: VerificationStage; label: string }> = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'document_review', label: 'Document Review' },
  { key: 'background_check', label: 'Background Check' },
  { key: 'selfie_match', label: 'Selfie Match' },
  { key: 'approved', label: 'Approved' },
];

interface VerificationTimelineProps {
  currentStage: VerificationStage;
  statusHistory?: Array<{ status: string; note?: string; changedAt: string }>;
}

export default function VerificationTimeline({
  currentStage,
  statusHistory = [],
}: VerificationTimelineProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
  const isRejected = currentStage === 'rejected';

  return (
    <View style={styles.wrap}>
      {STAGES.map((stage, index) => {
        const done = !isRejected && index <= currentIndex;
        const active = stage.key === currentStage;
        const historyItem = statusHistory.find((h) => h.status === stage.key);

        return (
          <View key={stage.key} style={styles.row}>
            <View style={styles.lineCol}>
              <View
                style={[
                  styles.dot,
                  done && styles.dotDone,
                  active && styles.dotActive,
                  isRejected && index === 0 && styles.dotRejected,
                ]}>
                {done ? (
                  <Ionicons name="checkmark" size={12} color={colors.textLight} />
                ) : null}
              </View>
              {index < STAGES.length - 1 ? (
                <View style={[styles.line, done && styles.lineDone]} />
              ) : null}
            </View>
            <View style={styles.content}>
              <Text style={[styles.label, active && styles.labelActive]}>{stage.label}</Text>
              {historyItem?.note ? (
                <Text style={styles.note}>{historyItem.note}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
      {isRejected ? (
        <View style={styles.rejectedBanner}>
          <Ionicons name="close-circle" size={18} color={colors.accentRed} />
          <Text style={styles.rejectedText}>Application rejected</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  lineCol: { alignItems: 'center', width: 24 },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  dotDone: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  dotActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  dotRejected: { borderColor: colors.accentRed, backgroundColor: colors.accentRed },
  line: { flex: 1, width: 2, backgroundColor: colors.glass.border, minHeight: 28 },
  lineDone: { backgroundColor: colors.secondary },
  content: { flex: 1, paddingBottom: spacing.md },
  label: { color: colors.subtext, fontWeight: typography.weights.semibold },
  labelActive: { color: colors.textLight },
  note: { color: colors.textMuted, fontSize: typography.sizes.sm, marginTop: 2 },
  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(229, 57, 53, 0.12)',
  },
  rejectedText: { color: colors.accentRed, fontWeight: typography.weights.bold },
});
