import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../api/client';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { AppShellContext } from '../components/layout/AppShell';
import { AvatarCard } from '../components/home/AvatarCard';

export default function FamillePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setPlusHandler, setCloseHandler, notifyDrawerOpen } = useOutletContext<AppShellContext>();
  const [showInviteInfo, setShowInviteInfo] = useState(false);

  const { data: family = [], isLoading } = useQuery<User[]>({
    queryKey: ['family'],
    queryFn: () => apiClient.get('/users/family').then((r) => r.data),
  });

  useEffect(() => {
    setPlusHandler(() => () => navigate('/profile'));
    setCloseHandler(null);
    return () => { setPlusHandler(null); setCloseHandler(null); notifyDrawerOpen(false); };
  }, [setPlusHandler, setCloseHandler, notifyDrawerOpen, navigate]);

  if (isLoading)
    return <div className="text-center text-dark-sage py-12">Chargement...</div>;

  const selfAsUser: User | null = user ? { id: user.id, name: user.name } : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Famille</h1>

      {selfAsUser && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-dark-sage/60 mb-3">Moi</h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
            <AvatarCard member={selfAsUser} />
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-dark-sage/60 mb-3">Ma famille</h2>
        {family.length === 0
          ? (
            <p className="text-sm text-gray-400 italic">
              Aucun membre famille — <button onClick={() => navigate('/profile')} className="text-sage underline">générez un lien d'invitation</button> depuis votre profil
            </p>
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
