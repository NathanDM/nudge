import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import BottomNav from './BottomNav';

export type AppShellContext = {
  setPlusHandler: (handler: (() => void) | null) => void;
  setCloseHandler: (handler: (() => void) | null) => void;
  notifyDrawerOpen: (open: boolean) => void;
};

export default function AppShell() {
  const { isAuthenticated } = useAuth();
  const [plusHandler, setPlusHandler] = useState<(() => void) | null>(null);
  const [closeHandler, setCloseHandler] = useState<(() => void) | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const context: AppShellContext = {
    setPlusHandler,
    setCloseHandler,
    notifyDrawerOpen: setDrawerOpen,
  };

  return (
    <div className="min-h-screen bg-sand pb-24">
      <main className="max-w-4xl mx-auto p-6">
        <Outlet context={context} />
      </main>
      <BottomNav
        drawerOpen={drawerOpen}
        onPlusClick={() => plusHandler?.()}
        onCloseClick={() => closeHandler?.()}
      />
    </div>
  );
}
