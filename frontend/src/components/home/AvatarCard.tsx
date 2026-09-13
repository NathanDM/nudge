import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { colorForId, textColorFor, getInitials } from './avatar';

export const LONG_PRESS_MS = 500;

function useLongPress(onLongPress: () => void, ms = LONG_PRESS_MS) {
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
  isChild?: boolean;
  onRemove?: () => void;
}

export function AvatarCard({ member, isChild, onRemove }: AvatarCardProps) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const color = colorForId(member.id);
  const textColor = textColorFor(color);

  const lp = useLongPress(() => { if (!isChild && onRemove) setEditing(true); });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lp.wasFired()) return;
    if (editing) { setEditing(false); return; }
    navigate(`/user/${member.id}`);
  };

  return (
    <div className="relative flex flex-col items-center gap-1.5 p-2 rounded-2xl select-none"
         onClick={() => editing && setEditing(false)}>
      <div className="relative">
        <button
          onClick={handleClick}
          {...lp.handlers}
          style={{
            width: 64, height: 64, background: color, color: textColor,
            boxShadow: isChild ? `0 0 0 2px var(--sand), 0 0 0 4px var(--blush)` : undefined,
          }}
          className={`rounded-full flex items-center justify-center text-lg font-bold transition ${editing ? 'scale-95 opacity-80' : 'active:scale-[0.97]'}`}
        >
          {getInitials(member.name)}
        </button>
        {editing && onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); setEditing(false); }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold z-10"
            style={{ background: '#333', border: '2px solid var(--sand)' }}
            aria-label="Retirer"
          >
            ×
          </button>
        )}
      </div>
      <div className="text-[12px] font-bold leading-tight line-clamp-1 max-w-[78px]" style={{ color: 'var(--ink)' }}>
        {member.name.split(' ')[0]}
      </div>
      {isChild && (
        <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--salmon)' }}>Enfant</div>
      )}
    </div>
  );
}
