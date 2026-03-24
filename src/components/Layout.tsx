import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh relative">
      {/* Header */}
      <header className="relative z-10 px-4 py-3 text-center border-b border-glass-border"
        style={{
          background: 'linear-gradient(180deg, rgba(0,20,10,0.95) 0%, rgba(5,5,5,0.9) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center justify-center gap-2">
          {/* Golf flag icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 21V3" stroke="#00FF88" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 3L16 8L4 13" fill="rgba(0,255,136,0.15)" stroke="#00FF88" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="4" cy="21" r="2" fill="#00FF88" opacity="0.3" />
          </svg>
          <h1 className="text-lg font-black tracking-widest uppercase"
            style={{
              background: 'linear-gradient(135deg, #00FF88 0%, #009A4E 50%, #00FF88 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s linear infinite',
            }}
          >
            My Lil Caddie
          </h1>
        </div>
        {/* Subtle glow line under header */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #00FF88, transparent)' }}
        />
      </header>

      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
