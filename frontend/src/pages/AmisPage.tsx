import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/client';
import { User } from '../types';
import { AppShellContext } from '../components/layout/AppShell';
import { AvatarCard } from '../components/home/AvatarCard';

function AddFriendForm({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (phone: string) => apiClient.post('/users/contacts', { phone }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      onClose();
    },
    onError: () => setError('Numéro introuvable'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutate(phone);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start">
      <div className="flex flex-col gap-1 flex-1">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Numéro de téléphone"
          autoFocus
          className="border border-sage/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
          required
        />
        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
      <button
        type="submit"
        disabled={!phone || isPending}
        className="bg-sage text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-dark-sage transition-colors disabled:opacity-50"
      >
        Ajouter
      </button>
    </form>
  );
}

export default function AmisPage() {
  const { setPlusHandler, setCloseHandler, notifyDrawerOpen } = useOutletContext<AppShellContext>();
  const [showAddFriend, setShowAddFriend] = useState(false);

  const { data: friends = [], isLoading } = useQuery<User[]>({
    queryKey: ['friends'],
    queryFn: () => apiClient.get('/users/friends').then((r) => r.data),
  });

  useEffect(() => {
    setPlusHandler(() => () => setShowAddFriend(true));
    setCloseHandler(() => () => setShowAddFriend(false));
    return () => { setPlusHandler(null); setCloseHandler(null); notifyDrawerOpen(false); };
  }, [setPlusHandler, setCloseHandler, notifyDrawerOpen]);

  useEffect(() => { notifyDrawerOpen(showAddFriend); }, [showAddFriend, notifyDrawerOpen]);

  if (isLoading)
    return <div className="text-center text-dark-sage py-12">Chargement...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Amis</h1>

      {friends.length === 0
        ? <p className="text-sm text-gray-400 italic">Aucun ami — utilisez le + pour en ajouter</p>
        : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
            {friends.map((m) => <AvatarCard key={m.id} member={m} />)}
          </div>
        )
      }

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          showAddFriend ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddFriend(false)} />
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl px-5 pt-4 pb-24 transition-transform duration-300 ${
            showAddFriend ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Ajouter un ami</h3>
            <button onClick={() => setShowAddFriend(false)} className="text-sage text-xl leading-none hover:text-dark-sage transition-colors">✕</button>
          </div>
          <AddFriendForm onClose={() => setShowAddFriend(false)} />
        </div>
      </div>
    </div>
  );
}
