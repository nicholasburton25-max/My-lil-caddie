interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  className?: string;
}

export default function SelectField({ label, value, onChange, options, className = '' }: SelectFieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg input-game text-sm appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%2300FF88' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1em',
          paddingRight: '2rem',
        }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
