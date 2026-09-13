import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import apiClient from '../../api/client';
import { makeQueryClient, withQueryClient } from '../../test-utils';
import { FamilySuggestionsSection } from './FamilySuggestionsSection';

vi.mock('../../api/client', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);

function renderSection() {
  const Wrapper = withQueryClient(makeQueryClient());
  return render(<Wrapper><FamilySuggestionsSection/></Wrapper>);
}

beforeEach(() => vi.clearAllMocks());

describe('FamilySuggestionsSection', () => {
  it('renders nothing while loading and with zero suggestions', async () => {
    // GIVEN
    get.mockResolvedValue({ data: [] });
    // WHEN
    const { container } = renderSection();
    // THEN
    expect(container).toBeEmptyDOMElement();
    await waitFor(() => expect(get).toHaveBeenCalledWith('/users/family/suggestions'));
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the count and toggles rows on collapse / expand', async () => {
    get.mockResolvedValue({ data: [{ id: 'a', name: 'Ana', currentType: null, via: null }, { id: 'b', name: 'Ben', currentType: 'friend', via: null }] });
    renderSection();
    const toggle = await screen.findByRole('button', { name: /Suggestions/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('2 · masquer')).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('2 · voir')).toBeInTheDocument();
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
    expect(screen.queryByText('Ben')).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByText('Ben')).toBeInTheDocument();
  });

  it('disables every row while one action is in flight and posts the action', async () => {
    get.mockResolvedValue({ data: [{ id: 'a', name: 'Ana', currentType: null, via: null }, { id: 'b', name: 'Ben', currentType: null, via: null }] });
    post.mockReturnValue(new Promise(() => {}) as any);
    renderSection();
    await screen.findByText('Ana');

    fireEvent.click(screen.getAllByRole('button', { name: 'Ajouter' })[0]);

    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Ajouter' })[0]).toBeDisabled());
    expect(screen.getAllByRole('button', { name: 'Ajouter' })[1]).toBeDisabled();
    expect(post).toHaveBeenCalledWith('/users/family/suggestions/a/accept');
  });

  it('shows the inline error on the failing row after a network error', async () => {
    get.mockResolvedValue({ data: [{ id: 'a', name: 'Ana', currentType: null, via: null }] });
    post.mockRejectedValue(new Error('Network Error'));
    renderSection();
    await screen.findByText('Ana');

    fireEvent.click(screen.getByRole('button', { name: 'Ignorer' }));

    await screen.findByText("Ça n'a pas marché. Réessaie.");
    expect(post).toHaveBeenCalledWith('/users/family/suggestions/a/dismiss');
    expect(screen.getByRole('button', { name: 'Ignorer' })).toBeEnabled();
  });
});
