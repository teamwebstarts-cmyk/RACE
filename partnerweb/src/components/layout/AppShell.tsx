import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-viewport">
      <div className="app-shell">{children}</div>
    </div>
  );
}
