import { useEffect, useState } from 'react';

export default function GolfBallAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'launch' | 'arc' | 'land' | 'done'>('launch');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('arc'), 100),
      setTimeout(() => setPhase('land'), 800),
      setTimeout(() => { setPhase('done'); onComplete(); }, 1800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Darkened overlay */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
        phase === 'land' ? 'opacity-0' : 'opacity-20'
      }`} />

      {/* Golf ball */}
      <div
        className="absolute transition-all ease-out"
        style={{
          left: '50%',
          ...(phase === 'launch' ? {
            bottom: '80px',
            transform: 'translateX(-50%) scale(1)',
            transitionDuration: '0ms',
          } : phase === 'arc' ? {
            bottom: '60%',
            transform: 'translateX(30px) scale(0.6)',
            transitionDuration: '700ms',
          } : {
            bottom: '45%',
            transform: 'translateX(40px) scale(0.3)',
            transitionDuration: '600ms',
            opacity: 0,
          }),
        }}
      >
        {/* Ball */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #ffffff, #e8e8e8)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {/* Dimples */}
            <div className="absolute top-1 left-2 w-1 h-1 rounded-full bg-gray-300/50" />
            <div className="absolute top-2.5 left-1 w-1 h-1 rounded-full bg-gray-300/50" />
            <div className="absolute top-2 left-3.5 w-1 h-1 rounded-full bg-gray-300/50" />
            <div className="absolute top-4 left-2.5 w-1 h-1 rounded-full bg-gray-300/50" />
            <div className="absolute top-3.5 left-4.5 w-1 h-1 rounded-full bg-gray-300/50" />
          </div>

          {/* Trail effect */}
          {phase === 'arc' && (
            <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-white/30 blur-sm animate-ping" />
          )}
        </div>
      </div>

      {/* "Shot Saved!" text that appears on land */}
      <div
        className={`absolute left-1/2 top-1/3 -translate-x-1/2 transition-all duration-500 ${
          phase === 'land' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
      >
        <div className="bg-golf-800 text-white px-6 py-3 rounded-2xl shadow-xl text-lg font-bold whitespace-nowrap">
          Shot Saved!
        </div>
      </div>

      {/* Sparkles on land */}
      {phase === 'land' && (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-golf-400 rounded-full animate-ping"
              style={{
                left: `${45 + Math.cos(i * Math.PI / 4) * 8}%`,
                top: `${30 + Math.sin(i * Math.PI / 4) * 8}%`,
                animationDelay: `${i * 50}ms`,
                animationDuration: '600ms',
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
