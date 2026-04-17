import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { User } from '../types';
import { AppShellContext } from '../components/layout/AppShell';
import { AvatarCard } from '../components/home/AvatarCard';
import { useAuth } from '../hooks/useAuth';

function AddFamilyForm({ onClose, inputRef }: { onClose: () => void; inputRef: React.RefObject<HTMLInputElement> }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (phone: string) =>
      apiClient.post('/users/contacts', { phone, contactType: 'family' }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] });
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
          ref={inputRef}
          placeholder="Numéro de téléphone"
          className="border border-blush/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blush"
          required
        />
        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
      <button
        type="submit"
        disabled={!phone || isPending}
        className="bg-blush text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-sage transition-colors disabled:opacity-50"
      >
        Ajouter
      </button>
    </form>
  );
}

export default function FamillePage() {
  const { setPlusHandler, setCloseHandler, notifyDrawerOpen } = useOutletContext<AppShellContext>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddMember, setShowAddMember] = useState(false);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: family = [], isLoading, isError } = useQuery<User[]>({
    queryKey: ['family'],
    queryFn: () => apiClient.get('/users/family').then((r) => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (contactId: string) => apiClient.delete(`/users/contacts/${contactId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['family'] }),
  });

  useEffect(() => {
    if (!user?.id) return;
    setPlusHandler(() => () => navigate(`/user/${user.id}?addIdea=true`));
    setCloseHandler(() => () => setShowAddMember(false));
    return () => { setPlusHandler(null); setCloseHandler(null); notifyDrawerOpen(false); };
  }, [setPlusHandler, setCloseHandler, notifyDrawerOpen, navigate, user?.id]);

  useEffect(() => { notifyDrawerOpen(showAddMember); }, [showAddMember, notifyDrawerOpen]);

  const openDrawer = () => { setShowAddMember(true); inputRef.current?.focus(); };

  if (isLoading)
    return <div className="text-center text-sage py-12">Chargement...</div>;

  if (isError)
    return <div className="text-center text-red-400 py-12">Impossible de charger la famille. Réessayez.</div>;

  return (
    <div onClick={() => editing && setEditing(false)}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ma famille</h1>
        {editing && (
          <button onClick={(e) => { e.stopPropagation(); setEditing(false); }} className="text-sm font-semibold text-active">
            Terminer
          </button>
        )}
      </div>

      <section>
        {family.length === 0
          ? (
            <div className="text-center py-10">
              <p className="text-base font-medium text-gray-700 mb-1">Ta famille n'est pas encore là 🎉</p>
              <p className="text-sm text-gray-500 mb-4">Invite-les pour partager vos listes de cadeaux.</p>
              <button
                onClick={openDrawer}
                className="bg-sage text-white rounded-2xl px-6 py-3 text-sm font-semibold hover:bg-active transition-colors"
              >
                Ajouter un membre
              </button>
            </div>
          )
          : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
              {family.map((m) => (
                <AvatarCard
                  key={m.id}
                  member={m}
                  editing={editing}
                  onRemove={() => removeMutation.mutate(m.id)}
                  onLongPress={() => setEditing(true)}
                />
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); setEditing(false); openDrawer(); }}
                className="flex flex-col items-center gap-1 group outline-none"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all group-hover:scale-105 shadow-sm group-hover:shadow-md bg-blush/10 text-blush border-2 border-dashed border-blush/30">
                  +
                </div>
                <span className="text-xs font-medium text-center leading-tight max-w-[72px] truncate text-gray-400">
                  Ajouter
                </span>
              </button>
            </div>
          )
        }
      </section>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          showAddMember ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddMember(false)} />
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl px-5 pt-4 pb-24 transition-transform duration-300 ${
            showAddMember ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Ajouter un membre</h3>
            <button onClick={() => setShowAddMember(false)} className="p-2 text-blush hover:text-sage transition-colors" aria-label="Fermer">✕</button>
          </div>
          <AddFamilyForm onClose={() => setShowAddMember(false)} inputRef={inputRef} />
        </div>
      </div>
    </div>
  );
}
