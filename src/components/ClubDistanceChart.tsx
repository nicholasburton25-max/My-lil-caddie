import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ClubDistance {
  club: string;
  avgDistance: number;
}

export default function ClubDistanceChart({ data }: { data: ClubDistance[] }) {
  if (data.length === 0) return <p className="text-gray-400 text-sm text-center py-4">No data yet</p>;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <XAxis type="number" tick={{ fontSize: 12 }} unit=" yd" />
          <YAxis type="category" dataKey="club" tick={{ fontSize: 12 }} width={50} />
          <Tooltip formatter={(value) => [`${value} yds`, 'Avg Distance']} />
          <Bar dataKey="avgDistance" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? '#2E7D32' : '#43A047'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
