import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { Provider } from 'react-redux';
import { describe, it, expect } from 'vitest';
import { store } from '../store';
import { queryClient } from '../db/queryClient';
import { useAuth } from './useAuth';

const wrapper = ({ children }: { children: React.ReactNode }) => createElement(Provider, { store }, children);

describe('useAuth.logout', () => {
  it('drops every cached query so the next account starts clean', () => {
    // GIVEN
    queryClient.setQueryData(['family-suggestions'], [{ id: 'bob', name: 'Bob', currentType: null }]);
    const { result } = renderHook(() => useAuth(), { wrapper });
    // WHEN
    act(() => result.current.logout());
    // THEN
    expect(queryClient.getQueryData(['family-suggestions'])).toBeUndefined();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
