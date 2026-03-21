import type { Shot, Club, ResultQuality } from '../types/shot';

export function avgDistanceByClub(shots: Shot[]): { club: string; avgDistance: number }[] {
  const map = new Map<Club, number[]>();
  for (const s of shots) {
    if (s.club === 'Putter') continue; // Putter distance isn't meaningful
    const arr = map.get(s.club) ?? [];
    arr.push(s.distanceYards);
    map.set(s.club, arr);
  }

  return Array.from(map.entries())
    .map(([club, dists]) => ({
      club,
      avgDistance: Math.round(dists.reduce((a, b) => a + b, 0) / dists.length),
    }))
    .sort((a, b) => b.avgDistance - a.avgDistance);
}

export function resultDistribution(shots: Shot[]): { name: string; value: number }[] {
  const counts: Record<ResultQuality, number> = { great: 0, good: 0, ok: 0, poor: 0 };
  for (const s of shots) counts[s.resultQuality]++;
  return [
    { name: 'Great', value: counts.great },
    { name: 'Good', value: counts.good },
    { name: 'OK', value: counts.ok },
    { name: 'Poor', value: counts.poor },
  ].filter(d => d.value > 0);
}

export function mostUsedClub(shots: Shot[]): string {
  if (shots.length === 0) return '-';
  const counts = new Map<Club, number>();
  for (const s of shots) counts.set(s.club, (counts.get(s.club) ?? 0) + 1);
  let best: Club = shots[0].club;
  let max = 0;
  for (const [club, count] of counts) {
    if (count > max) { best = club; max = count; }
  }
  return best;
}

export function bestResultClub(shots: Shot[]): string {
  if (shots.length === 0) return '-';
  const scores: Record<string, number> = { great: 4, good: 3, ok: 2, poor: 1 };
  const map = new Map<Club, number[]>();
  for (const s of shots) {
    const arr = map.get(s.club) ?? [];
    arr.push(scores[s.resultQuality]);
    map.set(s.club, arr);
  }
  let best: Club = shots[0].club;
  let bestAvg = 0;
  for (const [club, vals] of map) {
    if (vals.length < 2) continue; // Need at least 2 shots
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (avg > bestAvg) { best = club; bestAvg = avg; }
  }
  return best;
}

export function totalRounds(shots: Shot[]): number {
  const rounds = new Set<string>();
  for (const s of shots) {
    const date = s.timestamp.slice(0, 10);
    rounds.add(`${s.courseName}-${date}`);
  }
  return rounds.size;
}
