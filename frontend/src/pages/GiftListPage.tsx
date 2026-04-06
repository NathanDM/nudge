import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Gift, User } from '../types';
import { useAuth } from '../hooks/useAuth';
import GiftList from '../components/gifts/GiftList';
import AddGiftForm from '../components/gifts/AddGiftForm';

export default function GiftListPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const targetUser = users?.find((u) => u.id === userId);
  const listTitle = isOwnList
    ? 'Ma liste'
    : `Liste de ${targetUser?.name ?? '...'}`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate('/')}
          className="hover:opacity-70 transition-opacity"
          aria-label="Retour"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h1 className="text-2xl font-bold">{listTitle}</h1>
      </div>

      <div className="hidden md:block bg-white rounded-xl p-4 shadow-sm mb-6">
        <h3 className="font-medium mb-3">Ajouter une idée</h3>
        <AddGiftForm forUserId={userId!} />
      </div>

      {isLoading ? (
        <div className="text-center text-dark-sage py-8">Chargement...</div>
      ) : (
        <GiftList gifts={gifts ?? []} forUserId={userId!} isOwnList={isOwnList} />
      )}

      <button
        onClick={() => setIsDrawerOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-sage text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-light hover:bg-dark-sage transition-colors z-30"
        aria-label="Ajouter un cadeau"
      >
        +
      </button>

      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsDrawerOpen(false)} />
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl px-5 pt-4 pb-8 transition-transform duration-300 ${
            isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Ajouter une idée</h3>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-sage text-xl leading-none hover:text-dark-sage transition-colors"
            >
              ✕
            </button>
          </div>
          <AddGiftForm forUserId={userId!} onSuccess={() => setIsDrawerOpen(false)} />
        </div>
      </div>
    </div>
  );
}
