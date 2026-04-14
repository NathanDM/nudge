import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import { User } from '../types';

function AddChildForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/users/children', { name });
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['family'] });
      onClose();
    } catch (err: any) {
      setError(err?.response?.status === 409 ? 'Un enfant avec ce prénom existe déjà' : 'Erreur, réessayez');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2 items-start">
      <div className="flex flex-col gap-1 flex-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Prénom de l'enfant"
          autoFocus
          className="border border-sage/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
          required
        />
        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
      <button type="submit" disabled={!name || loading}
        className="bg-sage text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-dark-sage transition-colors disabled:opacity-50">
        {loading ? '...' : 'Créer'}
      </button>
      <button type="button" onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2">
        Annuler
      </button>
    </form>
  );
}

function ChildRow({ child }: { child: User }) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: () => apiClient.delete(`/users/children/${child.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['family'] });
    },
  });

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium">{child.name}</span>
      <button
        onClick={() => mutate()}
        disabled={isPending}
        className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
      >
        Supprimer
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);

  const { data: children = [] } = useQuery<User[]>({
    queryKey: ['children'],
    queryFn: () => apiClient.get('/users/children').then((r) => r.data),
  });

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleGenerateInvite = async () => {
    setLoadingInvite(true);
    try {
      const { data } = await apiClient.post<{ token: string }>('/invitations');
      setInviteUrl(`${window.location.origin}/join/${data.token}`);
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{user?.name}</h1>

      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-dark-sage/60 mb-3">Mes enfants</h2>
        {children.length > 0 && (
          <div className="mb-3 rounded-lg border border-gray-100 bg-white px-4 py-1">
            {children.map((c) => <ChildRow key={c.id} child={c} />)}
          </div>
        )}
        {showAddChild
          ? <AddChildForm onClose={() => setShowAddChild(false)} />
          : (
            <button onClick={() => setShowAddChild(true)} className="text-sm text-sage hover:text-dark-sage transition-colors">
              + Ajouter un enfant
            </button>
          )
        }
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-dark-sage/60 mb-3">Invitation</h2>
        <button onClick={handleGenerateInvite} disabled={loadingInvite}
          className="text-sm bg-sage text-white px-4 py-2 rounded-lg hover:bg-dark-sage transition-colors disabled:opacity-50">
          {loadingInvite ? 'Génération...' : "Générer un lien d'invitation"}
        </button>
        {inviteUrl && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-600 truncate max-w-xs">{inviteUrl}</span>
            <button onClick={handleCopy} className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition-colors shrink-0">
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
        )}
      </section>

      <button onClick={handleLogout} className="text-sm bg-sage text-white px-4 py-2 rounded-lg hover:bg-dark-sage transition-colors">
        Déconnexion
      </button>
    </div>
  );
}
