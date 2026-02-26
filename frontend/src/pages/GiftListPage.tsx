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
      <button
        onClick={() => navigate('/')}
        className="text-sage hover:text-dark-sage mb-4 text-sm transition-colors"
      >
        &larr; Retour
      </button>
      <h1 className="text-2xl font-bold text-teal mb-6">{listTitle}</h1>

      <AddGiftForm forUserId={userId!} />

      {isLoading ? (
        <div className="text-center text-dark-sage py-8">Chargement...</div>
      ) : (
        <GiftList
          gifts={gifts ?? []}
          forUserId={userId!}
          isOwnList={isOwnList}
        />
      )}
    </div>
  );
}
