import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

function useLongPress(onLongPress: () => void, ms = 500) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const fired = useRef(false);

  const cancel = () => clearTimeout(timer.current);
  const start = () => {
    fired.current = false;
    cancel();
    timer.current = setTimeout(() => { fired.current = true; onLongPress(); }, ms);
  };
  const wasFired = () => { const v = fired.current; fired.current = false; return v; };

  return {
    handlers: {
      onMouseDown: start, onMouseUp: cancel, onMouseLeave: cancel,
      onTouchStart: start, onTouchEnd: cancel, onTouchMove: cancel,
      onContextMenu: (e: React.MouseEvent) => { e.preventDefault(); cancel(); },
    },
    wasFired,
  };
}

interface AvatarCardProps {
  member: User;
  editing?: boolean;
  onRemove?: () => void;
  onLongPress?: () => void;
}

export function AvatarCard({ member, editing, onRemove, onLongPress }: AvatarCardProps) {
  const navigate = useNavigate();
  const lp = useLongPress(onLongPress ?? (() => {}));
  const isChild = !!member.managedBy;
  const color = colorForId(member.id);
  const textColor = textColorFor(color);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lp.wasFired()) return;
    if (!editing) navigate(`/user/${member.id}`);
  };

  return (
    <div className="relative flex flex-col items-center gap-1 select-none">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleClick(e as any)}
        {...lp.handlers}
        style={{ backgroundColor: color, color: textColor }}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold cursor-pointer transition-all shadow-sm
          ${isChild ? 'ring-1 ring-offset-1 ring-blush/50' : ''}
          ${editing ? 'scale-95 opacity-80' : 'hover:scale-105 hover:shadow-md'}`}
      >
        {getInitials(member.name)}
      </div>
      {editing && onRemove && (
        <button
          className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold z-10 border-2 border-white shadow-sm"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Retirer"
        >
          ×
        </button>
      )}
      <span className="text-xs font-medium text-center leading-tight max-w-[72px] truncate">
        {member.name.split(' ')[0]}
      </span>
    </div>
  );
}
