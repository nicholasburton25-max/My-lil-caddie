import type { Club, LieType, WindSpeed, WindDirection, ElevationType, ShotShape, ResultQuality } from '../types/shot';

export const CLUBS: Club[] = [
  'Driver', '3W', '5W', '7W',
  '3H', '4H', '5H', '6H',
  '2i', '3i', '4i', '5i', '6i', '7i', '8i', '9i',
  'PW', 'GW', 'SW', 'LW',
  'Putter',
];

export const LIES: LieType[] = ['tee', 'fairway', 'rough', 'sand', 'fringe', 'green', 'other'];
export const WIND_SPEEDS: WindSpeed[] = ['calm', 'light', 'moderate', 'strong'];
export const WIND_DIRECTIONS: WindDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'none'];
export const ELEVATIONS: ElevationType[] = ['uphill', 'downhill', 'flat'];
export const SHOT_SHAPES: ShotShape[] = ['straight', 'draw', 'fade', 'hook', 'slice', 'push', 'pull'];
export const RESULT_QUALITIES: ResultQuality[] = ['great', 'good', 'ok', 'poor'];

export const RESULT_QUALITY_LABELS: Record<ResultQuality, string> = {
  great: 'Great',
  good: 'Good',
  ok: 'OK',
  poor: 'Poor',
};

export const RESULT_QUALITY_COLORS: Record<ResultQuality, string> = {
  great: 'bg-green-500',
  good: 'bg-blue-500',
  ok: 'bg-yellow-500',
  poor: 'bg-red-500',
};
