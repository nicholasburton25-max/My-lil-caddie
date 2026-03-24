import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ClubDistance {
  club: string;
  avgDistance: number;
}

export default function ClubDistanceChart({ data }: { data: ClubDistance[] }) {
  if (data.length === 0) return <p className="text-white/20 text-sm text-center py-4">No data yet</p>;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <XAxis type="number" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} unit=" yd" stroke="rgba(255,255,255,0.1)" />
          <YAxis type="category" dataKey="club" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} width={50} stroke="rgba(255,255,255,0.1)" />
          <Tooltip
            formatter={(value) => [`${value} yds`, 'Avg Distance']}
            contentStyle={{
              background: 'rgba(10,10,10,0.9)',
              border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: '8px',
              color: '#e0e0e0',
            }}
          />
          <Bar dataKey="avgDistance" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? '#00FF88' : '#009A4E'} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
