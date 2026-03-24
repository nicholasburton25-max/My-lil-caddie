import { useState } from 'react';
import type { Shot } from '../types/shot';
import ShotTracer from './ShotTracer';

const QUALITY_BADGE: Record<string, string> = {
  great: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  good: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  ok: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  poor: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

interface ShotCardProps {
  shot: Shot;
  onDelete: (id: string) => void;
}

export default function ShotCard({ shot, onDelete }: ShotCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const date = new Date(shot.timestamp);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="glass-card overflow-hidden transition-all duration-200 glass-card-hover">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-neon">{shot.club}</span>
          <span className="text-sm text-white/50">{shot.distanceYards} yds</span>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${QUALITY_BADGE[shot.resultQuality]}`}>
            {shot.resultQuality}
          </span>
        </div>
        <div className="text-[10px] text-white/30 text-right uppercase tracking-wider">
          <div>{shot.courseName || 'No course'}</div>
          <div>Hole {shot.holeNumber}</div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-glass-border pt-3 space-y-2 text-sm text-white/50">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-white/30">Lie:</span> <span className="text-white/60">{shot.lie}</span></div>
            <div><span className="text-white/30">Shape:</span> <span className="text-white/60">{shot.shotShape}</span></div>
            <div><span className="text-white/30">Wind:</span> <span className="text-white/60">{shot.wind.speed} {shot.wind.direction !== 'none' ? shot.wind.direction : ''}</span></div>
            <div><span className="text-white/30">Elevation:</span> <span className="text-white/60">{shot.elevation}</span></div>
            {shot.scoreOnHole && <div><span className="text-white/30">Score:</span> <span className="text-white/60">{shot.scoreOnHole}</span></div>}
            {shot.putts != null && <div><span className="text-white/30">Putts:</span> <span className="text-white/60">{shot.putts}</span></div>}
            {shot.puttDistances?.length > 0 && (
              <div><span className="text-white/30">Putt Dist:</span> <span className="text-white/60">{shot.puttDistances.map(d => `${d}ft`).join(', ')}</span></div>
            )}
            <div><span className="text-white/30">Date:</span> <span className="text-white/60">{dateStr} {timeStr}</span></div>
          </div>
          {shot.club !== 'Putter' && (
            <ShotTracer
              shape={shot.shotShape}
              distance={shot.distanceYards}
              quality={shot.resultQuality}
              className="h-32 rounded-lg overflow-hidden"
            />
          )}
          {shot.notes && <div className="text-white/30 italic text-xs">"{shot.notes}"</div>}
          {shot.gpsLocation && (
            <div className="text-[10px] text-white/20">
              GPS: {shot.gpsLocation.lat.toFixed(4)}, {shot.gpsLocation.lng.toFixed(4)}
            </div>
          )}
          <div className="pt-2">
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(shot.id)}
                  className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded-lg font-bold"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 option-btn text-xs rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-red-400/50 hover:text-red-400 transition-colors"
              >
                Delete shot
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
