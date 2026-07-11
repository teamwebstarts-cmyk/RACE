import React, { type ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';

import PartnerRegistrationStepper from './PartnerRegistrationStepper';
import PartnerScreenLayout from './PartnerScreenLayout';
import { colors, spacing, typography } from '../../theme';

interface PartnerRegistrationLayoutProps {
  title: string;
  stepLabel: string;
  steps: readonly string[];
  activeStep: number;
  onBack: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function PartnerRegistrationLayout({
  title,
  stepLabel,
  steps,
  activeStep,
  onBack,
  children,
  footer,
}: PartnerRegistrationLayoutProps) {
  return (
    <PartnerScreenLayout
      title={title}
      onBack={onBack}
      footer={footer}
      headerExtra={
        <>
          <Text style={styles.stepLabel}>{stepLabel}</Text>
          <PartnerRegistrationStepper steps={steps} activeStep={activeStep} />
        </>
      }>
      {children}
    </PartnerScreenLayout>
  );
}

const styles = StyleSheet.create({
  stepLabel: {
    marginBottom: spacing.sm,
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});
