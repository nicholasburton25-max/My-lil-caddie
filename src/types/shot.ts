export type Club =
  | 'Driver' | '3W' | '5W' | '7W'
  | '2i' | '3i' | '4i' | '5i' | '6i' | '7i' | '8i' | '9i'
  | 'PW' | 'GW' | 'SW' | 'LW'
  | 'Putter';

export type LieType = 'tee' | 'fairway' | 'rough' | 'sand' | 'fringe' | 'green' | 'other';
export type WindSpeed = 'calm' | 'light' | 'moderate' | 'strong';
export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'none';
export type ElevationType = 'uphill' | 'downhill' | 'flat';
export type ShotShape = 'straight' | 'draw' | 'fade' | 'hook' | 'slice' | 'push' | 'pull';
export type ResultQuality = 'great' | 'good' | 'ok' | 'poor';

export interface Shot {
  id: string;
  timestamp: string;
  courseName: string;
  holeNumber: number;
  scoreOnHole: number | null;
  club: Club;
  distanceYards: number;
  lie: LieType;
  wind: { speed: WindSpeed; direction: WindDirection };
  elevation: ElevationType;
  shotShape: ShotShape;
  resultQuality: ResultQuality;
  notes: string;
  gpsLocation: { lat: number; lng: number } | null;
}
