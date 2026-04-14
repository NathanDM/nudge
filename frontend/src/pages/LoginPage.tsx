import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import Logo from '../components/layout/Logo';

type Mode = 'login' | 'register';

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(phone, pin);
      else await register(name, phone, pin);
      const joinToken = sessionStorage.getItem('joinToken');
      if (joinToken) {
        sessionStorage.removeItem('joinToken');
        try { await apiClient.post(`/invitations/${joinToken}/accept`); } catch { /* ignore */ }
      }
      navigate('/');
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number } };
      if (!axiosError.response) {
        setError('Problème de connexion, réessayez');
      } else if (mode === 'register' && axiosError.response.status === 409) {
        setMode('login');
        setPin('');
        setName('');
        setError('Ce numéro est déjà utilisé. Appuyez sur «\u202fConnexion\u202f» pour vous connecter.');
      } else if (mode === 'login') {
        setError('Numéro ou PIN incorrect. Vérifiez votre numéro et votre code PIN.');
      } else {
        setError('Une erreur est survenue, réessayez.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setName('');
    setPhone('');
    setPin('');
  };

  const isValid = mode === 'login' ? !!phone && !!pin : !!name && !!phone && !!pin;

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand">
      <div className="p-4 w-full max-w-sm mx-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Logo size={52} hideText />
          <span className="text-4xl font-bold text-sage">Nudge</span>
          <div className="w-[52px]" />
        </div>
        <p className="text-sm text-gray-600 border-l-2 border-sage pl-3 py-1 mb-6">
          Créez votre compte pour gérer vos listes de cadeaux avec vos proches.
        </p>
        <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${mode === 'register' ? 'bg-sage text-white' : 'bg-transparent text-gray-400'}`}
          >
            Créer un compte
          </button>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${mode === 'login' ? 'bg-sage text-white' : 'bg-transparent text-gray-400'}`}
          >
            Connexion
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-bold mb-2">Prénom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre prénom"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blush bg-white"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold mb-2">Numéro de téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blush bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Code PIN (4 chiffres)</label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              placeholder="····"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blush bg-white"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full bg-sage text-white rounded-2xl py-3.5 font-semibold hover:bg-active transition-colors disabled:opacity-50 mt-2"
          >
            {loading && <Spinner />}
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}