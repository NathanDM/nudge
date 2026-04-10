import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/layout/Logo';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') await login(phone, pin);
      else await register(name, phone, pin);
      navigate('/');
    } catch {
      setError(mode === 'login' ? 'Numéro ou PIN incorrect' : 'Numéro déjà utilisé');
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
      <div className=" p-4 w-full max-w-sm mx-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Logo size={52} hideText />
          <span className="text-4xl font-bold text-dark-sage">Nudge</span>
          <div className="w-[52px]" />
        </div>
        <div className="flex gap-2 mb-8">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${mode === 'login' ? 'bg-dark-sage text-white' : 'bg-sage text-white'}`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${mode === 'register' ? 'bg-dark-sage text-white' : 'bg-sage text-white'}`}
          >
            Inscription
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage bg-white"
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Code PIN (4 chiffres)</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              placeholder="····"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-sage bg-white"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-dark-sage text-white rounded-2xl py-3.5 font-semibold hover:bg-dark-sage transition-colors disabled:opacity-50 mt-2"
          >
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}
