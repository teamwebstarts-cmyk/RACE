import React, { type ReactNode } from 'react';
import { View } from 'react-native';

import AppScreenLayout from '../ui/AppScreenLayout';
import { useScreenPx } from '../../hooks/useScreenPx';
import { colors } from '../../theme';
import StepHeader from './StepHeader';

type Props = {
  children: ReactNode;
  step: number;
  totalSteps?: number;
  scale: number;
  onBack?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
};

export default function OnboardingFormLayout({
  children,
  step,
  totalSteps,
  scale,
  onBack,
  onSkip,
  showSkip,
}: Props) {
  const px = useScreenPx();

  return (
    <AppScreenLayout
      edges={['top']}
      keyboardAvoiding
      horizontalPadding={px(24)}
      header={
        <View
          style={{
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingHorizontal: px(24),
            paddingTop: px(4),
            paddingBottom: px(8),
          }}>
          <StepHeader
            step={step}
            totalSteps={totalSteps}
            scale={scale}
            onBack={onBack}
            onSkip={onSkip}
            showSkip={showSkip}
          />
        </View>
      }
      contentStyle={{ paddingTop: 0 }}>
      {children}
    </AppScreenLayout>
  );
}
