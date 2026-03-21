import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useShots } from '../hooks/useShots';
import { avgDistanceByClub, resultDistribution, mostUsedClub, bestResultClub, totalRounds } from '../lib/stats';
import StatCard from '../components/StatCard';
import ClubDistanceChart from '../components/ClubDistanceChart';

const PIE_COLORS = ['#2E7D32', '#4CAF50', '#FFC107', '#EF5350'];

export default function Dashboard() {
  const { shots } = useShots();

  const distByClub = useMemo(() => avgDistanceByClub(shots), [shots]);
  const resultDist = useMemo(() => resultDistribution(shots), [shots]);
  const topClub = useMemo(() => mostUsedClub(shots), [shots]);
  const bestClub = useMemo(() => bestResultClub(shots), [shots]);
  const rounds = useMemo(() => totalRounds(shots), [shots]);

  if (shots.length === 0) {
    return (
      <div className="p-4 max-w-lg mx-auto text-center text-gray-400 py-20">
        <p className="text-lg">No stats yet</p>
        <p className="text-sm mt-1">Record some shots to see your stats!</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <h2 className="text-lg font-bold text-gray-800">Your Stats</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Shots" value={shots.length} />
        <StatCard label="Rounds" value={rounds} />
        <StatCard label="Most Used" value={topClub} />
        <StatCard label="Best Results" value={bestClub} />
      </div>

      {/* Average Distance Chart */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Average Distance by Club</h3>
        <ClubDistanceChart data={distByClub} />
      </div>

      {/* Result Distribution */}
      {resultDist.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Shot Quality</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resultDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {resultDist.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Export */}
      <button
        onClick={() => {
          const blob = new Blob([JSON.stringify(shots, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `my-lil-caddie-export-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        className="w-full py-3 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
      >
        Export Data as JSON
      </button>
    </div>
  );
}
