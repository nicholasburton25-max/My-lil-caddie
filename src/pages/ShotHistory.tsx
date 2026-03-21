import { useState, useMemo } from 'react';
import { useShots } from '../hooks/useShots';
import ShotCard from '../components/ShotCard';
import SelectField from '../components/SelectField';
import { CLUBS, LIES, RESULT_QUALITIES } from '../data/constants';

export default function ShotHistory() {
  const { shots, deleteShot } = useShots();
  const [clubFilter, setClubFilter] = useState('all');
  const [lieFilter, setLieFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const courseNames = useMemo(() => [...new Set(shots.map(s => s.courseName).filter(Boolean))], [shots]);

  const filtered = useMemo(() => {
    let result = [...shots];
    if (clubFilter !== 'all') result = result.filter(s => s.club === clubFilter);
    if (lieFilter !== 'all') result = result.filter(s => s.lie === lieFilter);
    if (resultFilter !== 'all') result = result.filter(s => s.resultQuality === resultFilter);
    if (courseFilter) result = result.filter(s => s.courseName.toLowerCase().includes(courseFilter.toLowerCase()));
    result.sort((a, b) => sortOrder === 'newest'
      ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    return result;
  }, [shots, clubFilter, lieFilter, resultFilter, courseFilter, sortOrder]);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Shot History</h2>
        <span className="text-sm text-gray-400">{filtered.length} shot{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <SelectField label="Club" value={clubFilter} onChange={setClubFilter} options={['all', ...CLUBS]} />
          <SelectField label="Lie" value={lieFilter} onChange={setLieFilter} options={['all', ...LIES]} />
          <SelectField label="Result" value={resultFilter} onChange={setResultFilter} options={['all', ...RESULT_QUALITIES]} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              placeholder="Search course..."
              list="hist-courses"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-golf-500"
            />
            <datalist id="hist-courses">
              {courseNames.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <button
            onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 min-h-[44px]"
          >
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {/* Shots */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-lg">No shots found</p>
          <p className="text-sm mt-1">Record your first shot to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(shot => (
            <ShotCard key={shot.id} shot={shot} onDelete={deleteShot} />
          ))}
        </div>
      )}
    </div>
  );
}
