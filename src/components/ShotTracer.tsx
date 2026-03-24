import type { ShotShape } from '../types/shot';

interface ShotTracerProps {
  shape: ShotShape;
  distance: number;
  quality: string;
  className?: string;
}

export default function ShotTracer({ shape, distance, quality, className = '' }: ShotTracerProps) {
  const getPath = (): string => {
    const startX = 80;
    const startY = 180;
    const endY = 30;
    const shapeOffsets: Record<string, number> = {
      straight: 0, draw: -20, fade: 20, hook: -45, slice: 45, push: 25, pull: -25,
    };
    const offset = shapeOffsets[shape] ?? 0;
    const endX = 80 + offset;
    const cp1x = 80 + offset * 0.3;
    const cp1y = 100;
    const cp2x = 80 + offset * 0.8;
    const cp2y = 50;
    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  };

  const traceColor = quality === 'great' ? '#00FF88'
    : quality === 'good' ? '#3b82f6'
    : quality === 'ok' ? '#eab308'
    : '#ef4444';

  const path = getPath();

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 160 200" className="w-full h-full">
        <defs>
          <linearGradient id="fairwayDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1a10" />
            <stop offset="100%" stopColor="#0d2818" />
          </linearGradient>
          <linearGradient id={`traceFade-${quality}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={traceColor} stopOpacity="0.1" />
            <stop offset="100%" stopColor={traceColor} stopOpacity="1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect x="0" y="0" width="160" height="200" rx="8" fill="url(#fairwayDark)" />

        {/* Grid lines */}
        {[50, 100, 150].map(y => (
          <line key={y} x1="20" y1={y} x2="140" y2={y} stroke="rgba(0,255,136,0.06)" strokeWidth="0.5" />
        ))}

        {/* Distance markers */}
        <text x="145" y="153" fill="rgba(0,255,136,0.2)" fontSize="7" textAnchor="end" fontFamily="monospace">50yd</text>
        <text x="145" y="103" fill="rgba(0,255,136,0.2)" fontSize="7" textAnchor="end" fontFamily="monospace">100yd</text>
        <text x="145" y="53" fill="rgba(0,255,136,0.2)" fontSize="7" textAnchor="end" fontFamily="monospace">150yd</text>

        {/* Shot trace - outer glow */}
        <path d={path} fill="none" stroke={traceColor} strokeWidth="6" strokeLinecap="round" opacity="0.15" filter="url(#glow)" />

        {/* Shot trace - main line */}
        <path d={path} fill="none" stroke={`url(#traceFade-${quality})`} strokeWidth="2" strokeLinecap="round"
          strokeDasharray="200" strokeDashoffset="0"
        >
          <animate attributeName="stroke-dashoffset" from="200" to="0" dur="0.8s" fill="freeze" />
        </path>

        {/* Landing spot */}
        <circle cx={path.split(' ').slice(-2)[0]} cy={path.split(' ').slice(-1)[0]}
          r="4" fill={traceColor} opacity="0.8">
          <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Ball */}
        <circle cx="80" cy="180" r="3" fill="white" opacity="0.8" />
        <rect x="70" y="185" width="20" height="8" rx="2" fill="rgba(0,255,136,0.08)" />
      </svg>

      <div className="absolute bottom-2 left-2 text-[10px] text-neon/50 font-mono font-bold">
        {distance} YDS
      </div>
      <div className="absolute top-2 right-2 text-[10px] text-neon/50 font-mono font-bold uppercase">
        {shape}
      </div>
    </div>
  );
}
