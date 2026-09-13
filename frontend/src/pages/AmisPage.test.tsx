import { screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import apiClient from '../api/client';
import { outletContext, renderPage, longPressRemove } from './pages-test-helpers';
import AmisPage from './AmisPage';

vi.mock('../api/client', () => ({ default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useOutletContext: () => outletContext };
});

const get = vi.mocked(apiClient.get);
const del = vi.mocked(apiClient.delete);

beforeEach(() => vi.clearAllMocks());

describe('AmisPage', () => {
  it('removing a friend invalidates friends and family-suggestions (regression)', async () => {
    // GIVEN
    get.mockResolvedValue({ data: [{ id: 'bob', name: 'Bob', managedBy: null }] });
    del.mockResolvedValue({});
    const client = renderPage(<AmisPage/>);
    const spy = vi.spyOn(client, 'invalidateQueries');
    await screen.findByText('Bob');
    // WHEN long-press then remove
    await longPressRemove(screen.getByRole('button', { name: 'B' }));
    // THEN
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ queryKey: ['family-suggestions'] }));
    expect(spy).toHaveBeenCalledWith({ queryKey: ['friends'] });
  });
});
