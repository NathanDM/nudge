import { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Gift, User } from '../types';
import { useAuth } from '../hooks/useAuth';
import GiftList from '../components/gifts/GiftList';
import AddGiftForm from '../components/gifts/AddGiftForm';
import { AppShellContext } from '../components/layout/AppShell';

export default function GiftListPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setPlusHandler, setCloseHandler, notifyDrawerOpen } = useOutletContext<AppShellContext>();
  const isOwnList = user?.id === userId;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users').then((r) => r.data),
  });

  const { data: gifts, isLoading } = useQuery<Gift[]>({
    queryKey: ['gifts', userId],
    queryFn: () => apiClient.get(`/users/${userId}/gifts`).then((r) => r.data),
    enabled: !!userId,
  });

  useEffect(() => {
    setPlusHandler(() => () => setIsDrawerOpen(true));
    setCloseHandler(() => () => setIsDrawerOpen(false));
    return () => { setPlusHandler(null); setCloseHandler(null); notifyDrawerOpen(false); };
  }, [setPlusHandler, setCloseHandler, notifyDrawerOpen]);

  useEffect(() => { notifyDrawerOpen(isDrawerOpen); }, [isDrawerOpen, notifyDrawerOpen]);

  const targetUser = users?.find((u) => u.id === userId);
  const listTitle = isOwnList ? 'Ma liste' : `Liste de ${targetUser?.name ?? '...'}`;

  return (
    <div>
      {!isOwnList && (
        <h1 onClick={() => navigate(-1)} className="text-2xl font-bold mb-6 cursor-pointer hover:opacity-70 transition-opacity">
          {'<'} Liste de {targetUser?.name ?? '...'}
        </h1>
      )}
      <div className="hidden md:block bg-white rounded-xl p-4 shadow-sm mb-6">
        <h3 className="font-medium mb-3">Ajouter une idée</h3>
        <AddGiftForm forUserId={userId!} />
      </div>

      {isLoading ? (
        <div className="text-center text-sage py-8">Chargement...</div>
      ) : (
        <GiftList gifts={gifts ?? []} forUserId={userId!} isOwnList={isOwnList} />
      )}

      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsDrawerOpen(false)} />
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl px-5 pt-4 pb-24 transition-transform duration-300 ${
            isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Ajouter une idée</h3>
            <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-blush hover:text-sage transition-colors" aria-label="Fermer">✕</button>
          </div>
          <AddGiftForm forUserId={userId!} onSuccess={() => setIsDrawerOpen(false)} />
        </div>
      </div>
    </div>
  );
}
