export default function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-card p-4 text-center relative overflow-hidden">
      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-8 h-8 opacity-20"
        style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(0,255,136,0.3))' }}
      />
      <div className="text-2xl font-black text-neon neon-text">{value}</div>
      <div className="text-[10px] text-white/40 mt-1 uppercase tracking-wider font-bold">{label}</div>
    </div>
  );
}
