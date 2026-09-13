import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { Sheet } from './Sheet';

describe('Sheet', () => {
  it('renders the title and children when open', () => {
    render(<Sheet open onClose={() => {}} title="Inviter"><p>contenu</p></Sheet>);

    expect(screen.getByRole('heading', { name: 'Inviter' })).toBeInTheDocument();
    expect(screen.getByText('contenu')).toBeInTheDocument();
  });

  it('closes from the close button and from the backdrop', () => {
    const onClose = vi.fn();
    const { container } = render(<Sheet open onClose={onClose} title="Inviter">x</Sheet>);

    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    fireEvent.click(container.firstElementChild!.firstElementChild!);

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('is aria-hidden and inert when closed', () => {
    const { container } = render(<Sheet open={false} onClose={() => {}} title="Inviter">x</Sheet>);

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstElementChild).toHaveClass('pointer-events-none');
  });
});
