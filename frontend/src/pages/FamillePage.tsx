import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../api/client';
import { User } from '../types';
import { AppShellContext } from '../components/layout/AppShell';
import { AvatarCard } from '../components/home/AvatarCard';

export default function FamillePage() {
  const navigate = useNavigate();
  const { setPlusHandler, setCloseHandler, notifyDrawerOpen } = useOutletContext<AppShellContext>();

  const { data: family = [], isLoading, isError } = useQuery<User[]>({
    queryKey: ['family'],
    queryFn: () => apiClient.get('/users/family').then((r) => r.data),
  });

  useEffect(() => {
    setPlusHandler(() => () => navigate('/profile'));
    setCloseHandler(null);
    return () => { setPlusHandler(null); setCloseHandler(null); notifyDrawerOpen(false); };
  }, [setPlusHandler, setCloseHandler, notifyDrawerOpen, navigate]);

  if (isLoading)
    return <div className="text-center text-sage py-12">Chargement...</div>;

  if (isError)
    return <div className="text-center text-red-400 py-12">Impossible de charger la famille. Réessayez.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ma famille</h1>

      <section>
        {family.length === 0
          ? (
            <div className="text-center py-10">
              <p className="text-base font-medium text-gray-700 mb-1">Ta famille n'est pas encore là 🎉</p>
              <p className="text-sm text-gray-500 mb-4">Invite-les pour partager vos listes de cadeaux.</p>
              <button
                onClick={() => navigate('/profile')}
                className="bg-sage text-white rounded-2xl px-6 py-3 text-sm font-semibold hover:bg-active transition-colors"
              >
                Inviter ma famille
              </button>
            </div>
          )
          : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
              {family.map((m) => <AvatarCard key={m.id} member={m} />)}
            </div>
          )
        }
      </section>
    </div>
  );
}
