import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';

type Mode = 'login' | 'register';

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
        setError('Ce numéro est déjà utilisé. Appuie sur «\u202fConnexion\u202f» pour te connecter.');
      } else if (mode === 'login') {
        setError('Numéro ou PIN incorrect.');
      } else {
        setError('Une erreur est survenue, réessayez.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: Mode) => { setMode(next); setError(''); setName(''); setPhone(''); setPin(''); };
  const isValid = mode === 'login' ? !!phone && !!pin : !!name && !!phone && !!pin;

  const inputClass = 'w-full rounded-xl px-3.5 py-3 text-[14px] bg-white outline-none focus:ring-2 focus:ring-blush';
  const inputStyle = { border: '1.5px solid rgba(238,215,207,0.6)' };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 pb-8 pt-12" style={{ background: 'var(--sand)' }}>
      <div className="max-w-sm mx-auto w-full">
        <div className="flex items-center gap-2.5 mb-8">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="15" fill="#A5C8BF"/>
            <circle cx="20" cy="20" r="10" fill="#EED7CF"/>
            <circle cx="20" cy="20" r="5" fill="#E9ACB2"/>
            <circle cx="20" cy="20" r="2" fill="#FEF8F3"/>
          </svg>
          <span className="display text-[30px] font-black" style={{ color: 'var(--active)' }}>Nudge</span>
        </div>

        <div className="mb-8">
          <h1 className="display text-[30px] font-black leading-[1.1]" style={{ color: 'var(--ink)' }}>
            Des cadeaux,<br/>sans les doublons.
          </h1>
          <p className="text-[13px] leading-relaxed mt-2 max-w-[280px]" style={{ color: 'var(--ink-soft)' }}>
            Partage ta liste de cadeaux avec tes proches. Réservez ensemble — la surprise reste intacte.
          </p>
        </div>

        <div className="flex bg-white rounded-2xl p-1 mb-5" style={{ border: '1px solid var(--line)' }}>
          {([['register', 'Créer mon compte'], ['login', 'Se connecter']] as const).map(([k, l]) => (
            <button key={k} onClick={() => switchMode(k)}
              className="flex-1 py-2.5 text-[12px] font-bold rounded-xl transition"
              style={{ background: mode === k ? 'var(--sage)' : 'transparent', color: mode === k ? '#fff' : 'var(--ink-soft)' }}>
              {l}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <div>
              <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--ink)' }}>Prénom</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Votre prénom" required
                className={inputClass} style={inputStyle}/>
            </div>
          )}
          <div>
            <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--ink)' }}>Numéro de téléphone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78" required
              className={inputClass} style={inputStyle}/>
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--ink)' }}>Code PIN (4 chiffres)</label>
            <input type="password" inputMode="numeric" value={pin}
              onChange={(e) => setPin(e.target.value)} maxLength={4} placeholder="····" required
              className={`${inputClass} text-center tracking-[0.5em]`} style={inputStyle}/>
          </div>
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          <button type="submit" disabled={!isValid || loading}
            className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition active:scale-[0.98] disabled:opacity-40 mt-2"
            style={{ background: 'var(--sage)' }}>
            {loading ? '…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-8 text-center text-[11px]" style={{ color: 'var(--ink-mute)' }}>Fait avec ♡ pour les familles</p>
      </div>
    </div>
  );
}
