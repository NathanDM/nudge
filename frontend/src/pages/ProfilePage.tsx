import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import { User } from '../types';
import { AppShellContext } from '../components/layout/AppShell';

function AddChildForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

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
          ref={inputRef}
          placeholder="Prénom de l'enfant"
          className="border border-salmon/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-salmon"
          required
        />
        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
      <button type="submit" disabled={!name || loading}
        className="bg-salmon text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-sage transition-colors disabled:opacity-50">
        {loading ? '...' : 'Créer'}
      </button>
      <button type="button" onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2">
        Annuler
      </button>
    </form>
  );
}

function ChildShareToken({ childId }: { childId: string }) {
  const [shareToken, setShareToken] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiClient.get<{ shareToken: string | null }>(`/users/children/${childId}/share-token`)
      .then((r) => setShareToken(r.data.shareToken))
      .catch(() => setShareToken(null));
  }, [childId]);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.post<{ shareToken: string }>(`/users/children/${childId}/share-token`);
      setShareToken(data.shareToken);
    } finally {
      setLoading(false);
    }
  };

  const revoke = async () => {
    setLoading(true);
    try {
      await apiClient.delete(`/users/children/${childId}/share-token`);
      setShareToken(null);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!shareToken) return;
    await navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (shareToken === undefined) return null;

  if (shareToken)
    return (
      <div className="flex items-center gap-2 mt-1">
        <button onClick={copy} className="text-xs text-gray-500 hover:text-gray-700 underline truncate max-w-[140px]">
          {copied ? 'Copié !' : 'Copier le lien'}
        </button>
        <span className="text-gray-200">|</span>
        <button onClick={revoke} disabled={loading} className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50">
          Révoquer
        </button>
      </div>
    );

  return (
    <button onClick={generate} disabled={loading} className="text-xs text-salmon hover:text-sage transition-colors mt-1 disabled:opacity-50">
      {loading ? '...' : 'Générer un lien'}
    </button>
  );
}

function ChildRow({ child }: { child: User }) {
  const [confirming, setConfirming] = useState(false);
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: () => apiClient.delete(`/users/children/${child.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['family'] });
      setConfirming(false);
    },
  });

  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{child.name}</span>
          <ChildShareToken childId={child.id} />
        </div>
        {confirming ? (
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => mutate()} disabled={isPending} className="text-red-500 hover:text-red-700 font-medium disabled:opacity-50">
              Oui
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={() => setConfirming(false)} className="text-gray-400 hover:text-gray-600 p-1">
              Non
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors p-2"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { setPlusHandler, setCloseHandler, notifyDrawerOpen } = useOutletContext<AppShellContext>();
  const [inviteUrl, setInviteUrl] = useState<string | null>(() => sessionStorage.getItem('lastInviteUrl'));
  const [inviteError, setInviteError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [shareToken, setShareToken] = useState<string | null | undefined>(undefined);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    setPlusHandler(() => () => setShowAddChild(true));
    setCloseHandler(() => () => setShowAddChild(false));
    return () => { setPlusHandler(null); setCloseHandler(null); notifyDrawerOpen(false); };
  }, [setPlusHandler, setCloseHandler, notifyDrawerOpen]);

  useEffect(() => { notifyDrawerOpen(showAddChild); }, [showAddChild, notifyDrawerOpen]);

  const { data: children = [] } = useQuery<User[]>({
    queryKey: ['children'],
    queryFn: () => apiClient.get('/users/children').then((r) => r.data),
  });

  useEffect(() => {
    apiClient.get<{ shareToken: string | null }>('/users/share-token')
      .then((r) => setShareToken(r.data.shareToken))
      .catch(() => setShareToken(null));
  }, []);

  const handleGenerateShareToken = async () => {
    setShareLoading(true);
    try {
      const { data } = await apiClient.post<{ shareToken: string }>('/users/share-token');
      setShareToken(data.shareToken);
    } finally {
      setShareLoading(false);
    }
  };

  const handleRevokeShareToken = async () => {
    setShareLoading(true);
    try {
      await apiClient.delete('/users/share-token');
      setShareToken(null);
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyShareUrl = async () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleGenerateInvite = async () => {
    setLoadingInvite(true);
    setInviteError('');
    try {
      const { data } = await apiClient.post<{ token: string }>('/invitations');
      const url = `${window.location.origin}/join/${data.token}`;
      setInviteUrl(url);
      sessionStorage.setItem('lastInviteUrl', url);
    } catch {
      setInviteError("Impossible de générer le lien, réessayez.");
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
    }
  };

  return (
    <div>
      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Mes enfants</h2>
        {children.length > 0 && (
          <div className="mb-3 rounded-lg border border-gray-100 bg-white px-4 py-1">
            {children.map((c) => <ChildRow key={c.id} child={c} />)}
          </div>
        )}
        {showAddChild
          ? <AddChildForm onClose={() => setShowAddChild(false)} />
          : (
            <button onClick={() => setShowAddChild(true)} className="text-sm text-salmon hover:text-sage transition-colors">
              + Ajouter un enfant
            </button>
          )
        }
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Partager ma liste</h2>
        {shareToken ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-600 truncate max-w-xs">
                {`${window.location.origin}/share/${shareToken}`}
              </span>
              <button
                onClick={handleCopyShareUrl}
                className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition-colors shrink-0"
              >
                {shareCopied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <button
              onClick={handleRevokeShareToken}
              disabled={shareLoading}
              className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              Révoquer le lien
            </button>
          </div>
        ) : shareToken === null ? (
          <button
            onClick={handleGenerateShareToken}
            disabled={shareLoading}
            className="text-sm bg-blush text-white px-4 py-2 rounded-lg hover:bg-sage transition-colors disabled:opacity-50"
          >
            {shareLoading ? 'Génération...' : 'Générer un lien de partage'}
          </button>
        ) : null}
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Invitation</h2>
        <button onClick={handleGenerateInvite} disabled={loadingInvite}
          className="text-sm bg-salmon text-white px-4 py-2 rounded-lg hover:bg-sage transition-colors disabled:opacity-50">
          {loadingInvite ? 'Génération...' : "Générer un lien d'invitation"}
        </button>
        {inviteError && <p className="mt-2 text-xs text-red-500">{inviteError}</p>}
        {inviteUrl && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-600 truncate max-w-xs">{inviteUrl}</span>
            <button onClick={handleCopy} className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition-colors shrink-0">
              {copied ? 'Copié !' : copyFailed ? 'Erreur' : 'Copier'}
            </button>
          </div>
        )}
      </section>

      <hr className="my-6 border-gray-100" />

      <button onClick={handleLogout} className="text-sm bg-salmon text-white px-4 py-2 rounded-lg hover:bg-sage transition-colors">
        Déconnexion
      </button>
    </div>
  );
}
