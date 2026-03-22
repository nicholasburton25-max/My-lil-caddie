import { useState } from 'react';
import type { Shot } from '../types/shot';
import { RESULT_QUALITY_COLORS } from '../data/constants';

interface ShotCardProps {
  shot: Shot;
  onDelete: (id: string) => void;
}

export default function ShotCard({ shot, onDelete }: ShotCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const date = new Date(shot.timestamp);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-golf-800">{shot.club}</span>
          <span className="text-sm text-gray-600">{shot.distanceYards} yds</span>
          <span className={`text-xs text-white px-2 py-0.5 rounded-full ${RESULT_QUALITY_COLORS[shot.resultQuality]}`}>
            {shot.resultQuality}
          </span>
        </div>
        <div className="text-xs text-gray-400 text-right">
          <div>{shot.courseName || 'No course'}</div>
          <div>Hole {shot.holeNumber}</div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-3 space-y-2 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="font-medium">Lie:</span> {shot.lie}</div>
            <div><span className="font-medium">Shape:</span> {shot.shotShape}</div>
            <div><span className="font-medium">Wind:</span> {shot.wind.speed} {shot.wind.direction !== 'none' ? shot.wind.direction : ''}</div>
            <div><span className="font-medium">Elevation:</span> {shot.elevation}</div>
            {shot.scoreOnHole && <div><span className="font-medium">Score:</span> {shot.scoreOnHole}</div>}
            {shot.putts != null && <div><span className="font-medium">Putts:</span> {shot.putts}</div>}
            {shot.puttDistances?.length > 0 && (
              <div><span className="font-medium">Putt Distances:</span> {shot.puttDistances.map(d => `${d}ft`).join(', ')}</div>
            )}
            <div><span className="font-medium">Date:</span> {dateStr} {timeStr}</div>
          </div>
          {shot.notes && <div className="text-gray-500 italic">"{shot.notes}"</div>}
          {shot.gpsLocation && (
            <div className="text-xs text-gray-400">
              GPS: {shot.gpsLocation.lat.toFixed(4)}, {shot.gpsLocation.lng.toFixed(4)}
            </div>
          )}
          <div className="pt-2">
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(shot.id)}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Delete shot
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
