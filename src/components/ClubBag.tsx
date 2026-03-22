import type { Club } from '../types/shot';

interface ClubBagProps {
  selected: Club;
  onSelect: (club: Club) => void;
  clubs: Club[];
}

// Club visual properties
const CLUB_STYLES: Record<string, { height: string; headSize: string; headShape: string; color: string; label: string }> = {
  'Driver':  { height: 'h-24', headSize: 'w-7 h-7', headShape: 'rounded-full', color: '#1a1a1a', label: 'DR' },
  '3W':      { height: 'h-[88px]', headSize: 'w-6 h-5', headShape: 'rounded-full', color: '#2a2a2a', label: '3W' },
  '5W':      { height: 'h-[84px]', headSize: 'w-5.5 h-5', headShape: 'rounded-full', color: '#2a2a2a', label: '5W' },
  '7W':      { height: 'h-20', headSize: 'w-5 h-4.5', headShape: 'rounded-full', color: '#2a2a2a', label: '7W' },
  '3H':      { height: 'h-[82px]', headSize: 'w-5 h-4', headShape: 'rounded-lg', color: '#3a3a3a', label: '3H' },
  '4H':      { height: 'h-20', headSize: 'w-5 h-4', headShape: 'rounded-lg', color: '#3a3a3a', label: '4H' },
  '5H':      { height: 'h-[78px]', headSize: 'w-5 h-4', headShape: 'rounded-lg', color: '#3a3a3a', label: '5H' },
  '6H':      { height: 'h-[76px]', headSize: 'w-5 h-3.5', headShape: 'rounded-lg', color: '#3a3a3a', label: '6H' },
  '2i':      { height: 'h-[82px]', headSize: 'w-4 h-3', headShape: 'rounded-sm', color: '#555', label: '2i' },
  '3i':      { height: 'h-20', headSize: 'w-4 h-3', headShape: 'rounded-sm', color: '#555', label: '3i' },
  '4i':      { height: 'h-[78px]', headSize: 'w-4 h-3', headShape: 'rounded-sm', color: '#555', label: '4i' },
  '5i':      { height: 'h-[76px]', headSize: 'w-3.5 h-3', headShape: 'rounded-sm', color: '#555', label: '5i' },
  '6i':      { height: 'h-[74px]', headSize: 'w-3.5 h-3', headShape: 'rounded-sm', color: '#555', label: '6i' },
  '7i':      { height: 'h-[72px]', headSize: 'w-3.5 h-2.5', headShape: 'rounded-sm', color: '#555', label: '7i' },
  '8i':      { height: 'h-[70px]', headSize: 'w-3 h-2.5', headShape: 'rounded-sm', color: '#555', label: '8i' },
  '9i':      { height: 'h-[68px]', headSize: 'w-3 h-2.5', headShape: 'rounded-sm', color: '#555', label: '9i' },
  'PW':      { height: 'h-[66px]', headSize: 'w-3.5 h-3', headShape: 'rounded-md', color: '#666', label: 'PW' },
  'GW':      { height: 'h-16', headSize: 'w-3.5 h-3', headShape: 'rounded-md', color: '#666', label: 'GW' },
  'SW':      { height: 'h-[62px]', headSize: 'w-4 h-3.5', headShape: 'rounded-md', color: '#666', label: 'SW' },
  'LW':      { height: 'h-[60px]', headSize: 'w-4 h-3.5', headShape: 'rounded-md', color: '#666', label: 'LW' },
  'Putter':  { height: 'h-[58px]', headSize: 'w-5 h-2', headShape: 'rounded-sm', color: '#444', label: 'PT' },
};

// Group clubs by category
const CLUB_GROUPS = [
  { label: 'Woods', filter: (c: Club) => c.endsWith('W') || c === 'Driver' },
  { label: 'Hybrids', filter: (c: Club) => c.endsWith('H') },
  { label: 'Irons', filter: (c: Club) => c.endsWith('i') },
  { label: 'Wedges', filter: (c: Club) => ['PW', 'GW', 'SW', 'LW'].includes(c) },
  { label: 'Putter', filter: (c: Club) => c === 'Putter' },
];

export default function ClubBag({ selected, onSelect, clubs }: ClubBagProps) {
  return (
    <div className="space-y-4">
      {CLUB_GROUPS.map(group => {
        const groupClubs = clubs.filter(group.filter);
        if (groupClubs.length === 0) return null;

        return (
          <div key={group.label}>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">{group.label}</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {groupClubs.map(club => {
                const style = CLUB_STYLES[club] ?? CLUB_STYLES['7i'];
                const isSelected = selected === club;

                return (
                  <button
                    key={club}
                    type="button"
                    onClick={() => onSelect(club)}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all min-w-[52px] ${
                      isSelected
                        ? 'bg-golf-800 ring-2 ring-golf-500 shadow-lg scale-105'
                        : 'bg-dark-800 hover:bg-dark-700'
                    }`}
                  >
                    {/* Club visual */}
                    <div className={`flex flex-col items-center justify-end ${style.height}`}>
                      {/* Club head */}
                      <div
                        className={`${style.headShape} mb-0.5`}
                        style={{
                          backgroundColor: isSelected ? '#009A4E' : style.color,
                          width: club === 'Driver' ? '28px'
                            : club.endsWith('W') && club !== 'PW' && club !== 'GW' && club !== 'SW' && club !== 'LW' ? '22px'
                            : club.endsWith('H') ? '20px'
                            : ['PW', 'GW', 'SW', 'LW'].includes(club) ? '16px'
                            : club === 'Putter' ? '22px'
                            : '14px',
                          height: club === 'Driver' ? '28px'
                            : club.endsWith('W') && club !== 'PW' && club !== 'GW' && club !== 'SW' && club !== 'LW' ? '20px'
                            : club.endsWith('H') ? '16px'
                            : ['PW', 'GW', 'SW', 'LW'].includes(club) ? '14px'
                            : club === 'Putter' ? '8px'
                            : '12px',
                        }}
                      />
                      {/* Shaft */}
                      <div
                        className="w-0.5 rounded-full"
                        style={{
                          backgroundColor: isSelected ? '#33B370' : '#888',
                          height: club === 'Driver' ? '52px'
                            : club.endsWith('W') && club !== 'PW' && club !== 'GW' && club !== 'SW' && club !== 'LW' ? '46px'
                            : club.endsWith('H') ? '42px'
                            : ['PW', 'GW', 'SW', 'LW'].includes(club) ? '34px'
                            : club === 'Putter' ? '30px'
                            : `${40 - (parseInt(club) || 5) * 1.5}px`,
                        }}
                      />
                    </div>
                    {/* Label */}
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                      {style.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
