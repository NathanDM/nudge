import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import apiClient from '../api/client';
import { makeQueryClient, withQueryClient } from '../test-utils';
import { useFamilySuggestionActions } from './useFamilySuggestions';

vi.mock('../api/client', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const post = vi.mocked(apiClient.post);

beforeEach(() => vi.clearAllMocks());

describe('useFamilySuggestionActions', () => {
  it('posts accept and invalidates the suggestion, family and friends queries', async () => {
    // GIVEN
    post.mockResolvedValue({});
    const client = makeQueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useFamilySuggestionActions(), { wrapper: withQueryClient(client) });
    // WHEN
    act(() => result.current.accept('bob'));
    // THEN
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ queryKey: ['family-suggestions'] }));
    expect(post).toHaveBeenCalledWith('/users/family/suggestions/bob/accept');
    expect(spy).toHaveBeenCalledWith({ queryKey: ['family'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['friends'] });
  });

  it('flags the row on a non-403 error and keeps it', async () => {
    post.mockRejectedValue(new Error('Network Error'));
    const client = makeQueryClient();
    const { result } = renderHook(() => useFamilySuggestionActions(), { wrapper: withQueryClient(client) });

    act(() => result.current.dismiss('bob'));

    await waitFor(() => expect(result.current.errorId).toBe('bob'));
  });

  it('on 403 invalidates instead of flagging an error', async () => {
    post.mockRejectedValue({ response: { status: 403 } });
    const client = makeQueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useFamilySuggestionActions(), { wrapper: withQueryClient(client) });

    act(() => result.current.accept('bob'));

    await waitFor(() => expect(spy).toHaveBeenCalledWith({ queryKey: ['family-suggestions'] }));
    expect(result.current.errorId).toBeNull();
  });

  it('ignores a second call while a request is pending', async () => {
    let resolve!: (v: unknown) => void;
    post.mockReturnValue(new Promise((r) => { resolve = r; }) as any);
    const client = makeQueryClient();
    const { result } = renderHook(() => useFamilySuggestionActions(), { wrapper: withQueryClient(client) });

    act(() => result.current.accept('bob'));
    await waitFor(() => expect(result.current.pendingId).toBe('bob'));
    act(() => result.current.accept('bob'));
    resolve({});

    await waitFor(() => expect(result.current.pendingId).toBeNull());
    expect(post).toHaveBeenCalledTimes(1);
  });
});
