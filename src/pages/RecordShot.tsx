import { useState, useCallback } from 'react';
import type { Shot, Club, LieType, WindSpeed, WindDirection, ElevationType, ShotShape, ResultQuality } from '../types/shot';
import { CLUBS, LIES, WIND_SPEEDS, WIND_DIRECTIONS, ELEVATIONS, SHOT_SHAPES, RESULT_QUALITIES } from '../data/constants';
import { useShots } from '../hooks/useShots';
import { useGeolocation } from '../hooks/useGeolocation';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import ClubBag from '../components/ClubBag';
import ShotTracer from '../components/ShotTracer';
import GolfBallAnimation from '../components/GolfBallAnimation';
import VoiceRecorder from '../components/VoiceRecorder';
import type { ParsedShotData } from '../lib/voiceParser';

const LAST_CONTEXT_KEY = 'mlc_last_context';

const QUALITY_COLORS: Record<string, string> = {
  great: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
  good: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  ok: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  poor: 'bg-red-500/20 border-red-500/50 text-red-400',
};

function ButtonGroup<T extends string>({ label, options, value, onChange, colorMap }: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  colorMap?: Record<string, string>;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const isActive = value === opt;
          const hasCustomColor = colorMap && isActive;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold min-h-[40px] transition-all duration-150 border ${
                hasCustomColor
                  ? colorMap[opt]
                  : isActive
                    ? 'option-btn-active'
                    : 'option-btn'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function RecordShot() {
  const { addShot } = useShots();
  const { location, loading: gpsLoading, error: gpsError, requestLocation, clearLocation } = useGeolocation();
  const [showAnimation, setShowAnimation] = useState(false);
  const [lastSavedQuality, setLastSavedQuality] = useState<ResultQuality>('good');
  const [showVoice, setShowVoice] = useState(false);

  const lastContext = (() => {
    try {
      const raw = localStorage.getItem(LAST_CONTEXT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const [courseName, setCourseName] = useState(lastContext?.courseName ?? '');
  const [holeNumber, setHoleNumber] = useState(lastContext?.holeNumber?.toString() ?? '1');
  const [scoreOnHole, setScoreOnHole] = useState('');
  const [club, setClub] = useState<Club>('7i');
  const [distance, setDistance] = useState('');
  const [lie, setLie] = useState<LieType>('fairway');
  const [windSpeed, setWindSpeed] = useState<WindSpeed>('calm');
  const [windDirection, setWindDirection] = useState<WindDirection>('none');
  const [elevation, setElevation] = useState<ElevationType>('flat');
  const [shotShape, setShotShape] = useState<ShotShape>('straight');
  const [resultQuality, setResultQuality] = useState<ResultQuality>('good');
  const [putts, setPutts] = useState('');
  const [puttDistances, setPuttDistances] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const { shots } = useShots();
  const courseNames = [...new Set(shots.map(s => s.courseName).filter(Boolean))];

  const handleAnimationComplete = useCallback(() => {
    setShowAnimation(false);
  }, []);

  const handleVoiceApply = useCallback((data: ParsedShotData) => {
    if (data.club) setClub(data.club);
    if (data.distance) setDistance(data.distance.toString());
    if (data.lie) setLie(data.lie);
    if (data.windSpeed) setWindSpeed(data.windSpeed);
    if (data.windDirection) setWindDirection(data.windDirection);
    if (data.elevation) setElevation(data.elevation);
    if (data.shotShape) setShotShape(data.shotShape);
    if (data.resultQuality) setResultQuality(data.resultQuality);
    if (data.holeNumber) setHoleNumber(data.holeNumber.toString());
    if (data.scoreOnHole) setScoreOnHole(data.scoreOnHole.toString());
    if (data.putts !== undefined) {
      setPutts(data.putts.toString());
      setPuttDistances(Array(data.putts).fill(''));
    }
  }, []);

  const handleSave = () => {
    if (!club || !distance) return;

    const shot: Shot = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      courseName,
      holeNumber: parseInt(holeNumber) || 1,
      scoreOnHole: scoreOnHole ? parseInt(scoreOnHole) : null,
      club,
      distanceYards: parseInt(distance) || 0,
      lie,
      wind: { speed: windSpeed, direction: windDirection },
      elevation,
      shotShape,
      resultQuality,
      putts: putts ? parseInt(putts) : null,
      puttDistances: puttDistances.map(d => parseInt(d) || 0).filter(d => d > 0),
      notes,
      gpsLocation: location,
    };

    addShot(shot);
    setLastSavedQuality(resultQuality);
    setShowAnimation(true);

    localStorage.setItem(LAST_CONTEXT_KEY, JSON.stringify({
      courseName,
      holeNumber: parseInt(holeNumber) || 1,
    }));

    setScoreOnHole('');
    setClub('7i');
    setDistance('');
    setLie('fairway');
    setWindSpeed('calm');
    setWindDirection('none');
    setElevation('flat');
    setShotShape('straight');
    setResultQuality('good');
    setPutts('');
    setPuttDistances([]);
    setNotes('');
    clearLocation();
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5">
      {showAnimation && <GolfBallAnimation quality={lastSavedQuality} onComplete={handleAnimationComplete} />}
      {showVoice && <VoiceRecorder onApply={handleVoiceApply} onClose={() => setShowVoice(false)} />}

      {/* Voice Input Button */}
      <button
        onClick={() => setShowVoice(true)}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wider transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,154,78,0.05))',
          border: '1px solid rgba(0,255,136,0.2)',
          color: 'rgba(0,255,136,0.7)',
        }}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
        Record with Voice
      </button>

      {/* Round Info */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="section-header">Round Info</h2>
        <InputField label="Course Name" value={courseName} onChange={setCourseName} placeholder="e.g. Pine Valley" list="courses" />
        <datalist id="courses">
          {courseNames.map(c => <option key={c} value={c} />)}
        </datalist>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Hole #" type="number" value={holeNumber} onChange={setHoleNumber} min={1} max={18} />
          <InputField label="Score" type="number" value={scoreOnHole} onChange={setScoreOnHole} min={1} max={15} placeholder="Optional" />
        </div>
      </div>

      {/* Club Selection */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="section-header">Select Club</h2>
        <ClubBag selected={club} onSelect={setClub} clubs={CLUBS} />
      </div>

      {/* Shot Details */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="section-header">Shot Details</h2>
        <InputField label="Distance (yards)" type="number" value={distance} onChange={setDistance} placeholder="e.g. 150" min={0} />
        <ButtonGroup label="Lie" options={LIES} value={lie} onChange={v => setLie(v as LieType)} />
      </div>

      {/* Conditions */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="section-header">Conditions</h2>
        <ButtonGroup label="Wind" options={WIND_SPEEDS} value={windSpeed} onChange={v => setWindSpeed(v as WindSpeed)} />
        <SelectField label="Wind Direction" value={windDirection} onChange={v => setWindDirection(v as WindDirection)} options={WIND_DIRECTIONS} />
        <ButtonGroup label="Elevation" options={ELEVATIONS} value={elevation} onChange={v => setElevation(v as ElevationType)} />
      </div>

      {/* Result */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="section-header">Result</h2>
        <ButtonGroup label="Shot Shape" options={SHOT_SHAPES} value={shotShape} onChange={v => setShotShape(v as ShotShape)} />
        <ButtonGroup
          label="Quality"
          options={RESULT_QUALITIES}
          value={resultQuality}
          onChange={v => setResultQuality(v as ResultQuality)}
          colorMap={QUALITY_COLORS}
        />

        {/* Shot Tracer Preview */}
        {distance && (
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Shot Preview</label>
            <ShotTracer
              shape={shotShape}
              distance={parseInt(distance) || 0}
              quality={resultQuality}
              className="h-48 rounded-xl overflow-hidden neon-glow"
            />
          </div>
        )}
      </div>

      {/* Putting */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="section-header">Putting</h2>
        <InputField label="Number of Putts" type="number" value={putts} onChange={(v) => {
          setPutts(v);
          const count = parseInt(v) || 0;
          setPuttDistances(prev => {
            const newDists = [...prev];
            while (newDists.length < count) newDists.push('');
            return newDists.slice(0, count);
          });
        }} min={0} max={10} placeholder="e.g. 2" />
        {puttDistances.map((dist, i) => (
          <InputField
            key={i}
            label={`Putt ${i + 1} Distance (feet)`}
            type="number"
            value={dist}
            onChange={(v) => {
              const updated = [...puttDistances];
              updated[i] = v;
              setPuttDistances(updated);
            }}
            min={0}
            placeholder="e.g. 15"
          />
        ))}
      </div>

      {/* Notes & GPS */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="section-header">Notes & Location</h2>
        <div>
          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg input-game text-sm resize-none"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={requestLocation}
            disabled={gpsLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg option-btn text-sm min-h-[40px] transition-all"
          >
            <svg className="w-4 h-4 text-neon" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-white/60">
              {gpsLoading ? 'Getting location...' : location ? `Pinned (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Pin Location'}
            </span>
          </button>
          {gpsError && <p className="text-xs text-red-400 mt-1">{gpsError}</p>}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!distance}
        className="w-full py-4 rounded-xl text-base btn-game min-h-[52px] flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="3" fill="currentColor" />
        </svg>
        Save Shot
      </button>
    </div>
  );
}
