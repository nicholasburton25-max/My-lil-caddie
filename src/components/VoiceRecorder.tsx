import { useState, useEffect, useCallback } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import {
  parseCourseName,
  parseHoleNumber,
  parseClub,
  parseShotDetails,
  parseWind,
  parseElevation,
  parseResult,
  summarizeParsed,
} from '../lib/voiceParser';
import type { ParsedShotData } from '../lib/voiceParser';

interface VoiceRecorderProps {
  onApply: (data: ParsedShotData) => void;
  onClose: () => void;
  initialCourseName?: string;
  initialHole?: number;
}

interface VoiceStep {
  key: string;
  label: string;
  prompt: string;
  example: string;
  icon: string;
}

const STEPS: VoiceStep[] = [
  { key: 'course', label: 'Course', prompt: 'What course are you playing?', example: '"Pebble Beach" or "City Park"', icon: '⛳' },
  { key: 'hole', label: 'Hole', prompt: 'What hole number?', example: '"Hole 7" or just "seven"', icon: '#' },
  { key: 'club', label: 'Club', prompt: 'What club did you hit?', example: '"7 iron", "driver", "pitching wedge"', icon: '🏌' },
  { key: 'details', label: 'Shot', prompt: 'Distance, lie, and shape?', example: '"150 yards, fairway, fade"', icon: '📏' },
  { key: 'wind', label: 'Wind', prompt: 'How was the wind?', example: '"Light wind from the north" or "calm"', icon: '💨' },
  { key: 'elevation', label: 'Elev.', prompt: 'Elevation?', example: '"Uphill", "downhill", or "flat"', icon: '⛰' },
  { key: 'result', label: 'Result', prompt: 'How did it go?', example: '"Good shot, par, 2 putts"', icon: '🎯' },
];

