import { useEffect, useState, useMemo } from 'react';
import type { ResultQuality } from '../types/shot';

interface Props {
  quality: ResultQuality;
  onComplete: () => void;
}

// Generate random confetti pieces once
function generateConfetti(count: number) {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'];
  const shapes = ['circle', 'square', 'strip'] as const;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    shape: shapes[i % shapes.length],
    left: Math.random() * 100,
    delay: Math.random() * 400,
    duration: 1200 + Math.random() * 800,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 720,
    xDrift: (Math.random() - 0.5) * 60,
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
      {/* Darkened overlay */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
        phase === 'land' || phase === 'confetti' ? 'opacity-0' : 'opacity-20'
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
          <div className="w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #ffffff, #e8e8e8)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <div className="absolute top-1 left-2 w-1 h-1 rounded-full bg-gray-300/50" />
            <div className="absolute top-2.5 left-1 w-1 h-1 rounded-full bg-gray-300/50" />
            <div className="absolute top-2 left-3.5 w-1 h-1 rounded-full bg-gray-300/50" />
            <div className="absolute top-4 left-2.5 w-1 h-1 rounded-full bg-gray-300/50" />
            <div className="absolute top-3.5 left-4.5 w-1 h-1 rounded-full bg-gray-300/50" />
          </div>
          {phase === 'arc' && (
            <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-white/30 blur-sm animate-ping" />
          )}
        </div>
      </div>

      {/* "Shot Saved!" / "GREAT SHOT!" text */}
      <div
        className={`absolute left-1/2 top-1/3 -translate-x-1/2 transition-all duration-500 ${
          phase === 'land' || phase === 'confetti' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
      >
        {isGreat ? (
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-xl font-black whitespace-nowrap tracking-wide"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
            >
              GREAT SHOT!
            </div>
            <div className="text-yellow-500 text-sm font-bold mt-2 animate-pulse">
              Pure strike!
            </div>
          </div>
        ) : (
          <div className="bg-golf-800 text-white px-6 py-3 rounded-2xl shadow-xl text-lg font-bold whitespace-nowrap">
            Shot Saved!
          </div>
        )}
      </div>

      {/* Standard sparkles for non-great shots */}
      {!isGreat && phase === 'land' && (
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

      {/* CONFETTI for great shots */}
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
                <div
                  className="rounded-full"
                  style={{
                    width: piece.size,
                    height: piece.size,
                    backgroundColor: piece.color,
                    transform: `rotate(${piece.rotation}deg)`,
                  }}
                />
              ) : piece.shape === 'square' ? (
                <div
                  style={{
                    width: piece.size,
                    height: piece.size,
                    backgroundColor: piece.color,
                    transform: `rotate(${piece.rotation}deg)`,
                    borderRadius: 1,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: piece.size * 0.4,
                    height: piece.size * 1.5,
                    backgroundColor: piece.color,
                    transform: `rotate(${piece.rotation}deg)`,
                    borderRadius: 1,
                  }}
                />
              )}
            </div>
          ))}

          {/* Golden sparkle bursts */}
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
                <path
                  d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z"
                  fill="#FFD700"
                  opacity="0.9"
                />
              </svg>
            </div>
          ))}
        </>
      )}

      {/* Confetti CSS animations */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          25% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(${Math.random() > 0.5 ? '' : '-'}30px) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes sparkle-burst {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
