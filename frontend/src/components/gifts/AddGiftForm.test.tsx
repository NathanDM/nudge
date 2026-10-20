import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import apiClient from '../../api/client';
import { makeQueryClient, withQueryClient } from '../../test-utils';
import { Gift } from '../../types';
import AddGiftForm from './AddGiftForm';

vi.mock('../../api/client', () => ({ default: { post: vi.fn(), patch: vi.fn() } }));

const post = vi.mocked(apiClient.post);
const patch = vi.mocked(apiClient.patch);

const gift: Gift = {
  id: 'g1', forUserId: 'me', addedByUserId: 'me', addedByName: 'Alice',
  title: 'Vélo', description: null, url: null, price: null, ogImageUrl: 'https://img.test/old.jpg',
  canDelete: true, canEdit: true, secret: false, createdAt: '2026-10-01',
};

function renderForm(existing?: Gift) {
  const Wrapper = withQueryClient(makeQueryClient());
  render(<Wrapper><AddGiftForm forUserId="me" gift={existing}/></Wrapper>);
}

const imageInput = () => screen.getByLabelText('Image (optionnel)');

beforeEach(() => vi.clearAllMocks());

describe('AddGiftForm image', () => {
  it('sends the custom image when adding a gift', async () => {
    // GIVEN
    post.mockResolvedValue({ data: {} });
    renderForm();
    fireEvent.change(screen.getByPlaceholderText('Ex. Théière en fonte'), { target: { value: 'Vélo' } });
    fireEvent.change(imageInput(), { target: { value: 'https://img.test/new.jpg' } });
    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    // THEN
    await waitFor(() => expect(post).toHaveBeenCalledWith('/users/me/gifts',
      expect.objectContaining({ imageUrl: 'https://img.test/new.jpg' })));
  });

  it('prefills the current image when editing a gift', () => {
    // GIVEN / WHEN
    renderForm(gift);
    // THEN
    expect(imageInput()).toHaveValue('https://img.test/old.jpg');
  });

  it('sends no image when the field is cleared on edit', async () => {
    // GIVEN
    patch.mockResolvedValue({ data: {} });
    renderForm(gift);
    fireEvent.change(imageInput(), { target: { value: '' } });
    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    // THEN
    await waitFor(() => expect(patch).toHaveBeenCalledWith('/gifts/g1',
      expect.objectContaining({ imageUrl: undefined })));
  });
});
