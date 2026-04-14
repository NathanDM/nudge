import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import Logo from '../components/layout/Logo';

type State = 'loading' | 'ready' | 'accepting' | 'error';

export default function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [inviterName, setInviterName] = useState('');
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    if (!token) return;
    apiClient.get<{ inviterName: string }>(`/invitations/${token}`)
      .then(({ data }) => {
        setInviterName(data.inviterName);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [token]);

  const handleAccept = async () => {
    setState('accepting');
    try {
      await apiClient.post(`/invitations/${token}/accept`);
      navigate('/');
    } catch {
      setState('error');
    }
  };

  const handleLogin = () => {
    if (!token) return;
    sessionStorage.setItem('joinToken', token);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand">
      <div className="p-4 w-full max-w-sm mx-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Logo size={52} hideText />
          <span className="text-4xl font-bold text-sage">Nudge</span>
          <div className="w-[52px]" />
        </div>

        {state === 'loading' && (
          <p className="text-gray-500">Chargement...</p>
        )}

        {state === 'error' && (
          <p className="text-red-500">Ce lien est invalide ou a expiré.</p>
        )}

        {(state === 'ready' || state === 'accepting') && (
          <>
            <p className="text-lg font-semibold mb-2">
              {inviterName} t'invite sur Nudge
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Rejoins {inviterName} pour partager vos listes de cadeaux.
            </p>
            {isAuthenticated ? (
              <button
                onClick={handleAccept}
                disabled={state === 'accepting'}
                className="w-full bg-sage text-white rounded-2xl py-3.5 font-semibold hover:bg-active transition-colors disabled:opacity-50"
              >
                {state === 'accepting' ? 'Rejoindre...' : 'Rejoindre'}
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full bg-sage text-white rounded-2xl py-3.5 font-semibold hover:bg-active transition-colors"
              >
                Se connecter pour rejoindre
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
