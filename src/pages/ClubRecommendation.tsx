import { useState, useMemo } from 'react';
import type { LieType, WindSpeed, ElevationType } from '../types/shot';
import { LIES, WIND_SPEEDS, ELEVATIONS } from '../data/constants';
import { useShots } from '../hooks/useShots';
import { recommendClub } from '../lib/recommendation';
import InputField from '../components/InputField';

const CONFIDENCE_STYLES = {
  low: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-green-100 text-green-700',
};

const QUALITY_LABELS: Record<number, string> = {
  4: 'Great',
  3: 'Good',
  2: 'OK',
  1: 'Poor',
};

function qualityLabel(score: number): string {
  const rounded = Math.round(score);
  return QUALITY_LABELS[rounded] ?? `${score}`;
}

export default function ClubRecommendation() {
  const { shots } = useShots();
  const [distance, setDistance] = useState('');
  const [lie, setLie] = useState<LieType>('fairway');
  const [wind, setWind] = useState<WindSpeed>('calm');
  const [elevation, setElevation] = useState<ElevationType>('flat');

  const recommendations = useMemo(() => {
    if (!distance) return [];
    return recommendClub(
      { distance: parseInt(distance) || 0, lie, wind, elevation },
      shots
    );
  }, [distance, lie, wind, elevation, shots]);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5">
      <h2 className="text-lg font-bold text-gray-800">Club Recommendation</h2>
      <p className="text-sm text-gray-500">Enter your conditions and we'll suggest the best club based on your history.</p>

      <div className="space-y-3">
        <InputField label="Target Distance (yards)" type="number" value={distance} onChange={setDistance} placeholder="e.g. 150" min={0} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lie</label>
          <div className="flex flex-wrap gap-1.5">
            {LIES.map(l => (
              <button
                key={l}
                onClick={() => setLie(l)}
                className={`px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] ${
                  lie === l ? 'bg-golf-800 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wind</label>
          <div className="flex flex-wrap gap-1.5">
            {WIND_SPEEDS.map(w => (
              <button
                key={w}
                onClick={() => setWind(w)}
                className={`px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] ${
                  wind === w ? 'bg-golf-800 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Elevation</label>
          <div className="flex flex-wrap gap-1.5">
            {ELEVATIONS.map(e => (
              <button
                key={e}
                onClick={() => setElevation(e)}
                className={`px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] ${
                  elevation === e ? 'bg-golf-800 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {distance && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recommendations</h3>
          {recommendations.length === 0 ? (
            <div className="text-center text-gray-400 py-8 bg-white rounded-xl">
              <p>No matching data found</p>
              <p className="text-xs mt-1">Log more shots to get recommendations!</p>
            </div>
          ) : (
            recommendations.map((rec, i) => (
              <div key={rec.club} className={`bg-white rounded-xl p-4 shadow-sm ${i === 0 ? 'ring-2 ring-golf-500' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {i === 0 && <span className="text-xs bg-gold text-white px-2 py-0.5 rounded-full font-medium">Best Pick</span>}
                    <span className="text-lg font-bold text-golf-800">{rec.club}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CONFIDENCE_STYLES[rec.confidence]}`}>
                    {rec.confidence} confidence
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                  <div>
                    <div className="text-xs text-gray-400">Avg Distance</div>
                    <div className="font-medium">{rec.avgDistance} yds</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Avg Result</div>
                    <div className="font-medium">{qualityLabel(rec.avgQualityScore)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Shots</div>
                    <div className="font-medium">{rec.sampleSize}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
