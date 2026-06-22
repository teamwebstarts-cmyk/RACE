import { useState } from 'react';

import { Sidebar } from './sidebar';
import { Header } from './header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} />
      <div className={collapsed ? 'pl-[72px]' : 'pl-sidebar'}>
        <Header onToggleSidebar={() => setCollapsed((v) => !v)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
