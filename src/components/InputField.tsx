interface InputFieldProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
  list?: string;
}

export default function InputField({ label, type = 'text', value, onChange, placeholder, min, max, className = '', list }: InputFieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        list={list}
        className="w-full px-3 py-2.5 rounded-lg input-game text-sm"
      />
    </div>
  );
}
