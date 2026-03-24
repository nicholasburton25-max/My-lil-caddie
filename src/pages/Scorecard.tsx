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

  // Group shots into rounds (same course + same date)
  const rounds = useMemo(() => {
    const roundMap = new Map<string, RoundData>();

    for (const shot of shots) {
      const date = shot.timestamp.slice(0, 10);
      const key = `${shot.courseName || 'Unknown'}-${date}`;

      if (!roundMap.has(key)) {
        roundMap.set(key, {
          courseName: shot.courseName || 'Unknown Course',
          date,
          holes: new Map(),
        });
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
      <div className="p-4 max-w-lg mx-auto text-center text-gray-400 py-20">
        <p className="text-lg">No rounds yet</p>
        <p className="text-sm mt-1">Record some shots to see your scorecard!</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <h2 className="text-lg font-bold text-gray-800">Scorecards</h2>

      {rounds.map((round, ri) => {
        const dateObj = new Date(round.date + 'T12:00:00');
        const dateStr = dateObj.toLocaleDateString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        });

        // Get holes sorted
        const holeNumbers = Array.from(round.holes.keys()).sort((a, b) => a - b);
        const front9 = holeNumbers.filter(h => h <= 9);
        const back9 = holeNumbers.filter(h => h > 9);

        // Calculate totals
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
                  <tr className="bg-dark-900 text-white">
                    <th className="px-2 py-1.5 text-left font-semibold min-w-[40px]">{label}</th>
                    {holes.map(h => (
                      <th key={h} className="px-2 py-1.5 text-center font-semibold min-w-[32px]">{h}</th>
                    ))}
                    <th className="px-2 py-1.5 text-center font-bold min-w-[36px] bg-dark-800">Tot</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Score row */}
                  <tr className="bg-white">
                    <td className="px-2 py-2 font-semibold text-gray-600">Score</td>
                    {holes.map(h => {
                      const score = getScore(h);
                      return (
                        <td key={h} className="px-2 py-2 text-center">
                          {score != null ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              score <= 2 ? 'bg-golf-500 text-white' :
                              score === 3 ? 'bg-golf-100 text-golf-900' :
                              score === 4 ? 'text-gray-700' :
                              score === 5 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {score}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-center font-bold text-golf-800 bg-golf-50">
                      {total || '-'}
                    </td>
                  </tr>
                  {/* Putts row */}
                  <tr className="bg-gray-50">
                    <td className="px-2 py-1.5 font-semibold text-gray-500">Putts</td>
                    {holes.map(h => {
                      const p = getPutts(h);
                      return (
                        <td key={h} className="px-2 py-1.5 text-center text-gray-500">
                          {p != null ? p : <span className="text-gray-300">-</span>}
                        </td>
                      );
                    })}
                    <td className="px-2 py-1.5 text-center font-semibold text-gray-600 bg-gray-100">
                      {totalPutts || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        };

        return (
          <div key={ri} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-dark-900 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm">{round.courseName}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{dateStr}</p>
                </div>
                <div className="text-right">
                  {totalScore > 0 && (
                    <div className="text-golf-400 text-xl font-bold">{totalScore}</div>
                  )}
                  <div className="text-gray-500 text-xs">{holeNumbers.length} holes</div>
                </div>
              </div>
            </div>

            {/* Scorecard grid */}
            <div className="divide-y divide-gray-100">
              {renderHoleRow(front9, 'Out', frontTotal)}
              {renderHoleRow(back9, 'In', backTotal)}
            </div>

            {/* Summary footer */}
            <div className="px-4 py-2.5 bg-golf-50 flex justify-around text-xs">
              <div className="text-center">
                <div className="text-golf-800 font-bold">{holeNumbers.reduce((sum, h) => sum + (round.holes.get(h)?.length ?? 0), 0)}</div>
                <div className="text-gray-500">Shots</div>
              </div>
              {totalPutts > 0 && (
                <div className="text-center">
                  <div className="text-golf-800 font-bold">{totalPutts}</div>
                  <div className="text-gray-500">Putts</div>
                </div>
              )}
              {totalScore > 0 && (
                <div className="text-center">
                  <div className="text-golf-800 font-bold">{totalScore}</div>
                  <div className="text-gray-500">Total</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
