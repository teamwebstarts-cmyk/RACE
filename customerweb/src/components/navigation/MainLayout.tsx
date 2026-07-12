import { Outlet } from 'react-router-dom';

import { WebHeader } from './WebHeader';

export function MainLayout() {
  return (
    <div className="main-layout">
      <WebHeader />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
