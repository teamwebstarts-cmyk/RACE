import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export default function ProgressStepper({ currentStep, totalSteps, labels }: ProgressStepperProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const active = step <= currentStep;
          return (
            <View key={step} style={styles.stepItem}>
              <View style={[styles.dot, active && styles.dotActive]}>
                <Text style={[styles.dotText, active && styles.dotTextActive]}>{step}</Text>
              </View>
              {step < totalSteps ? <View style={[styles.line, step < currentStep && styles.lineActive]} /> : null}
            </View>
          );
        })}
      </View>
      {labels?.[currentStep - 1] ? (
        <Text style={styles.label}>{labels[currentStep - 1]}</Text>
      ) : (
        <Text style={styles.label}>
          Step {currentStep} of {totalSteps}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  dotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotText: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  dotTextActive: {
    color: colors.dark,
  },
  line: {
    width: 28,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  lineActive: {
    backgroundColor: colors.primary,
  },
  label: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.grey,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
