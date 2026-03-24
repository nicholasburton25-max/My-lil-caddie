import type { Club } from '../types/shot';

interface ClubBagProps {
  selected: Club;
  onSelect: (club: Club) => void;
  clubs: Club[];
}

const CLUB_STYLES: Record<string, { label: string }> = {
  'Driver':  { label: 'DR' },
  '3W':      { label: '3W' },
  '5W':      { label: '5W' },
  '7W':      { label: '7W' },
  '3H':      { label: '3H' },
  '4H':      { label: '4H' },
  '5H':      { label: '5H' },
  '6H':      { label: '6H' },
  '2i':      { label: '2i' },
  '3i':      { label: '3i' },
  '4i':      { label: '4i' },
  '5i':      { label: '5i' },
  '6i':      { label: '6i' },
  '7i':      { label: '7i' },
  '8i':      { label: '8i' },
  '9i':      { label: '9i' },
  'PW':      { label: 'PW' },
  'GW':      { label: 'GW' },
  'SW':      { label: 'SW' },
  'LW':      { label: 'LW' },
  'Putter':  { label: 'PT' },
};

const CLUB_GROUPS = [
  { label: 'Woods', filter: (c: Club) => c.endsWith('W') || c === 'Driver' },
  { label: 'Hybrids', filter: (c: Club) => c.endsWith('H') },
  { label: 'Irons', filter: (c: Club) => c.endsWith('i') },
  { label: 'Wedges', filter: (c: Club) => ['PW', 'GW', 'SW', 'LW'].includes(c) },
  { label: 'Putter', filter: (c: Club) => c === 'Putter' },
];

function getClubHeight(club: Club): number {
  if (club === 'Driver') return 56;
  if (club.endsWith('W') && !['PW','GW','SW','LW'].includes(club)) return 48;
  if (club.endsWith('H')) return 44;
  if (['PW','GW','SW','LW'].includes(club)) return 36;
  if (club === 'Putter') return 32;
  return Math.max(30, 44 - (parseInt(club) || 5) * 1.5);
}

function getHeadSize(club: Club): { w: number; h: number } {
  if (club === 'Driver') return { w: 22, h: 22 };
  if (club.endsWith('W') && !['PW','GW','SW','LW'].includes(club)) return { w: 18, h: 16 };
  if (club.endsWith('H')) return { w: 16, h: 13 };
  if (['PW','GW','SW','LW'].includes(club)) return { w: 13, h: 11 };
  if (club === 'Putter') return { w: 18, h: 6 };
  return { w: 11, h: 9 };
}

export default function ClubBag({ selected, onSelect, clubs }: ClubBagProps) {
  return (
    <div className="space-y-4">
      {CLUB_GROUPS.map(group => {
        const groupClubs = clubs.filter(group.filter);
        if (groupClubs.length === 0) return null;

        return (
          <div key={group.label}>
            <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] mb-2 font-bold">{group.label}</div>
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {groupClubs.map(club => {
                const style = CLUB_STYLES[club] ?? CLUB_STYLES['7i'];
                const isSelected = selected === club;
                const shaftHeight = getClubHeight(club);
                const head = getHeadSize(club);

                return (
                  <button
                    key={club}
                    type="button"
                    onClick={() => onSelect(club)}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 min-w-[48px] border ${
                      isSelected
                        ? 'option-btn-active neon-glow scale-105'
                        : 'option-btn'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-end" style={{ height: `${shaftHeight + head.h + 4}px` }}>
                      {/* Club head */}
                      <div
                        className="mb-0.5"
                        style={{
                          width: `${head.w}px`,
                          height: `${head.h}px`,
                          backgroundColor: isSelected ? '#00FF88' : 'rgba(255,255,255,0.15)',
                          borderRadius: club === 'Driver' || (club.endsWith('W') && !['PW','GW','SW','LW'].includes(club))
                            ? '50%'
                            : club.endsWith('H')
                              ? '6px'
                              : club === 'Putter'
                                ? '2px'
                                : '3px',
                          boxShadow: isSelected ? '0 0 8px rgba(0,255,136,0.4)' : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      />
                      {/* Shaft */}
                      <div
                        className="rounded-full"
                        style={{
                          width: '2px',
                          height: `${shaftHeight}px`,
                          backgroundColor: isSelected ? 'rgba(0,255,136,0.6)' : 'rgba(255,255,255,0.12)',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>
                    <span className={`text-[10px] font-black tracking-wider ${isSelected ? 'text-neon' : 'text-white/30'}`}>
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
