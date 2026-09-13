import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import apiClient from '../api/client';
import { makeQueryClient, withQueryClient } from '../test-utils';
import { outletContext } from './pages-test-helpers';
import GiftListPage from './GiftListPage';

vi.mock('../api/client', () => ({ default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }));
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'me', name: 'Alice' } }) }));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useOutletContext: () => outletContext };
});

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);

const leo = { id: 'leo', name: 'Léo', managedBy: 'me' };
const bob = { id: 'bob', name: 'Bob', managedBy: null };

function mockApi(shareToken: string | null) {
  get.mockImplementation((url: string) => {
    if (url === '/users/family') return Promise.resolve({ data: [leo, bob] }) as any;
    if (url.endsWith('/share-token')) return Promise.resolve({ data: { shareToken } }) as any;
    return Promise.resolve({ data: [] }) as any;
  });
}

function renderList(userId: string) {
  const Wrapper = withQueryClient(makeQueryClient());
  render(
    <MemoryRouter initialEntries={[`/user/${userId}`]}>
      <Wrapper>
        <Routes><Route path="/user/:userId" element={<GiftListPage/>}/></Routes>
      </Wrapper>
    </MemoryRouter>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe('GiftListPage — sharing a child list', () => {
  it('shows the share button on a list of a child managed by me', async () => {
    // GIVEN
    mockApi(null);
    // WHEN
    renderList('leo');
    // THEN
    await screen.findByText('Liste de Léo');
    expect(await screen.findByRole('button', { name: 'Partager' })).toBeInTheDocument();
    await waitFor(() => expect(get).toHaveBeenCalledWith('/users/children/leo/share-token'));
  });

  it('hides the share button on a list of someone else', async () => {
    // GIVEN
    mockApi(null);
    // WHEN
    renderList('bob');
    // THEN
    await screen.findByText('Liste de Bob');
    expect(screen.queryByRole('button', { name: 'Partager' })).not.toBeInTheDocument();
    expect(get).not.toHaveBeenCalledWith(expect.stringContaining('share-token'));
  });

  it('generates a share link for the child through the child endpoint', async () => {
    // GIVEN
    mockApi(null);
    post.mockResolvedValue({ data: { shareToken: 'abc123' } });
    renderList('leo');
    fireEvent.click(await screen.findByRole('button', { name: 'Partager' }));
    // WHEN
    fireEvent.click(await screen.findByRole('button', { name: 'Générer un lien de partage' }));
    // THEN
    await waitFor(() => expect(post).toHaveBeenCalledWith('/users/children/leo/share-token'));
    expect(await screen.findByText(/\/share\/abc123/)).toBeInTheDocument();
    expect(screen.getByText('Qui peut voir la liste de Léo ?')).toBeInTheDocument();
  });
});
