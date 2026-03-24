import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Record', icon: 'M12 4v16m8-8H4' },
  { to: '/history', label: 'History', icon: 'M4 6h16M4 12h16M4 18h16' },
  { to: '/scorecard', label: 'Card', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/recommend', label: 'Caddie', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { to: '/stats', label: 'Stats', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-glass-border"
      style={{
        background: 'linear-gradient(180deg, rgba(5,5,5,0.9) 0%, rgba(0,10,5,0.98) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.3), transparent)' }}
      />

      <div className="flex justify-around max-w-lg mx-auto pb-[env(safe-area-inset-bottom)]">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center py-3 px-3 min-w-[60px] text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive ? 'text-neon' : 'text-dark-500 hover:text-dark-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator glow */}
                {isActive && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-neon"
                    style={{ boxShadow: '0 0 8px rgba(0,255,136,0.6), 0 0 20px rgba(0,255,136,0.2)' }}
                  />
                )}
                <svg className={`w-5 h-5 mb-1 transition-all duration-200 ${isActive ? 'drop-shadow-[0_0_6px_rgba(0,255,136,0.5)]' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth={isActive ? 2 : 1.5} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
