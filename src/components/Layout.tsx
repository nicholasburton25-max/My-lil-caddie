import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <header className="bg-golf-900 text-white px-4 py-3 text-center shadow-md">
        <h1 className="text-lg font-bold tracking-wide">My Lil Caddie</h1>
      </header>
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
