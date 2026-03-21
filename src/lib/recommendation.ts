import type { Shot, LieType, WindSpeed, ElevationType, Club } from '../types/shot';

export interface ClubRecommendation {
  club: Club;
  avgDistance: number;
  avgQualityScore: number;
  sampleSize: number;
  confidence: 'low' | 'medium' | 'high';
  compositeScore: number;
}

const QUALITY_SCORES: Record<string, number> = {
  great: 4,
  good: 3,
  ok: 2,
  poor: 1,
};

export function recommendClub(
  conditions: {
    distance: number;
    lie: LieType;
    wind: WindSpeed;
    elevation: ElevationType;
  },
  history: Shot[]
): ClubRecommendation[] {
  // Filter to matching lie (or close enough)
  const relevant = history.filter(s => s.lie === conditions.lie);

  // Group by club
  const byClub = new Map<Club, Shot[]>();
  for (const shot of relevant) {
    const arr = byClub.get(shot.club) ?? [];
    arr.push(shot);
    byClub.set(shot.club, arr);
  }

  const results: ClubRecommendation[] = [];

  for (const [club, shots] of byClub) {
    // Only consider clubs with shots in a reasonable distance range (±30 yards)
    const nearby = shots.filter(
      s => Math.abs(s.distanceYards - conditions.distance) <= 30
    );
    if (nearby.length === 0) continue;

    const avgDistance = nearby.reduce((sum, s) => sum + s.distanceYards, 0) / nearby.length;
    const avgQualityScore = nearby.reduce((sum, s) => sum + QUALITY_SCORES[s.resultQuality], 0) / nearby.length;

    // Distance accuracy: how close is avg distance to target (0-1, 1 is perfect)
    const distanceAccuracy = Math.max(0, 1 - Math.abs(avgDistance - conditions.distance) / 30);

    // Wind adjustment factor
    let windFactor = 1;
    if (conditions.wind === 'strong') windFactor = 0.9;
    else if (conditions.wind === 'moderate') windFactor = 0.95;

    // Elevation adjustment
    let elevFactor = 1;
    if (conditions.elevation === 'uphill') elevFactor = 0.95;
    else if (conditions.elevation === 'downhill') elevFactor = 1.05;

    const sampleSize = nearby.length;
    const confidence: 'low' | 'medium' | 'high' =
      sampleSize < 3 ? 'low' : sampleSize < 10 ? 'medium' : 'high';

    // Confidence multiplier to favor clubs with more data
    const confidenceMultiplier = Math.min(1, sampleSize / 10);

    // Composite score combining distance accuracy, result quality, and confidence
    const compositeScore =
      (distanceAccuracy * 0.4 + (avgQualityScore / 4) * 0.4 + confidenceMultiplier * 0.2) *
      windFactor *
      elevFactor;

    results.push({
      club,
      avgDistance: Math.round(avgDistance),
      avgQualityScore: Math.round(avgQualityScore * 10) / 10,
      sampleSize,
      confidence,
      compositeScore: Math.round(compositeScore * 100) / 100,
    });
  }

  return results.sort((a, b) => b.compositeScore - a.compositeScore);
}
