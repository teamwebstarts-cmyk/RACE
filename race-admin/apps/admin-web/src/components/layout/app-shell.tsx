import { CollapsibleSidebar } from './collapsible-sidebar';
import { TopNavigation } from './top-navigation';
import { useLayoutStore } from '@/stores/layout.store';
import { cn } from '@race/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useLayoutStore((s) => s.sidebarCollapsed);

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        display: 'grid',
        gridTemplateColumns: collapsed
          ? 'var(--sidebar-collapsed) minmax(0, 1fr)'
          : 'var(--sidebar-width) minmax(0, 1fr)',
        transition: 'grid-template-columns 250ms ease-in-out',
      }}
    >
      <CollapsibleSidebar />
      <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden">
        <TopNavigation />
        <main
          className={cn(
            'race-page-container race-page-bg flex-1',
            collapsed ? 'race-page-container--full' : 'race-page-container--constrained',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/** @deprecated Use AppShell */
export const AppLayout = AppShell;
