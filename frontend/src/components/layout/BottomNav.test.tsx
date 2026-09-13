import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import apiClient from '../../api/client';
import { makeQueryClient, withQueryClient } from '../../test-utils';
import BottomNav from './BottomNav';

vi.mock('../../api/client', () => ({ default: { get: vi.fn() } }));
vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'me', name: 'Alice' } }) }));

const get = vi.mocked(apiClient.get);

function renderNav() {
  const Wrapper = withQueryClient(makeQueryClient());
  render(<MemoryRouter><Wrapper><BottomNav drawerOpen={false} onFabClick={() => {}}/></Wrapper></MemoryRouter>);
}

beforeEach(() => vi.clearAllMocks());

describe('BottomNav badge', () => {
  it('shows the suggestion count on the Famille tab', async () => {
    get.mockResolvedValue({ data: [{ id: 'a', name: 'A', currentType: null, via: null }, { id: 'b', name: 'B', currentType: null, via: null }] });

    renderNav();

    await screen.findByLabelText('2 nouveaux proches');
  });

  it('shows no badge with zero suggestions', async () => {
    get.mockResolvedValue({ data: [] });

    renderNav();

    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(screen.queryByLabelText(/nouveaux proches/)).not.toBeInTheDocument();
  });
});
