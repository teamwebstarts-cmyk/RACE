import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getSettings } from '@race/api';

import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setTheme = useThemeStore((s) => s.setTheme);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (settings?.appearance.sidebarTheme) {
      setTheme(settings.appearance.sidebarTheme);
    }
  }, [settings?.appearance.sidebarTheme, setTheme]);

  return children;
}
