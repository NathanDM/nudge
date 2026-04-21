import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import { User } from '../types';
import { AppShellContext } from '../components/layout/AppShell';

const PALETTE = ['#FFD2B3', '#F5CD69', '#A7D49B', '#66B1B0', '#C4B7E8', '#E892A7', '#F88C85', '#98CBE9'];
function colorForId(id: string) {
  const h = id.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
  return PALETTE[h % PALETTE.length];
}
function getInitials(name: string) {
  return name.split(' ').map((n: string) => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2);
}

function ShareIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M6 13v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"/></svg>;
}
function PlusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function ChevronIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/></svg>;
}

function ChildRow({ child }: { child: User }) {
  const [confirming, setConfirming] = useState(false);
  const [birthdate, setBirthdate] = useState(child.birthdate ?? '');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: () => apiClient.delete(`/users/children/${child.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['family'] });
      setConfirming(false);
    },
  });

  const handleBirthdateChange = (value: string) => {
    setBirthdate(value);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      apiClient.patch(`/users/children/${child.id}`, { birthdate: value || null });
    }, 600);
  };

  return (
    <div className="flex items-center gap-3 p-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
           style={{ background: colorForId(child.id) }}>
        {getInitials(child.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold truncate" style={{ color: 'var(--ink)' }}>{child.name}</div>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => handleBirthdateChange(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          className="text-[11px] font-semibold bg-transparent outline-none mt-0.5"
          style={{ color: birthdate ? 'var(--ink-soft)' : 'var(--ink-mute)' }}
        />
      </div>
      {confirming ? (
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => mutate()} disabled={isPending} className="text-red-500 font-medium disabled:opacity-50">Oui</button>
          <span style={{ color: 'rgba(31,27,23,0.15)' }}>|</span>
          <button onClick={() => setConfirming(false)} style={{ color: 'var(--ink-mute)' }}>Non</button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="p-2" style={{ color: 'var(--ink-mute)' }}>
          <TrashIcon/>
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { setCloseHandler, notifyDrawerOpen, openAddChild } = useOutletContext<AppShellContext>();
  const [shareToken, setShareToken] = useState<string | null | undefined>(undefined);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(() => sessionStorage.getItem('lastInviteUrl'));
  const [inviteCopied, setInviteCopied] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);

  useEffect(() => {
    setCloseHandler(null);
    notifyDrawerOpen(false);
    return () => { setCloseHandler(null); notifyDrawerOpen(false); };
  }, [setCloseHandler, notifyDrawerOpen]);

  const { data: children = [] } = useQuery<User[]>({
    queryKey: ['children'],
    queryFn: () => apiClient.get('/users/children').then((r) => r.data),
  });

  const { data: profile } = useQuery<{ birthdate: string | null }>({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
    enabled: !!user,
  });

  const [birthdate, setBirthdate] = useState('');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (profile?.birthdate) setBirthdate(profile.birthdate);
  }, [profile?.birthdate]);

  const handleBirthdateChange = (value: string) => {
    setBirthdate(value);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      apiClient.patch('/users/me', { birthdate: value || null });
    }, 600);
  };

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

  const handleCopyShareUrl = async () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/${shareToken}`;
    try { await navigator.clipboard.writeText(url); } catch {}
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleGenerateInvite = async () => {
    setLoadingInvite(true);
    try {
      const { data } = await apiClient.post<{ token: string }>('/invitations');
      const url = `${window.location.origin}/join/${data.token}`;
      setInviteUrl(url);
      sessionStorage.setItem('lastInviteUrl', url);
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;
    try { await navigator.clipboard.writeText(inviteUrl); } catch {}
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const avatarColor = user ? colorForId(user.id) : '#EED7CF';

  return (
    <div className="pt-2 pb-4">
      <div className="px-5 pt-3 pb-2">
        <h1 className="display text-[28px] font-black leading-tight" style={{ color: 'var(--ink)' }}>Mon profil</h1>
      </div>

      {user && (
        <div className="mx-5 mt-2 rounded-3xl overflow-hidden bg-white" style={{ border: '1px solid var(--line)', boxShadow: '0 1px 2px rgba(31,27,23,.04)' }}>
          <div className="p-4 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-[18px] font-bold text-white shrink-0"
                 style={{ background: avatarColor }}>
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-black" style={{ color: 'var(--ink)' }}>{user.name}</div>
              {user.phone && <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>{user.phone}</div>}
            </div>
          </div>
          <div className="h-px mx-4" style={{ background: 'var(--line)' }}/>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <div className="text-[12px] font-semibold mb-1" style={{ color: 'var(--ink-soft)' }}>Date de naissance</div>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => handleBirthdateChange(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="text-[14px] font-semibold w-full bg-transparent outline-none"
                style={{ color: birthdate ? 'var(--ink)' : 'var(--ink-mute)' }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mx-5 mt-3 rounded-3xl overflow-hidden bg-white" style={{ border: '1px solid var(--line)' }}>
        {shareToken ? (
          <button onClick={handleCopyShareUrl} className="w-full flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--active)' }}>
              <ShareIcon/>
            </div>
            <div className="flex-1 text-left">
              <div className="text-[14px] font-bold" style={{ color: 'var(--ink)' }}>Partager ma liste</div>
              <div className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>{shareCopied ? 'Lien copié !' : 'Lien, QR code, SMS…'}</div>
            </div>
            <ChevronIcon/>
          </button>
        ) : shareToken === null ? (
          <button onClick={handleGenerateShareToken} disabled={shareLoading} className="w-full flex items-center gap-3 p-4 disabled:opacity-50">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--active)' }}>
              <ShareIcon/>
            </div>
            <div className="flex-1 text-left">
              <div className="text-[14px] font-bold" style={{ color: 'var(--ink)' }}>Partager ma liste</div>
              <div className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>{shareLoading ? 'Génération…' : 'Générer un lien de partage'}</div>
            </div>
            <ChevronIcon/>
          </button>
        ) : null}

        <div className="h-px mx-4" style={{ background: 'var(--line)' }}/>

        <div>
          {inviteUrl ? (
            <button onClick={handleCopyInvite} className="w-full flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(238,215,207,0.5)', color: '#8A5A4A' }}>
                <PlusIcon/>
              </div>
              <div className="flex-1 text-left">
                <div className="text-[14px] font-bold" style={{ color: 'var(--ink)' }}>Inviter un proche</div>
                <div className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>{inviteCopied ? 'Lien copié !' : 'Copier le lien d\'invitation'}</div>
              </div>
              <ChevronIcon/>
            </button>
          ) : (
            <button onClick={handleGenerateInvite} disabled={loadingInvite} className="w-full flex items-center gap-3 p-4 disabled:opacity-50">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(238,215,207,0.5)', color: '#8A5A4A' }}>
                <PlusIcon/>
              </div>
              <div className="flex-1 text-left">
                <div className="text-[14px] font-bold" style={{ color: 'var(--ink)' }}>Inviter un proche</div>
                <div className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>{loadingInvite ? 'Génération…' : 'Pour partager vos listes'}</div>
              </div>
              <ChevronIcon/>
            </button>
          )}
        </div>
      </div>

      <div className="px-5 flex items-baseline justify-between mt-5 mb-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--ink-soft)' }}>Mes enfants</div>
        <div className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>{children.length > 0 ? `${children.length} enfant${children.length > 1 ? 's' : ''}` : ''}</div>
      </div>
      <div className="mx-5 rounded-3xl overflow-hidden bg-white" style={{ border: '1px solid var(--line)' }}>
        {children.map((c, i) => (
          <div key={c.id}>
            {i > 0 && <div className="h-px mx-4" style={{ background: 'var(--line)' }}/>}
            <ChildRow child={c}/>
          </div>
        ))}
        {children.length > 0 && <div className="h-px mx-4" style={{ background: 'var(--line)' }}/>}
        <button onClick={openAddChild} className="w-full flex items-center gap-3 p-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(245,205,105,0.3)', color: '#8B6914' }}>
            <PlusIcon/>
          </div>
          <div className="flex-1 text-left">
            <div className="text-[14px] font-bold" style={{ color: 'var(--ink)' }}>Ajouter un enfant</div>
            <div className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>Gère sa liste à sa place</div>
          </div>
          <ChevronIcon/>
        </button>
      </div>

      <div className="px-5 mt-6">
        <button onClick={handleLogout} className="w-full text-center text-[13px] font-bold py-3" style={{ color: 'var(--salmon)' }}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
