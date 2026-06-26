import React, { type ReactNode } from 'react';
import { useNavigation } from '@react-navigation/native';

import AppScreenLayout from '../ui/AppScreenLayout';
import AppStackHeader from '../ui/AppStackHeader';
import { useScreenPx } from '../../hooks/useScreenPx';

type Props = {
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  onBack?: () => void;
  keyboardAvoiding?: boolean;
};

export function useProfilePx() {
  return useScreenPx();
}

export default function ProfileSubScreenLayout({
  title,
  subtitle,
  headerRight,
  footer,
  children,
  onBack,
  keyboardAvoiding,
}: Props) {
  const navigation = useNavigation();
  const handleBack = onBack ?? (() => navigation.goBack());

  return (
    <AppScreenLayout
      keyboardAvoiding={keyboardAvoiding}
      footer={footer}
      header={
        <AppStackHeader
          title={title}
          subtitle={subtitle}
          onBack={handleBack}
          headerRight={headerRight}
        />
      }>
      {children}
    </AppScreenLayout>
  );
}
