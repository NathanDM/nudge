import { useState, useCallback } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import BottomNav from './BottomNav';
import InstallBanner from './InstallBanner';
import apiClient from '../../api/client';

export type AppShellContext = {
  setCloseHandler: (handler: (() => void) | null) => void;
  notifyDrawerOpen: (open: boolean) => void;
  setViewingUserId: (id: string | null) => void;
  openInvitePicker: (contactType?: 'family' | 'friend') => void;
  openAddChild: () => void;
};

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}

function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}/>
      <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[28px] transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
           style={{ boxShadow: '0 -20px 40px -20px rgba(0,0,0,.2)', maxHeight: '92%' }}>
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1.5 rounded-full bg-black/10"/>
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h3 className="display text-[19px] font-bold" style={{ color: 'var(--ink)' }}>{title}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(31,27,23,0.06)', color: 'var(--ink-soft)' }} aria-label="Fermer">
            <XIcon/>
          </button>
        </div>
        <div className="px-5 pb-8 overflow-y-auto phone-scroll" style={{ maxHeight: '75vh' }}>
          {children}
        </div>
      </div>
    </div>
  );
}


function CopyIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
}
function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
}
function SmsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-4 4v-4H6a2 2 0 0 1-2-2z"/></svg>;
}

function InvitePickerSheet({ open, onClose, contactType }: { open: boolean; onClose: () => void; contactType: 'family' | 'friend' }) {
  const [phone, setPhone] = useState('');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const queryClient = useQueryClient();

  const handleClose = () => {
    setPhone('');
    setInviteUrl(null);
    setCopied(false);
    onClose();
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (p: string) => apiClient.post('/users/contacts', { phone: p, contactType }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      handleClose();
    },
    onError: async () => {
      setGeneratingLink(true);
      try {
        const { data } = await apiClient.post<{ token: string }>('/invitations');
        setInviteUrl(`${window.location.origin}/join/${data.token}`);
      } finally {
        setGeneratingLink(false);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(phone);
  };

  const doCopy = async () => {
    if (!inviteUrl) return;
    try { await navigator.clipboard.writeText(inviteUrl); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Sheet open={open} onClose={handleClose} title="Inviter un proche">
      {inviteUrl ? (
        <div className="pt-2 flex flex-col gap-4">
          <div className="rounded-2xl p-3.5" style={{ background: 'rgba(238,215,207,0.3)', border: '1px solid rgba(238,215,207,0.7)' }}>
            <div className="text-[13px] font-bold mb-0.5" style={{ color: 'var(--ink)' }}>Numéro non trouvé sur Nudge</div>
            <div className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>Envoie-leur ce lien pour les inviter à rejoindre l'appli.</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={doCopy} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl active:scale-[0.97]"
                    style={{ background: 'rgba(31,27,23,0.07)', color: 'var(--ink)' }}>
              {copied ? <CheckIcon/> : <CopyIcon/>}
              <span className="text-[11px] font-bold">{copied ? 'Copié' : 'Copier'}</span>
            </button>
            <a href={`sms:?body=${encodeURIComponent(inviteUrl)}`}
               className="flex flex-col items-center gap-1.5 py-3 rounded-2xl active:scale-[0.97]"
               style={{ background: 'rgba(165,200,191,0.25)', color: 'var(--active)' }}>
              <SmsIcon/>
              <span className="text-[11px] font-bold">SMS</span>
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent(inviteUrl)}`}
               target="_blank" rel="noopener noreferrer"
               className="flex flex-col items-center gap-1.5 py-3 rounded-2xl active:scale-[0.97]"
               style={{ background: 'rgba(37,211,102,0.15)', color: '#128C7E' }}>
              <SmsIcon/>
              <span className="text-[11px] font-bold">WhatsApp</span>
            </a>
          </div>
          <button onClick={() => setInviteUrl(null)}
            className="text-[12px] font-semibold text-center py-1"
            style={{ color: 'var(--ink-mute)' }}>
            Essayer un autre numéro
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
          <div>
            <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--ink)' }}>Numéro de téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="w-full rounded-xl px-3.5 py-3 text-[14px] bg-white outline-none focus:ring-2 focus:ring-blush"
              style={{ border: '1.5px solid rgba(238,215,207,0.6)' }}
              autoFocus
            />
            <p className="text-[11px] mt-1" style={{ color: 'var(--ink-soft)' }}>S'ils sont déjà sur Nudge, ça les ajoute directement.</p>
          </div>
          <button type="submit" disabled={!phone || isPending || generatingLink}
            className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'var(--active)' }}>
            {isPending || generatingLink ? 'Recherche…' : 'Continuer'}
          </button>
        </form>
      )}
    </Sheet>
  );
}

function AddChildSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (n: string) => apiClient.post('/users/children', { name: n }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['family'] });
      setName('');
      setError('');
      onClose();
    },
    onError: (err: any) => setError(err?.response?.status === 409 ? 'Un enfant avec ce prénom existe déjà' : 'Erreur, réessayez'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutate(name);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Ajouter un enfant">
      <div className="rounded-2xl p-3.5 mb-4 flex gap-3 pt-2" style={{ background: 'rgba(245,205,105,0.2)', border: '1px solid rgba(245,205,105,0.4)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-base" style={{ background: '#F5CD69' }}>
          <HeartIcon/>
        </div>
        <div className="flex-1 text-[12px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          <div className="text-[13px] font-bold mb-0.5" style={{ color: 'var(--ink)' }}>Pour les tout-petits.</div>
          Tu gères sa liste à sa place. Les autres proches pourront y ajouter des idées.
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--ink)' }}>Prénom de l'enfant</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Léa"
            className="w-full rounded-xl px-3.5 py-3 text-[14px] bg-white outline-none focus:ring-2 focus:ring-blush"
            style={{ border: '1.5px solid rgba(238,215,207,0.6)' }}
            autoFocus
          />
          {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
        </div>
        <button type="submit" disabled={!name || isPending}
          className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'var(--salmon)' }}>
          {isPending ? 'Création...' : 'Créer'}
        </button>
      </form>
    </Sheet>
  );
}

export default function AppShell() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [closeHandler, setCloseHandlerState] = useState<(() => void) | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewingUserId, setViewingUserIdState] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteContactType, setInviteContactType] = useState<'family' | 'friend'>('friend');
  const [childOpen, setChildOpen] = useState(false);

  const setCloseHandler = useCallback((handler: (() => void) | null) => {
    setCloseHandlerState(() => handler);
  }, []);

  const setViewingUserId = useCallback((id: string | null) => {
    setViewingUserIdState(id);
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const context: AppShellContext = {
    setCloseHandler,
    notifyDrawerOpen: setDrawerOpen,
    setViewingUserId,
    openInvitePicker: (ct = 'friend') => { setInviteContactType(ct); setInviteOpen(true); },
    openAddChild: () => setChildOpen(true),
  };

  const handleFabClick = () => {
    if (drawerOpen && closeHandler) { closeHandler(); return; }
    navigate(`/user/${user?.id}?addIdea=true`);
  };

  const isNavOpen = drawerOpen;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--sand)' }}>
      <main className="max-w-4xl mx-auto">
        <Outlet context={context} />
      </main>
      <InstallBanner />
      <BottomNav drawerOpen={isNavOpen} onFabClick={handleFabClick} />
      <InvitePickerSheet open={inviteOpen} onClose={() => setInviteOpen(false)} contactType={inviteContactType} />
      <AddChildSheet open={childOpen} onClose={() => setChildOpen(false)} />
    </div>
  );
}
