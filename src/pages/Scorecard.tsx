import { useMemo } from 'react';
import { useShots } from '../hooks/useShots';
import type { Shot } from '../types/shot';

interface RoundData {
  courseName: string;
  date: string;
  holes: Map<number, Shot[]>;
}

export default function Scorecard() {
  const { shots } = useShots();

  const rounds = useMemo(() => {
    const roundMap = new Map<string, RoundData>();
    for (const shot of shots) {
      const date = shot.timestamp.slice(0, 10);
      const key = `${shot.courseName || 'Unknown'}-${date}`;
      if (!roundMap.has(key)) {
        roundMap.set(key, { courseName: shot.courseName || 'Unknown Course', date, holes: new Map() });
      }
      const round = roundMap.get(key)!;
      const holeShots = round.holes.get(shot.holeNumber) ?? [];
      holeShots.push(shot);
      round.holes.set(shot.holeNumber, holeShots);
    }
    return Array.from(roundMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [shots]);

  if (rounds.length === 0) {
    return (
      <div className="p-4 max-w-lg mx-auto text-center py-20">
        <div className="text-3xl mb-3 opacity-20">🏌️</div>
        <p className="text-white/30 font-bold">No rounds yet</p>
        <p className="text-white/15 text-sm mt-1">Record some shots to see your scorecard!</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <h2 className="text-lg font-black text-white tracking-wide">Scorecards</h2>

      {rounds.map((round, ri) => {
        const dateObj = new Date(round.date + 'T12:00:00');
        const dateStr = dateObj.toLocaleDateString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        });

        const holeNumbers = Array.from(round.holes.keys()).sort((a, b) => a - b);
        const front9 = holeNumbers.filter(h => h <= 9);
        const back9 = holeNumbers.filter(h => h > 9);

        const getScore = (hole: number) => {
          const holeShots = round.holes.get(hole);
          if (!holeShots) return null;
          const scored = holeShots.find(s => s.scoreOnHole);
          return scored?.scoreOnHole ?? null;
        };

        const getPutts = (hole: number) => {
          const holeShots = round.holes.get(hole);
          if (!holeShots) return null;
          const putted = holeShots.find(s => s.putts != null);
          return putted?.putts ?? null;
        };

        const frontTotal = front9.reduce((sum, h) => sum + (getScore(h) ?? 0), 0);
        const backTotal = back9.reduce((sum, h) => sum + (getScore(h) ?? 0), 0);
        const totalScore = frontTotal + backTotal;
        const totalPutts = holeNumbers.reduce((sum, h) => sum + (getPutts(h) ?? 0), 0);

        const renderHoleRow = (holes: number[], label: string, total: number) => {
          if (holes.length === 0) return null;
          return (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'rgba(0,255,136,0.05)' }}>
                    <th className="px-2 py-1.5 text-left font-bold min-w-[40px] text-neon/40 uppercase tracking-wider text-[10px]">{label}</th>
                    {holes.map(h => (
                      <th key={h} className="px-2 py-1.5 text-center font-bold min-w-[32px] text-white/40">{h}</th>
                    ))}
                    <th className="px-2 py-1.5 text-center font-bold min-w-[36px] text-neon/60" style={{ background: 'rgba(0,255,136,0.05)' }}>Tot</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-glass-border">
                    <td className="px-2 py-2 font-bold text-white/30 text-[10px] uppercase">Score</td>
                    {holes.map(h => {
                      const score = getScore(h);
                      return (
                        <td key={h} className="px-2 py-2 text-center">
                          {score != null ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              score <= 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              score === 3 ? 'bg-neon/10 text-neon/70' :
                              score === 4 ? 'text-white/50' :
                              score === 5 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {score}
                            </span>
                          ) : (
                            <span className="text-white/15">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-center font-black text-neon" style={{ background: 'rgba(0,255,136,0.03)' }}>
                      {total || '-'}
                    </td>
                  </tr>
                  <tr className="border-t border-glass-border" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <td className="px-2 py-1.5 font-bold text-white/20 text-[10px] uppercase">Putts</td>
                    {holes.map(h => {
                      const p = getPutts(h);
                      return (
                        <td key={h} className="px-2 py-1.5 text-center text-white/30">
                          {p != null ? p : <span className="text-white/10">-</span>}
                        </td>
                      );
                    })}
                    <td className="px-2 py-1.5 text-center font-bold text-white/40" style={{ background: 'rgba(0,255,136,0.03)' }}>
                      {totalPutts || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        };

        return (
          <div key={ri} className="glass-card overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-glass-border" style={{ background: 'rgba(0,255,136,0.03)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-black text-sm">{round.courseName}</h3>
                  <p className="text-white/30 text-[10px] mt-0.5 uppercase tracking-wider">{dateStr}</p>
                </div>
                <div className="text-right">
                  {totalScore > 0 && (
                    <div className="text-neon text-xl font-black neon-text">{totalScore}</div>
                  )}
                  <div className="text-white/20 text-[10px] uppercase tracking-wider">{holeNumbers.length} holes</div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-glass-border">
              {renderHoleRow(front9, 'Out', frontTotal)}
              {renderHoleRow(back9, 'In', backTotal)}
            </div>

            {/* Summary */}
            <div className="px-4 py-2.5 flex justify-around text-xs border-t border-glass-border" style={{ background: 'rgba(0,255,136,0.02)' }}>
              <div className="text-center">
                <div className="text-neon font-black">{holeNumbers.reduce((sum, h) => sum + (round.holes.get(h)?.length ?? 0), 0)}</div>
                <div className="text-white/20 text-[10px] uppercase">Shots</div>
              </div>
              {totalPutts > 0 && (
                <div className="text-center">
                  <div className="text-neon font-black">{totalPutts}</div>
                  <div className="text-white/20 text-[10px] uppercase">Putts</div>
                </div>
              )}
              {totalScore > 0 && (
                <div className="text-center">
                  <div className="text-neon font-black">{totalScore}</div>
                  <div className="text-white/20 text-[10px] uppercase">Total</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
