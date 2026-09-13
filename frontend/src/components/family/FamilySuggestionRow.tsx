import { FamilySuggestion } from '../../types';
import { colorForId, textColorFor, getInitials } from '../home/avatar';

type Props = {
  suggestion: FamilySuggestion;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  pending: boolean;
  error: boolean;
};

export function FamilySuggestionRow({ suggestion, onAccept, onDismiss, pending, error }: Props) {
  const color = colorForId(suggestion.id);
  const isFriend = suggestion.currentType === 'friend';

  return (
    <div className="py-3 flex flex-col gap-2 [&:not(:last-child)]:border-b" style={{ borderColor: 'var(--line)' }}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
             style={{ background: color, color: textColorFor(color) }}>
          {getInitials(suggestion.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold truncate" style={{ color: 'var(--ink)' }}>{suggestion.name}</div>
          <div className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>
            {isFriend ? "T'a ajouté dans sa famille · déjà en amis" : "T'a ajouté dans sa famille"}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={() => onAccept(suggestion.id)} disabled={pending}
          className="px-4 rounded-2xl py-2.5 text-[13px] font-bold text-white active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'var(--active)' }}>
          {isFriend ? 'Passer en famille' : 'Ajouter'}
        </button>
        <button onClick={() => onDismiss(suggestion.id)} disabled={pending}
          className="px-4 rounded-2xl py-2.5 text-[13px] font-bold active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'rgba(31,27,23,0.06)', color: 'var(--ink-soft)' }}>
          Ignorer
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">Ça n'a pas marché. Réessaie.</p>}
    </div>
  );
}
