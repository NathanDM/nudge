import { useState } from 'react';
import { FamilySuggestionRow } from './FamilySuggestionRow';
import { useFamilySuggestionActions, useFamilySuggestionsQuery } from '../../hooks/useFamilySuggestions';

export function FamilySuggestionsSection() {
  const { data: suggestions = [] } = useFamilySuggestionsQuery();
  const { accept, dismiss, pendingId, errorId } = useFamilySuggestionActions();
  const [collapsed, setCollapsed] = useState(false);

  if (suggestions.length === 0) return null;

  return (
    <section className="mx-4 mt-3 rounded-2xl px-4 py-2" style={{ background: 'rgba(165,200,191,0.18)' }}>
      <button onClick={() => setCollapsed((c) => !c)} className="w-full flex items-center justify-between py-1.5"
        aria-expanded={!collapsed}>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--ink-soft)' }}>
          Suggestions
        </span>
        <span className="text-[11px] font-bold" style={{ color: 'var(--active)' }}>
          {suggestions.length} · {collapsed ? 'voir' : 'masquer'}
        </span>
      </button>
      {!collapsed && suggestions.map((s) => (
        <FamilySuggestionRow key={s.id} suggestion={s} onAccept={accept} onDismiss={dismiss}
          pending={pendingId !== null} error={errorId === s.id}/>
      ))}
    </section>
  );
}
