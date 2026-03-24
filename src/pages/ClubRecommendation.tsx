import { useState, useMemo } from 'react';
import type { LieType, WindSpeed, ElevationType } from '../types/shot';
import { LIES, WIND_SPEEDS, ELEVATIONS } from '../data/constants';
import { useShots } from '../hooks/useShots';
import { recommendClub } from '../lib/recommendation';
import InputField from '../components/InputField';

const CONFIDENCE_STYLES = {
  low: 'bg-red-500/20 text-red-400 border border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  high: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
};

const QUALITY_LABELS: Record<number, string> = {
  4: 'Great', 3: 'Good', 2: 'OK', 1: 'Poor',
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
    return recommendClub({ distance: parseInt(distance) || 0, lie, wind, elevation }, shots);
  }, [distance, lie, wind, elevation, shots]);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-black text-white tracking-wide">Club Caddie</h2>
        <p className="text-xs text-white/30 mt-1">Enter conditions for a recommendation based on your shot history.</p>
      </div>

      <div className="glass-card p-4 space-y-3">
        <h2 className="section-header">Conditions</h2>
        <InputField label="Target Distance (yards)" type="number" value={distance} onChange={setDistance} placeholder="e.g. 150" min={0} />

        <div>
          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Lie</label>
          <div className="flex flex-wrap gap-1.5">
            {LIES.map(l => (
              <button key={l} onClick={() => setLie(l)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold min-h-[40px] border transition-all ${
                  lie === l ? 'option-btn-active' : 'option-btn'
                }`}
              >{l}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Wind</label>
          <div className="flex flex-wrap gap-1.5">
            {WIND_SPEEDS.map(w => (
              <button key={w} onClick={() => setWind(w)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold min-h-[40px] border transition-all ${
                  wind === w ? 'option-btn-active' : 'option-btn'
                }`}
              >{w}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Elevation</label>
          <div className="flex flex-wrap gap-1.5">
            {ELEVATIONS.map(e => (
              <button key={e} onClick={() => setElevation(e)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold min-h-[40px] border transition-all ${
                  elevation === e ? 'option-btn-active' : 'option-btn'
                }`}
              >{e}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {distance && (
        <div className="space-y-3">
          <h3 className="section-header">Recommendations</h3>
          {recommendations.length === 0 ? (
            <div className="glass-card text-center py-8">
              <p className="text-white/30">No matching data found</p>
              <p className="text-white/15 text-xs mt-1">Log more shots to get recommendations!</p>
            </div>
          ) : (
            recommendations.map((rec, i) => (
              <div key={rec.club} className={`glass-card p-4 transition-all ${i === 0 ? 'neon-glow-strong gradient-border' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {i === 0 && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(255,215,0,0.2))',
                          border: '1px solid rgba(0,255,136,0.3)',
                          color: '#00FF88',
                        }}
                      >
                        Best Pick
                      </span>
                    )}
                    <span className={`text-lg font-black ${i === 0 ? 'text-neon neon-text' : 'text-white'}`}>{rec.club}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${CONFIDENCE_STYLES[rec.confidence]}`}>
                    {rec.confidence}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-[10px] text-white/25 uppercase font-bold">Avg Dist</div>
                    <div className="font-bold text-white/70">{rec.avgDistance} yds</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/25 uppercase font-bold">Avg Result</div>
                    <div className="font-bold text-white/70">{qualityLabel(rec.avgQualityScore)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/25 uppercase font-bold">Shots</div>
                    <div className="font-bold text-white/70">{rec.sampleSize}</div>
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
