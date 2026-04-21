import { User } from '../../types';

const PALETTE = ['#FFD2B3', '#F5CD69', '#A7D49B', '#66B1B0', '#C4B7E8', '#E892A7', '#F88C85', '#98CBE9'];
const FG_PALETTE = ['#8B4B1A', '#8B6914', '#2D6B2A', '#1A5E5D', '#5B4A8B', '#8A2A3A', '#7A2A20', '#1A4E6B'];

function colorForId(id: string) {
  const h = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return { bg: PALETTE[h % PALETTE.length] + '55', fg: FG_PALETTE[h % FG_PALETTE.length] };
}

function firstName(name: string) {
  return name.split(' ')[0];
}

function nextBirthday(birthdate: string): { days: number; date: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [, month, day] = birthdate.split('-').map(Number);
  const year = today.getFullYear();
  let next = new Date(year, month - 1, day);
  if (next < today) next = new Date(year + 1, month - 1, day);
  const days = Math.round((next.getTime() - today.getTime()) / 86400000);
  return { days, date: next };
}

function formatCountdown(days: number, date: Date): string {
  if (days === 0) return 'Aujourd\'hui 🎂';
  if (days === 1) return 'Demain';
  if (days <= 30) return `dans ${days} j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '');
}

function GiftIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="18" height="12" rx="2"/>
      <path d="M12 9v12M3 13h18"/>
      <path d="M7.5 9a2.5 2.5 0 1 1 0-5C10 4 12 6 12 9M16.5 9a2.5 2.5 0 1 0 0-5C14 4 12 6 12 9"/>
    </svg>
  );
}

interface Props {
  contacts: User[];
}

export function BirthdayStrip({ contacts }: Props) {
  const upcoming = contacts
    .filter((c) => c.birthdate)
    .map((c) => ({ member: c, ...nextBirthday(c.birthdate!) }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 8);

  if (!upcoming.length) return null;

  return (
    <>
      <div className="px-5 flex items-baseline justify-between mt-5 mb-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--ink-soft)' }}>Prochains anniversaires</div>
        <div className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>À venir</div>
      </div>
      <div className="px-5">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {upcoming.map(({ member, days, date }) => {
            const { bg, fg } = colorForId(member.id);
            return (
              <div key={member.id}
                className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-[12px] font-bold"
                style={{ background: '#fff', border: '1px solid var(--line)', color: 'var(--ink)' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: bg, color: fg }}>
                  <GiftIcon/>
                </span>
                <span>{firstName(member.name)}</span>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--ink-mute)' }}>{formatCountdown(days, date)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
