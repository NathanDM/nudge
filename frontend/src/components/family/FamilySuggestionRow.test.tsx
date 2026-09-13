import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { FamilySuggestionRow } from './FamilySuggestionRow';

const bob = { id: 'bob', name: 'Bob Martin', currentType: null, via: null };
const carl = { id: 'carl', name: 'Carl Dupont', currentType: null, via: 'Bob' };
const friendBob = { ...bob, currentType: 'friend' as const };

const renderRow = (overrides: Partial<Parameters<typeof FamilySuggestionRow>[0]> = {}) => {
  const props = { suggestion: bob, onAccept: vi.fn(), onDismiss: vi.fn(), pending: false, error: false, ...overrides };
  render(<FamilySuggestionRow {...props}/>);
  return props;
};

describe('FamilySuggestionRow', () => {
  it('renders name, initials, hint and "Ajouter" for a stranger', () => {
    renderRow();

    expect(screen.getByText('Bob Martin')).toBeInTheDocument();
    expect(screen.getByText('BM')).toBeInTheDocument();
    expect(screen.getByText("T'a ajouté dans sa famille")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
  });

  it('renders the "déjà en amis" hint and "Passer en famille" for an existing friend', () => {
    renderRow({ suggestion: friendBob });

    expect(screen.getByText("T'a ajouté dans sa famille · déjà en amis")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Passer en famille' })).toBeInTheDocument();
  });

  it('renders the "Dans la famille de" hint for a member of the circle', () => {
    renderRow({ suggestion: carl });

    expect(screen.getByText('Dans la famille de Bob')).toBeInTheDocument();
  });

  it('calls onAccept / onDismiss with the suggestion id', () => {
    const { onAccept, onDismiss } = renderRow();

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ignorer' }));

    expect(onAccept).toHaveBeenCalledWith('bob');
    expect(onDismiss).toHaveBeenCalledWith('bob');
  });

  it('disables both buttons while pending', () => {
    const { onAccept } = renderRow({ pending: true });

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Ignorer' })).toBeDisabled();
    expect(onAccept).not.toHaveBeenCalled();
  });

  it('shows the error message only when error is set', () => {
    const { rerender } = render(<FamilySuggestionRow suggestion={bob} onAccept={() => {}} onDismiss={() => {}} pending={false} error={false}/>);
    expect(screen.queryByText("Ça n'a pas marché. Réessaie.")).not.toBeInTheDocument();

    rerender(<FamilySuggestionRow suggestion={bob} onAccept={() => {}} onDismiss={() => {}} pending={false} error/>);

    expect(screen.getByText("Ça n'a pas marché. Réessaie.")).toBeInTheDocument();
  });
});
