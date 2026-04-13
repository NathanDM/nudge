import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    isAuthenticated: false,
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../components/layout/Logo', () => ({
  default: () => <div data-testid="logo" />,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('auto-switches to login and keeps phone when register returns 409', async () => {
    const user = userEvent.setup();
    const conflictError = { response: { status: 409 } };
    mockRegister.mockRejectedValueOnce(conflictError);

    renderPage();

    await user.type(screen.getByPlaceholderText('Votre prénom'), 'Marie');
    await user.type(screen.getByPlaceholderText('+33 6 12 34 56 78'), '0601020304');
    await user.type(screen.getByPlaceholderText('····'), '1234');
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('0601020304')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Votre prénom')).not.toBeInTheDocument();
    expect(screen.getByText(/ce numéro est déjà utilisé/i)).toBeInTheDocument();
  });

  it('disables button with spinner on submit and re-enables on error', async () => {
    const user = userEvent.setup();
    let resolveReject: (err: unknown) => void;
    mockRegister.mockImplementationOnce(
      () => new Promise((_, reject) => { resolveReject = reject; }),
    );

    renderPage();

    await user.type(screen.getByPlaceholderText('Votre prénom'), 'Test');
    await user.type(screen.getByPlaceholderText('+33 6 12 34 56 78'), '0601020304');
    await user.type(screen.getByPlaceholderText('····'), '1234');

    const submitBtn = screen.getByRole('button', { name: /créer mon compte/i });
    await user.click(submitBtn);

    expect(submitBtn).toBeDisabled();

    resolveReject!({ response: { status: 500 } });

    await waitFor(() => expect(submitBtn).not.toBeDisabled());
  });

  it('shows connection error (not auth error) when no response', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce({});

    renderPage();

    await user.type(screen.getByPlaceholderText('Votre prénom'), 'Test');
    await user.type(screen.getByPlaceholderText('+33 6 12 34 56 78'), '0601020304');
    await user.type(screen.getByPlaceholderText('····'), '1234');
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() => {
      expect(screen.getByText(/problème de connexion/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/numéro ou pin incorrect/i)).not.toBeInTheDocument();
  });
});