export default function VoiceRecorder({ onApply, onClose, initialCourseName, initialHole }: VoiceRecorderProps) {
  const { isListening, transcript, interimTranscript, error, isSupported, startListening, stopListening, resetTranscript } = useVoiceInput();

  const [stepIndex, setStepIndex] = useState(0);
  const [collected, setCollected] = useState<ParsedShotData>({});
  const [stepAnswers, setStepAnswers] = useState<Record<string, string>>({});
  const [stepConfirmed, setStepConfirmed] = useState<Record<string, boolean>>({});
  const [waitingForConfirm, setWaitingForConfirm] = useState(false);

  // Skip course/hole if already provided
  useEffect(() => {
    let skip = 0;
    const initial: ParsedShotData = {};
    const answers: Record<string, string> = {};
    const confirmed: Record<string, boolean> = {};

    if (initialCourseName) {
      initial.courseName = initialCourseName;
      answers['course'] = initialCourseName;
      confirmed['course'] = true;
      skip = 1;
    }
    if (initialHole && initialHole > 0) {
      initial.holeNumber = initialHole;
      answers['hole'] = `Hole ${initialHole}`;
      confirmed['hole'] = true;
      if (skip === 1) skip = 2;
    }

    if (skip > 0) {
      setCollected(initial);
      setStepAnswers(answers);
      setStepConfirmed(confirmed);
      setStepIndex(skip);
    }
  }, [initialCourseName, initialHole]);

  const currentStep = STEPS[stepIndex];
  const isReview = stepIndex >= STEPS.length;

  // When transcript finalizes, parse for current step
  useEffect(() => {
    if (!transcript || isReview) return;

    const step = STEPS[stepIndex];
    let parsed: Partial<ParsedShotData> = {};
    let display = transcript;

    switch (step.key) {
      case 'course': {
        const name = parseCourseName(transcript);
        if (name) {
          parsed = { courseName: name };
          display = name;
        }
        break;
      }
      case 'hole': {
        const hole = parseHoleNumber(transcript);
        if (hole) {
          parsed = { holeNumber: hole };
          display = `Hole ${hole}`;
        }
        break;
      }
      case 'club': {
        const club = parseClub(transcript);
        if (club) {
          parsed = { club };
          display = club;
        }
        break;
      }
      case 'details': {
        const details = parseShotDetails(transcript);
        parsed = details;
        const parts: string[] = [];
        if (details.distance) parts.push(`${details.distance} yds`);
        if (details.lie) parts.push(details.lie);
        if (details.shotShape) parts.push(details.shotShape);
        if (parts.length > 0) display = parts.join(', ');
        break;
      }
      case 'wind': {
        const wind = parseWind(transcript);
        parsed = { windSpeed: wind.windSpeed, windDirection: wind.windDirection };
        const parts: string[] = [];
        if (wind.windSpeed) parts.push(wind.windSpeed);
        if (wind.windDirection) parts.push(wind.windDirection);
        if (parts.length > 0) display = parts.join(' from ');
        break;
      }
      case 'elevation': {
        const elev = parseElevation(transcript);
        if (elev) {
          parsed = { elevation: elev };
          display = elev;
        }
        break;
      }
      case 'result': {
        const result = parseResult(transcript);
        parsed = result;
        const parts: string[] = [];
        if (result.resultQuality) parts.push(result.resultQuality);
        if (result.scoreOnHole) parts.push(`score: ${result.scoreOnHole}`);
        if (result.putts !== undefined) parts.push(`${result.putts} putts`);
        if (parts.length > 0) display = parts.join(', ');
        break;
      }
    }

    const hasData = Object.values(parsed).some(v => v !== undefined);
    if (hasData) {
      setCollected(prev => ({ ...prev, ...parsed }));
      setStepAnswers(prev => ({ ...prev, [step.key]: display }));
      setWaitingForConfirm(true);
    } else {
      // Couldn't parse — store raw text for potential use
      setStepAnswers(prev => ({ ...prev, [step.key]: transcript }));
      setWaitingForConfirm(true);
    }
  }, [transcript, stepIndex, isReview]);

  const confirmStep = useCallback(() => {
    if (!currentStep) return;
    setStepConfirmed(prev => ({ ...prev, [currentStep.key]: true }));
    setWaitingForConfirm(false);
    resetTranscript();
    setStepIndex(prev => prev + 1);
  }, [currentStep, resetTranscript]);

  const retryStep = useCallback(() => {
    if (!currentStep) return;
    // Clear this step's data
    setStepAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentStep.key];
      return copy;
    });
    setWaitingForConfirm(false);
    resetTranscript();
  }, [currentStep, resetTranscript]);

  const skipStep = useCallback(() => {
    if (!currentStep) return;
    setWaitingForConfirm(false);
    resetTranscript();
    setStepIndex(prev => prev + 1);
  }, [currentStep, resetTranscript]);

  const goToStep = useCallback((idx: number) => {
    setStepIndex(idx);
    setWaitingForConfirm(false);
    resetTranscript();
  }, [resetTranscript]);

  const handleFinish = () => {
    onApply(collected);
    onClose();
  };

  const summaryItems = summarizeParsed(collected);

  if (!isSupported) {
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <div className="glass-card p-6 max-w-sm w-full text-center space-y-4">
          <p className="text-white/60 text-sm">Voice input is not supported in this browser. Try using Chrome or Safari.</p>
          <button onClick={onClose} className="w-full py-3 rounded-xl option-btn border font-bold text-sm">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="glass-card p-5 max-w-sm w-full space-y-4 neon-glow mb-4 sm:mb-0" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        {/* Header with close */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-neon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            Voice Caddie
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step progress dots */}
        <div className="flex items-center justify-center gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => stepConfirmed[s.key] ? goToStep(i) : undefined}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                i === stepIndex && !isReview
                  ? 'ring-2 ring-neon scale-110'
                  : ''
              }`}
              style={{
                background: stepConfirmed[s.key]
                  ? 'rgba(0,255,136,0.2)'
                  : i === stepIndex && !isReview
                    ? 'rgba(0,255,136,0.1)'
                    : 'rgba(255,255,255,0.05)',
                border: stepConfirmed[s.key]
                  ? '1px solid rgba(0,255,136,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
                color: stepConfirmed[s.key]
                  ? 'rgba(0,255,136,0.8)'
                  : i === stepIndex && !isReview
                    ? 'rgba(255,255,255,0.6)'
                    : 'rgba(255,255,255,0.2)',
                cursor: stepConfirmed[s.key] ? 'pointer' : 'default',
              }}
            >
              {stepConfirmed[s.key] ? '✓' : s.icon}
            </button>
          ))}
        </div>

        {/* Review screen */}
        {isReview ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-black text-neon mb-1">All done!</div>
              <div className="text-[11px] text-white/30">Review your shot and save</div>
            </div>

            {/* Summary */}
            <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.1)' }}>
              {summaryItems.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {summaryItems.map((item, i) => (
                    <span key={i} className="text-[11px] px-2 py-1 rounded-md font-semibold"
                      style={{
                        background: 'rgba(0,255,136,0.1)',
                        border: '1px solid rgba(0,255,136,0.2)',
                        color: 'rgba(0,255,136,0.7)',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-xs text-center">No data recorded</p>
              )}
            </div>

            {/* Edit any step */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => goToStep(i)}
                  className="text-[10px] px-2 py-1 rounded font-semibold transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.3)',
                  }}
                >
                  Re-do {s.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl option-btn border font-bold text-sm">
                Cancel
              </button>
              <button onClick={handleFinish} className="flex-1 py-3 rounded-xl btn-game text-sm">
                Save Shot
              </button>
            </div>
          </div>
        ) : (
          /* Active step */
          <div className="space-y-4">
            {/* Step question */}
            <div className="text-center space-y-1">
              <div className="text-white font-black text-base">{currentStep.prompt}</div>
              <div className="text-[11px] text-white/25">{currentStep.example}</div>
            </div>

            {/* Mic button */}
            <div className="flex justify-center py-1">
              {isListening ? (
                <button
                  onClick={stopListening}
                  className="relative w-18 h-18 rounded-full flex items-center justify-center transition-all"
                  style={{
                    width: '72px', height: '72px',
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1))',
                    border: '2px solid rgba(239,68,68,0.5)',
                    boxShadow: '0 0 20px rgba(239,68,68,0.3), 0 0 40px rgba(239,68,68,0.1)',
                  }}
                >
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ border: '2px solid #ef4444' }} />
                  <svg className="w-7 h-7 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => { resetTranscript(); startListening(); }}
                  className="relative rounded-full flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    width: '72px', height: '72px',
                    background: waitingForConfirm
                      ? 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))'
                      : 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,154,78,0.1))',
                    border: waitingForConfirm
                      ? '2px solid rgba(234,179,8,0.3)'
                      : '2px solid rgba(0,255,136,0.4)',
                    boxShadow: waitingForConfirm
                      ? '0 0 20px rgba(234,179,8,0.15)'
                      : '0 0 20px rgba(0,255,136,0.2), 0 0 40px rgba(0,255,136,0.05)',
                  }}
                >
                  <svg className={`w-7 h-7 ${waitingForConfirm ? 'text-yellow-400' : 'text-neon'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Listening / status */}
            <div className="text-center text-xs font-bold uppercase tracking-wider">
              {isListening ? (
                <span className="text-red-400 animate-pulse">Listening...</span>
              ) : waitingForConfirm ? (
                <span className="text-yellow-400/60">Is this right?</span>
              ) : (
                <span className="text-white/20">Tap mic to speak</span>
              )}
            </div>

            {/* Transcript / answer display */}
            {(transcript || interimTranscript) && (
              <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[10px] text-white/20 uppercase tracking-wider font-bold mb-1">You said:</div>
                <div className="text-sm text-white/70">
                  {transcript}
                  {interimTranscript && <span className="text-white/30 italic">{interimTranscript}</span>}
                </div>
              </div>
            )}

            {/* Parsed answer badge */}
            {waitingForConfirm && stepAnswers[currentStep.key] && (
              <div className="rounded-lg p-3" style={{ background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.1)' }}>
                <div className="text-[10px] text-neon/40 uppercase tracking-wider font-bold mb-1">Detected:</div>
                <div className="text-sm font-semibold" style={{ color: 'rgba(0,255,136,0.7)' }}>
                  {stepAnswers[currentStep.key]}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* Confirm / Retry / Skip buttons */}
            {waitingForConfirm ? (
              <div className="flex gap-2">
                <button onClick={retryStep} className="flex-1 py-2.5 rounded-xl option-btn border font-bold text-xs">
                  Retry
                </button>
                <button onClick={confirmStep} className="flex-1 py-2.5 rounded-xl btn-game text-xs">
                  Confirm
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={skipStep} className="flex-1 py-2.5 rounded-xl option-btn border font-bold text-xs text-white/30">
                  Skip
                </button>
              </div>
            )}

            {/* Step counter */}
            <div className="text-center text-[10px] text-white/15 font-bold uppercase tracking-wider">
              Step {stepIndex + 1} of {STEPS.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
