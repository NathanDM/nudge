import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { makeQueryClient, withQueryClient } from '../test-utils';
import { LONG_PRESS_MS } from '../components/home/AvatarCard';

export const outletContext = {
  setCloseHandler: () => {},
  notifyDrawerOpen: () => {},
  setViewingUserId: () => {},
  openInvitePicker: () => {},
  openAddChild: () => {},
};

export async function longPressRemove(avatar: HTMLElement) {
  fireEvent.mouseDown(avatar);
  await new Promise((r) => setTimeout(r, LONG_PRESS_MS + 100));
  fireEvent.mouseUp(avatar);
  fireEvent.click(await screen.findByRole('button', { name: 'Retirer' }));
}

export function renderPage(page: React.ReactElement) {
  const client = makeQueryClient();
  const Wrapper = withQueryClient(client);
  render(<MemoryRouter><Wrapper>{page}</Wrapper></MemoryRouter>);
  return client;
}
