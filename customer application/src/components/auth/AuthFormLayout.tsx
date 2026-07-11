import React, { type ReactNode } from 'react';

import AppScreenLayout from '../ui/AppScreenLayout';
import AppStackHeader from '../ui/AppStackHeader';
import { useScreenPx } from '../../hooks/useScreenPx';

type Props = {
  children: ReactNode;
  onBack: () => void;
  horizontalPadding?: number;
};

export default function AuthFormLayout({ children, onBack, horizontalPadding }: Props) {
  const px = useScreenPx();

  return (
    <AppScreenLayout
      edges={['top', 'bottom']}
      keyboardAvoiding
      horizontalPadding={horizontalPadding ?? px(24)}
      header={<AppStackHeader onBack={onBack} />}
      contentStyle={{ paddingTop: 4 }}>
      {children}
    </AppScreenLayout>
  );
}
