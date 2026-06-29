import { useEffect } from 'react';

import { LoadingState } from '@race/ui';

import { useAuthStore } from '@/stores/auth.store';

export function AuthHydrationGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      useAuthStore.getState().setHasHydrated(true);
      return;
    }

    return useAuthStore.persist.onFinishHydration(() => {
      useAuthStore.getState().setHasHydrated(true);
    });
  }, []);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState message="Loading session..." />
      </div>
    );
  }

  return <>{children}</>;
}
