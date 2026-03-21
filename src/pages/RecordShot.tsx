import { useState, useEffect } from 'react';
import type { Shot, Club, LieType, WindSpeed, WindDirection, ElevationType, ShotShape, ResultQuality } from '../types/shot';
import { CLUBS, LIES, WIND_SPEEDS, WIND_DIRECTIONS, ELEVATIONS, SHOT_SHAPES, RESULT_QUALITIES, RESULT_QUALITY_COLORS } from '../data/constants';
import { useShots } from '../hooks/useShots';
import { useGeolocation } from '../hooks/useGeolocation';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';

const LAST_CONTEXT_KEY = 'mlc_last_context';

function ButtonGroup<T extends string>({ label, options, value, onChange, colorMap }: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  colorMap?: Record<string, string>;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
              value === opt
                ? colorMap?.[opt]
                  ? `${colorMap[opt]} text-white`
                  : 'bg-golf-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RecordShot() {
  const { addShot } = useShots();
  const { location, loading: gpsLoading, error: gpsError, requestLocation, clearLocation } = useGeolocation();
  const [saved, setSaved] = useState(false);

  // Load last context for smart defaults
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
  const [notes, setNotes] = useState('');

  // Get unique course names for datalist
  const { shots } = useShots();
  const courseNames = [...new Set(shots.map(s => s.courseName).filter(Boolean))];

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

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
      notes,
      gpsLocation: location,
    };

    addShot(shot);

    // Save context for next shot
    localStorage.setItem(LAST_CONTEXT_KEY, JSON.stringify({
      courseName,
      holeNumber: parseInt(holeNumber) || 1,
    }));

    // Reset form but keep context
    setScoreOnHole('');
    setClub('7i');
    setDistance('');
    setLie('fairway');
    setWindSpeed('calm');
    setWindDirection('none');
    setElevation('flat');
    setShotShape('straight');
    setResultQuality('good');
    setNotes('');
    clearLocation();
    setSaved(true);
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5">
      {saved && (
        <div className="bg-golf-100 text-golf-900 px-4 py-2 rounded-lg text-sm font-medium text-center animate-pulse">
          Shot saved!
        </div>
      )}

      {/* Context */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Round Info</h2>
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
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Shot</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
          <div className="grid grid-cols-5 gap-1.5">
            {CLUBS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setClub(c)}
                className={`py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                  club === c ? 'bg-golf-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <InputField label="Distance (yards)" type="number" value={distance} onChange={setDistance} placeholder="e.g. 150" min={0} />
        <ButtonGroup label="Lie" options={LIES} value={lie} onChange={v => setLie(v as LieType)} />
      </div>

      {/* Conditions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Conditions</h2>
        <ButtonGroup label="Wind" options={WIND_SPEEDS} value={windSpeed} onChange={v => setWindSpeed(v as WindSpeed)} />
        <SelectField label="Wind Direction" value={windDirection} onChange={v => setWindDirection(v as WindDirection)} options={WIND_DIRECTIONS} />
        <ButtonGroup label="Elevation" options={ELEVATIONS} value={elevation} onChange={v => setElevation(v as ElevationType)} />
      </div>

      {/* Result */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Result</h2>
        <ButtonGroup label="Shot Shape" options={SHOT_SHAPES} value={shotShape} onChange={v => setShotShape(v as ShotShape)} />
        <ButtonGroup
          label="Quality"
          options={RESULT_QUALITIES}
          value={resultQuality}
          onChange={v => setResultQuality(v as ResultQuality)}
          colorMap={RESULT_QUALITY_COLORS}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent resize-none"
          />
        </div>

        {/* GPS */}
        <div>
          <button
            type="button"
            onClick={requestLocation}
            disabled={gpsLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {gpsLoading ? 'Getting location...' : location ? `Location saved (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Pin Location'}
          </button>
          {gpsError && <p className="text-xs text-red-400 mt-1">{gpsError}</p>}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!distance}
        className="w-full py-3.5 bg-golf-800 text-white font-semibold rounded-xl text-base hover:bg-golf-900 disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[48px] transition-colors"
      >
        Save Shot
      </button>
    </div>
  );
}
