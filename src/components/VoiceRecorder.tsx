import { useState, useEffect } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { parseVoiceInput, summarizeParsed } from '../lib/voiceParser';
import type { ParsedShotData } from '../lib/voiceParser';

interface VoiceRecorderProps {
  onApply: (data: ParsedShotData) => void;
  onClose: () => void;
}

export default function VoiceRecorder({ onApply, onClose }: VoiceRecorderProps) {
  const { isListening, transcript, interimTranscript, error, isSupported, startListening, stopListening, resetTranscript } = useVoiceInput();
  const [parsed, setParsed] = useState<ParsedShotData>({});
  const [showParsed, setShowParsed] = useState(false);

  // Parse whenever transcript updates
  useEffect(() => {
    if (transcript) {
      const data = parseVoiceInput(transcript);
      setParsed(data);
      setShowParsed(true);
    }
  }, [transcript]);

  const handleApply = () => {
    onApply(parsed);
    onClose();
  };

  const handleRetry = () => {
    resetTranscript();
    setParsed({});
    setShowParsed(false);
    startListening();
  };

  const parsedItems = summarizeParsed(parsed);
  const hasResults = parsedItems.length > 0;
  const displayText = transcript || interimTranscript;

  if (!isSupported) {
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <div className="glass-card p-6 max-w-sm w-full text-center space-y-4">
          <div className="text-3xl">🎤</div>
          <p className="text-white/60 text-sm">Voice input is not supported in this browser. Try using Chrome or Safari.</p>
          <button onClick={onClose} className="w-full py-3 rounded-xl option-btn border font-bold text-sm">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="glass-card p-5 max-w-sm w-full space-y-4 neon-glow mb-4 sm:mb-0" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-neon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            Voice Input
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="text-[11px] text-white/30 leading-relaxed">
          Say something like: <span className="text-neon/50">"7 iron, 150 yards, fairway, straight, good shot"</span>
        </div>

        {/* Mic button */}
        <div className="flex justify-center py-2">
          {isListening ? (
            <button
              onClick={stopListening}
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1))',
                border: '2px solid rgba(239,68,68,0.5)',
                boxShadow: '0 0 20px rgba(239,68,68,0.3), 0 0 40px rgba(239,68,68,0.1)',
              }}
            >
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ border: '2px solid #ef4444' }} />
              <div className="absolute inset-[-8px] rounded-full animate-pulse opacity-10" style={{ border: '2px solid #ef4444' }} />
              <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={showParsed ? handleRetry : startListening}
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,154,78,0.1))',
                border: '2px solid rgba(0,255,136,0.4)',
                boxShadow: '0 0 20px rgba(0,255,136,0.2), 0 0 40px rgba(0,255,136,0.05)',
              }}
            >
              <svg className="w-8 h-8 text-neon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Status */}
        <div className="text-center text-xs font-bold uppercase tracking-wider">
          {isListening ? (
            <span className="text-red-400 animate-pulse">Listening...</span>
          ) : showParsed ? (
            <span className="text-neon/50">Tap mic to try again</span>
          ) : (
            <span className="text-white/20">Tap to start</span>
          )}
        </div>

        {/* Transcript display */}
        {displayText && (
          <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[10px] text-white/20 uppercase tracking-wider font-bold mb-1">You said:</div>
            <div className="text-sm text-white/70">
              {transcript}
              {interimTranscript && <span className="text-white/30 italic">{interimTranscript}</span>}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        {/* Parsed results */}
        {showParsed && (
          <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.1)' }}>
            <div className="text-[10px] text-neon/40 uppercase tracking-wider font-bold">Detected:</div>
            {hasResults ? (
              <div className="flex flex-wrap gap-1.5">
                {parsedItems.map((item, i) => (
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
              <p className="text-white/30 text-xs">No shot data detected. Try being more specific.</p>
            )}
          </div>
        )}

        {/* Actions */}
        {showParsed && hasResults && (
          <div className="flex gap-2">
            <button onClick={handleRetry} className="flex-1 py-3 rounded-xl option-btn border font-bold text-sm">
              Retry
            </button>
            <button onClick={handleApply} className="flex-1 py-3 rounded-xl btn-game text-sm">
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
