import { screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import apiClient from '../api/client';
import { outletContext, renderPage, longPressRemove } from './pages-test-helpers';
import FamillePage from './FamillePage';

vi.mock('../api/client', () => ({ default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }));
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'me', name: 'Alice' } }) }));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useOutletContext: () => outletContext };
});

const get = vi.mocked(apiClient.get);
const del = vi.mocked(apiClient.delete);
const bob = { id: 'bob', name: 'Bob', managedBy: null };

const mockApi = (suggestions: unknown[]) =>
  get.mockImplementation((url: string) =>
    Promise.resolve({ data: url === '/users/family' ? [bob] : suggestions }) as any);

beforeEach(() => vi.clearAllMocks());

describe('FamillePage', () => {
  it('shows the "Ils t\'ont ajouté" section when suggestions exist', async () => {
    mockApi([{ id: 'eve', name: 'Eve', currentType: null, via: null }]);

    renderPage(<FamillePage/>);

    await screen.findByText("Suggestions");
    expect(screen.getByText('Eve')).toBeInTheDocument();
  });

  it('hides the section with zero suggestions', async () => {
    mockApi([]);

    renderPage(<FamillePage/>);

    await screen.findByText('Ma famille');
    expect(screen.queryByText("Suggestions")).not.toBeInTheDocument();
  });

  it('removing a contact invalidates family and family-suggestions (regression)', async () => {
    mockApi([]);
    del.mockResolvedValue({});
    const client = renderPage(<FamillePage/>);
    const spy = vi.spyOn(client, 'invalidateQueries');
    await screen.findByText('Bob');

    await longPressRemove(screen.getByRole('button', { name: 'B' }));

    await waitFor(() => expect(spy).toHaveBeenCalledWith({ queryKey: ['family-suggestions'] }));
    expect(spy).toHaveBeenCalledWith({ queryKey: ['family'] });
  });
});
