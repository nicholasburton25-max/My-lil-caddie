import { useEffect, useState, useMemo } from 'react';
import type { ResultQuality } from '../types/shot';

interface Props {
  quality: ResultQuality;
  onComplete: () => void;
}

function generateConfetti(count: number) {
  const colors = ['#00FF88', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#BB8FCE'];
  const shapes = ['circle', 'square', 'strip'] as const;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    shape: shapes[i % shapes.length],
    left: Math.random() * 100,
    delay: Math.random() * 400,
    duration: 1200 + Math.random() * 800,
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 6,
  }));
}

export default function GolfBallAnimation({ quality, onComplete }: Props) {
  const [phase, setPhase] = useState<'launch' | 'arc' | 'land' | 'confetti' | 'done'>('launch');
  const isGreat = quality === 'great';
  const confettiPieces = useMemo(() => isGreat ? generateConfetti(50) : [], [isGreat]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('arc'), 100),
      setTimeout(() => setPhase('land'), 800),
      ...(isGreat
        ? [
            setTimeout(() => setPhase('confetti'), 1200),
            setTimeout(() => { setPhase('done'); onComplete(); }, 3000),
          ]
        : [
            setTimeout(() => { setPhase('done'); onComplete(); }, 1800),
          ]
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete, isGreat]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
        phase === 'land' || phase === 'confetti' ? 'opacity-0' : 'opacity-40'
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
        <div className="relative">
          <div className="w-8 h-8 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #ffffff, #d0d0d0)',
              boxShadow: '0 0 20px rgba(0,255,136,0.3), 0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <div className="absolute top-1 left-2 w-1 h-1 rounded-full bg-gray-300/50" />
            <div className="absolute top-2.5 left-1 w-1 h-1 rounded-full bg-gray-300/50" />
            <div className="absolute top-2 left-3.5 w-1 h-1 rounded-full bg-gray-300/50" />
          </div>
          {phase === 'arc' && (
            <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full blur-sm animate-ping"
              style={{ backgroundColor: 'rgba(0,255,136,0.3)' }}
            />
          )}
        </div>
      </div>

      {/* Message */}
      <div
        className={`absolute left-1/2 top-1/3 -translate-x-1/2 transition-all duration-500 ${
          phase === 'land' || phase === 'confetti' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
      >
        {isGreat ? (
          <div className="text-center">
            <div className="px-8 py-4 rounded-2xl text-xl font-black whitespace-nowrap tracking-widest uppercase"
              style={{
                background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(255,215,0,0.2))',
                border: '2px solid rgba(0,255,136,0.4)',
                color: '#00FF88',
                textShadow: '0 0 20px rgba(0,255,136,0.5), 0 0 40px rgba(0,255,136,0.2)',
                boxShadow: '0 0 30px rgba(0,255,136,0.2), inset 0 0 30px rgba(0,255,136,0.05)',
              }}
            >
              Great Shot!
            </div>
            <div className="text-neon/60 text-sm font-bold mt-2 animate-pulse uppercase tracking-wider">
              Pure strike!
            </div>
          </div>
        ) : (
          <div className="px-6 py-3 rounded-2xl text-lg font-bold whitespace-nowrap"
            style={{
              background: 'rgba(0,255,136,0.1)',
              border: '1px solid rgba(0,255,136,0.3)',
              color: '#00FF88',
              boxShadow: '0 0 20px rgba(0,255,136,0.1)',
            }}
          >
            Shot Saved!
          </div>
        )}
      </div>

      {/* Sparkles for non-great */}
      {!isGreat && phase === 'land' && (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                backgroundColor: 'rgba(0,255,136,0.5)',
                left: `${45 + Math.cos(i * Math.PI / 4) * 8}%`,
                top: `${30 + Math.sin(i * Math.PI / 4) * 8}%`,
                animationDelay: `${i * 50}ms`,
                animationDuration: '600ms',
              }}
            />
          ))}
        </>
      )}

      {/* Confetti for great shots */}
      {isGreat && (phase === 'land' || phase === 'confetti') && (
        <>
          {confettiPieces.map(piece => (
            <div
              key={piece.id}
              className="absolute"
              style={{
                left: `${piece.left}%`,
                top: '-10px',
                animation: `confetti-fall ${piece.duration}ms ease-in ${piece.delay}ms forwards`,
              }}
            >
              {piece.shape === 'circle' ? (
                <div className="rounded-full" style={{ width: piece.size, height: piece.size, backgroundColor: piece.color, transform: `rotate(${piece.rotation}deg)` }} />
              ) : piece.shape === 'square' ? (
                <div style={{ width: piece.size, height: piece.size, backgroundColor: piece.color, transform: `rotate(${piece.rotation}deg)`, borderRadius: 1 }} />
              ) : (
                <div style={{ width: piece.size * 0.4, height: piece.size * 1.5, backgroundColor: piece.color, transform: `rotate(${piece.rotation}deg)`, borderRadius: 1 }} />
              )}
            </div>
          ))}

          {/* Neon sparkle bursts */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`spark-${i}`}
              className="absolute"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${15 + Math.random() * 40}%`,
                animation: `sparkle-burst 800ms ease-out ${200 + i * 100}ms forwards`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="#00FF88" opacity="0.9" />
              </svg>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
