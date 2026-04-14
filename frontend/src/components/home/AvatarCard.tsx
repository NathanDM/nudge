import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types';

const PALETTE = [
  '#FFF8E1', '#FFD2B3', '#F5CD69', '#A7D49B', '#A8D8AA',
  '#66B1B0', '#C4B7E8', '#A87A86', '#98CBE9', '#9FAED9',
  '#E892A7', '#F88C85', '#DFA28A', '#B88A66', '#85A68B',
  '#8FA6A3', '#E3D4F3', '#FDF188', '#F7C3CF', '#FDFDFD',
];

function colorForId(id: string) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

function textColorFor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return luminance > 0.65 ? '#2D5954' : '#ffffff';
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function AvatarCard({ member }: { member: User }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMe = user?.id === member.id;
  const isChild = !!member.managedBy;
  const color = colorForId(member.id);
  const textColor = textColorFor(color);

  return (
    <button onClick={() => navigate(`/user/${member.id}`)} className="flex flex-col items-center gap-2 group">
      <div
        style={{ backgroundColor: color, color: textColor }}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-all group-hover:scale-105 ${
          isMe ? 'ring-2 ring-offset-2 ring-dark-sage' : 'shadow-sm group-hover:shadow-md'
        } ${isChild ? 'ring-1 ring-offset-1 ring-sage/50' : ''}`}
      >
        {getInitials(member.name)}
      </div>
      <span className="text-xs font-medium text-center leading-tight max-w-[72px] truncate">
        {isMe ? 'Moi' : member.name.split(' ')[0]}
      </span>
    </button>
  );
}
