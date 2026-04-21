import { useState, useEffect, useCallback } from 'react';
import { useParams, useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Gift, User } from '../types';
import { useAuth } from '../hooks/useAuth';
import GiftList from '../components/gifts/GiftList';
import { AppShellContext } from '../components/layout/AppShell';
import AddGiftForm from '../components/gifts/AddGiftForm';

const PALETTE = ['#FFD2B3', '#F5CD69', '#A7D49B', '#66B1B0', '#C4B7E8', '#E892A7', '#F88C85', '#98CBE9'];
function colorForId(id: string) {
  const h = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[h % PALETTE.length];
}
function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2);
}

function BackIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5 8 12l7 7"/></svg>;
}
function ShareIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M6 13v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"/></svg>;
}
function SparkleIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.4 5.4 1.8-5.4 1.8L12 16.4l-1.8-5.4L4.8 9.2l5.4-1.8z" opacity=".9"/><circle cx="19" cy="18" r="1.5"/><circle cx="5" cy="19" r="1"/></svg>;
}
function EyeOffIcon({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18"/><path d="M10.6 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.5 4.2"/><path d="M6.4 7.6A17 17 0 0 0 2 12s3.5 6 10 6a9.7 9.7 0 0 0 4.3-.9"/><path d="M9.6 9.6a3 3 0 0 0 4.2 4.2"/></svg>;
}
function ChevronIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>;
}
function XIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
}
function LinkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>;
}
function CopyIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>;
}
function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>;
}

function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}/>
      <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[28px] transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
           style={{ boxShadow: '0 -20px 40px -20px rgba(0,0,0,.2)', maxHeight: '92%' }}>
        <div className="flex justify-center pt-3"><div className="w-10 h-1.5 rounded-full bg-black/10"/></div>
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h3 className="display text-[19px] font-bold" style={{ color: 'var(--ink)' }}>{title}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(31,27,23,0.06)', color: 'var(--ink-soft)' }} aria-label="Fermer"><XIcon/></button>
        </div>
        <div className="px-5 pb-8 overflow-y-auto" style={{ maxHeight: '75vh' }}>{children}</div>
      </div>
    </div>
  );
}

function ShareSheet({ open, onClose, shareToken, onGenerateToken, generating, onRevoke, revoking }: {
  open: boolean; onClose: () => void;
  shareToken: string | null | undefined;
  onGenerateToken: () => void;
  generating: boolean;
  onRevoke: () => void;
  revoking: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : null;
  const displayUrl = shareToken ? `${window.location.host}/share/${shareToken}` : null;

  const doCopy = async () => {
    if (!shareUrl) return;
    try { await navigator.clipboard.writeText(shareUrl); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Partager ma liste">
      {!shareToken ? (
        <div className="pt-4 flex flex-col items-center gap-4">
          <p className="text-[13px] text-center" style={{ color: 'var(--ink-soft)' }}>
            Génère un lien public pour que tes proches voient ta liste — même sans compte.
          </p>
          <button onClick={onGenerateToken} disabled={generating}
            className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'var(--active)' }}>
            {generating ? 'Génération…' : 'Générer un lien de partage'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mt-2 mb-4 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(31,27,23,0.05)' }}>
            <LinkIcon/>
            <span className="text-[12px] font-bold truncate" style={{ color: 'var(--ink)' }}>{displayUrl}</span>
          </div>

          <div className="rounded-2xl p-3.5 mb-3" style={{ background: 'rgba(165,200,191,0.15)', border: '1px solid rgba(165,200,191,0.35)' }}>
            <div className="text-[12px] font-bold mb-1.5" style={{ color: 'var(--active)' }}>Qui peut voir ta liste ?</div>
            <ul className="text-[12px] leading-relaxed space-y-0.5" style={{ color: 'var(--ink-soft)' }}>
              <li>• Tes proches, s'ils sont déjà sur Nudge.</li>
              <li>• Toute personne avec ce lien, sans compte.</li>
              <li className="font-semibold" style={{ color: 'var(--ink)' }}>• Toi, tu ne verras jamais qui a réservé quoi.</li>
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <button onClick={doCopy} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl active:scale-[0.97]"
                    style={{ background: 'rgba(31,27,23,0.07)', color: 'var(--ink)' }}>
              {copied ? <CheckIcon/> : <CopyIcon/>}
              <span className="text-[11px] font-bold">{copied ? 'Copié' : 'Copier'}</span>
            </button>
            <a href={shareUrl ? `sms:?body=${encodeURIComponent(shareUrl)}` : '#'}
               className="flex flex-col items-center gap-1.5 py-3 rounded-2xl active:scale-[0.97]"
               style={{ background: 'rgba(165,200,191,0.25)', color: 'var(--active)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-4 4v-4H6a2 2 0 0 1-2-2z"/></svg>
              <span className="text-[11px] font-bold">SMS</span>
            </a>
            <a href={shareUrl ? `https://wa.me/?text=${encodeURIComponent(shareUrl)}` : '#'}
               target="_blank" rel="noopener noreferrer"
               className="flex flex-col items-center gap-1.5 py-3 rounded-2xl active:scale-[0.97]"
               style={{ background: 'rgba(37,211,102,0.15)', color: '#128C7E' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-4 4v-4H6a2 2 0 0 1-2-2z"/></svg>
              <span className="text-[11px] font-bold">WhatsApp</span>
            </a>
          </div>

          <div className="border-t pt-4" style={{ borderColor: 'var(--line)' }}>
            {confirmRevoke ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>Révoquer ce lien ?</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setConfirmRevoke(false)} className="text-[12px] font-bold" style={{ color: 'var(--ink-mute)' }}>Annuler</button>
                  <button onClick={() => { onRevoke(); setConfirmRevoke(false); }} disabled={revoking}
                    className="text-[12px] font-bold disabled:opacity-50" style={{ color: '#B85563' }}>
                    {revoking ? 'Révocation…' : 'Révoquer'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmRevoke(true)}
                className="w-full text-center text-[12px] font-bold py-1"
                style={{ color: 'var(--ink-mute)' }}>
                Révoquer le lien de partage
              </button>
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}

export default function GiftListPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { setCloseHandler, notifyDrawerOpen, setViewingUserId } = useOutletContext<AppShellContext>();
  const isOwnList = user?.id === userId;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'own' | 'secret' | 'suggestion'>('own');
  const [giftFormState, setGiftFormState] = useState({ canSubmit: false, isPending: false });
  const [shareOpen, setShareOpen] = useState(false);
  const [shareToken, setShareToken] = useState<string | null | undefined>(undefined);
  const [shareGenerating, setShareGenerating] = useState(false);
  const [shareRevoking, setShareRevoking] = useState(false);
  const [activeTab, setActiveTab] = useState<'wishlist' | 'secret'>('wishlist');

  const targetUser =
    queryClient.getQueryData<User[]>(['family'])?.find((u) => u.id === userId) ??
    queryClient.getQueryData<User[]>(['friends'])?.find((u) => u.id === userId);

  const { data: gifts, isLoading } = useQuery<Gift[]>({
    queryKey: ['gifts', userId],
    queryFn: () => apiClient.get(`/users/${userId}/gifts`).then((r) => r.data),
    enabled: !!userId,
  });

  useEffect(() => {
    if (!isOwnList && userId) setViewingUserId(userId);
    else setViewingUserId(null);
    return () => setViewingUserId(null);
  }, [userId, isOwnList, setViewingUserId]);

  useEffect(() => {
    if (shareOpen || !isOwnList) return;
    apiClient.get<{ shareToken: string | null }>('/users/share-token')
      .then((r) => setShareToken(r.data.shareToken))
      .catch(() => setShareToken(null));
  }, [isOwnList, shareOpen]);

  const openDrawer = useCallback((mode: 'own' | 'secret' | 'suggestion') => {
    setDrawerMode(mode);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  useEffect(() => {
    const addIdea = searchParams.get('addIdea') === 'true';
    const addSecret = searchParams.get('addSecret') === 'true';
    if (addIdea && isOwnList) { openDrawer('own'); setSearchParams({}, { replace: true }); }
    if (addSecret && !isOwnList) { openDrawer('secret'); setSearchParams({}, { replace: true }); }
  }, [searchParams, isOwnList, openDrawer, setSearchParams]);

  useEffect(() => {
    setCloseHandler(() => closeDrawer);
    notifyDrawerOpen(isDrawerOpen);
  }, [setCloseHandler, notifyDrawerOpen, closeDrawer, isDrawerOpen]);

  useEffect(() => {
    return () => { setCloseHandler(null); notifyDrawerOpen(false); };
  }, [setCloseHandler, notifyDrawerOpen]);

  const handleGenerateShareToken = async () => {
    setShareGenerating(true);
    try {
      const { data } = await apiClient.post<{ shareToken: string }>('/users/share-token');
      setShareToken(data.shareToken);
    } finally {
      setShareGenerating(false);
    }
  };

  const handleRevokeShareToken = async () => {
    setShareRevoking(true);
    try {
      await apiClient.delete('/users/share-token');
      setShareToken(null);
    } finally {
      setShareRevoking(false);
    }
  };

  const visibleGifts = (gifts ?? []).filter((g) => !g.secret);
  const secretGifts = (gifts ?? []).filter((g) => g.secret);
  const displayedGifts = !isOwnList && activeTab === 'secret' ? secretGifts : visibleGifts;

  const targetName = targetUser?.name?.split(' ')[0] ?? 'cette personne';
  const avatarColor = targetUser ? (() => {
    const palette = ['#FFD2B3', '#F5CD69', '#A7D49B', '#66B1B0', '#C4B7E8', '#E892A7', '#F88C85', '#98CBE9'];
    const h = (targetUser.id ?? '').split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
    return palette[h % palette.length];
  })() : '#EED7CF';

  return (
    <div className="pt-2 pb-4">
      {!isOwnList ? (
        <>
          <div className="px-5 pt-3 pb-2 flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center transition active:scale-95 shrink-0"
                    style={{ color: 'var(--ink-soft)' }} aria-label="Retour">
              <BackIcon/>
            </button>
            <h1 className="display text-[24px] font-black flex-1 truncate" style={{ color: 'var(--ink)' }}>Liste de {targetName}</h1>
            <div className="text-[11px] font-bold shrink-0" style={{ color: 'var(--ink-soft)' }}>{visibleGifts.length} cadeau{visibleGifts.length > 1 ? 'x' : ''}</div>
          </div>

          <div className="px-5 mt-3 flex gap-5 border-b" style={{ borderColor: 'var(--line)' }}>
            {([['wishlist', 'Sa liste', visibleGifts.length], ['secret', 'Tes surprises', secretGifts.length]] as const).map(([k, label, count]) => (
              <button key={k} onClick={() => setActiveTab(k)} className="relative pb-2.5 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[13px] ${activeTab === k ? 'font-black' : 'font-bold'}`} style={{ color: activeTab === k ? 'var(--ink)' : 'var(--ink-mute)' }}>{label}</span>
                  <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5`} style={{ background: activeTab === k ? 'var(--active)' : 'rgba(31,27,23,0.06)', color: activeTab === k ? '#fff' : 'var(--ink-soft)' }}>{count}</span>
                </div>
                {activeTab === k && <div className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full" style={{ background: 'var(--active)' }}/>}
              </button>
            ))}
          </div>

          {activeTab === 'secret' && (
            <div className="mx-5 mt-4 rounded-2xl p-3.5" style={{ background: 'rgba(233,172,178,0.15)', border: '1px solid rgba(233,172,178,0.35)' }}>
              <div className="flex items-center gap-2 text-[12px] font-bold mb-1" style={{ color: '#B85563' }}><EyeOffIcon/> Zone cachée</div>
              <div className="text-[12px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                Ces idées n'apparaissent pas dans la liste de {targetName}. Seul·e·s les autres proches les voient pour éviter les doublons.
              </div>
            </div>
          )}

          <div className="px-5 mt-3 flex flex-col gap-2.5">
            {isLoading ? (
              <div className="text-center py-8 text-sm font-semibold" style={{ color: 'var(--ink-mute)' }}>Chargement…</div>
            ) : (
              <>
                <GiftList gifts={displayedGifts} forUserId={userId!} isOwnList={false}/>
                {displayedGifts.length === 0 && (
                  <div className="text-center py-6 text-[13px]" style={{ color: 'var(--ink-soft)' }}>
                    {activeTab === 'secret' ? "Aucune surprise pour l\u2019instant." : 'Aucun cadeau pour le moment.'}
                  </div>
                )}
                <button
                  onClick={() => openDrawer(activeTab === 'secret' ? 'secret' : 'suggestion')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition active:scale-[0.99] mt-1"
                  style={activeTab === 'secret'
                    ? { background: 'rgba(233,172,178,0.2)', color: '#B85563', border: '1.5px dashed rgba(233,172,178,0.7)' }
                    : { background: 'rgba(165,200,191,0.2)', color: 'var(--active)', border: '1.5px dashed rgba(165,200,191,0.7)' }
                  }
                >
                  {activeTab === 'secret' ? <><SparkleIcon/> Ajouter une surprise</> : '+ Suggérer un cadeau'}
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="px-5 pt-3 pb-2 flex items-end justify-between gap-3">
            <div>
              <h1 className="display text-[28px] font-black leading-tight" style={{ color: 'var(--ink)' }}>Ma liste</h1>
              {gifts && <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>{gifts.length} cadeau{gifts.length > 1 ? 'x' : ''} · visible par tes proches</p>}
            </div>
            <button onClick={() => setShareOpen(true)} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(238,215,207,0.35)', color: 'var(--ink)' }} aria-label="Partager">
              <ShareIcon/>
            </button>
          </div>

          {(gifts ?? []).length <= 3 && (
            <div className="mx-5 mt-2 rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(165,200,191,0.18)', border: '1px solid rgba(165,200,191,0.35)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--sage)' }}>
                <ShareIcon/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold" style={{ color: 'var(--ink)' }}>Partage ta liste</div>
                <div className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>Envoie le lien à ceux qui ne sont pas encore sur Nudge.</div>
              </div>
              <button onClick={() => setShareOpen(true)} className="text-[12px] font-bold px-3 py-1.5 rounded-full text-white shrink-0" style={{ background: 'var(--active)' }}>
                Partager
              </button>
            </div>
          )}

          <div className="px-5 mt-4 flex flex-col gap-2.5">
            {isLoading ? (
              <div className="text-center py-8 text-sm font-semibold" style={{ color: 'var(--ink-mute)' }}>Chargement…</div>
            ) : (gifts ?? []).length === 0 ? (
              <div className="text-center py-10">
                <div className="text-[14px] font-bold mb-1" style={{ color: 'var(--ink)' }}>Ta liste est vide.</div>
                <div className="text-[12px] mb-4" style={{ color: 'var(--ink-soft)' }}>Ajoute un premier cadeau — tes proches pourront le réserver.</div>
                <button onClick={() => openDrawer('own')} className="px-5 py-3.5 rounded-2xl font-bold text-white" style={{ background: 'var(--sage)' }}>
                  Ajouter un cadeau
                </button>
              </div>
            ) : (
              <GiftList gifts={gifts ?? []} forUserId={userId!} isOwnList={true}/>
            )}
          </div>
        </>
      )}

      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40" onClick={closeDrawer}/>
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[28px] transition-transform duration-300 flex flex-col ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
             style={{ boxShadow: '0 -20px 40px -20px rgba(0,0,0,.2)', maxHeight: '92%' }}>
          <div className="flex justify-center pt-3 shrink-0"><div className="w-10 h-1.5 rounded-full bg-black/10"/></div>
          <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
            <h3 className="display text-[19px] font-bold" style={{ color: 'var(--ink)' }}>
              {drawerMode === 'secret' ? `Idée surprise pour ${targetName}` : drawerMode === 'suggestion' ? `Suggérer à ${targetName}` : 'Ajouter à ma liste'}
            </h3>
            <button onClick={closeDrawer} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(31,27,23,0.06)', color: 'var(--ink-soft)' }} aria-label="Fermer">
              <XIcon/>
            </button>
          </div>
          <div className="px-5 overflow-y-auto flex-1">
            <VisibilityBanner mode={drawerMode} targetName={targetName}/>
            <AddGiftForm
              formId="add-gift-form"
              forUserId={drawerMode === 'own' ? user?.id ?? '' : userId!}
              mode={drawerMode === 'secret' ? 'secret' : 'own'}
              secret={drawerMode === 'secret'}
              onSuccess={closeDrawer}
              onStateChange={setGiftFormState}
            />
          </div>
          <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid var(--line)' }}>
            <button
              type="submit"
              form="add-gift-form"
              disabled={!giftFormState.canSubmit || giftFormState.isPending}
              className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
              style={{ background: drawerMode === 'secret' ? 'var(--salmon)' : 'var(--sage)' }}
            >
              {giftFormState.isPending ? 'Ajout…' : drawerMode === 'secret' ? 'Ajouter en secret' : drawerMode === 'suggestion' ? 'Suggérer' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>

      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} shareToken={shareToken ?? null} onGenerateToken={handleGenerateShareToken} generating={shareGenerating} onRevoke={handleRevokeShareToken} revoking={shareRevoking}/>
    </div>
  );
}

function VisibilityBanner({ mode, targetName }: { mode: 'own' | 'secret' | 'suggestion'; targetName: string }) {
  if (mode === 'secret') return (
    <div className="rounded-2xl p-3.5 mb-4 flex gap-3" style={{ background: 'rgba(233,172,178,0.15)', border: '1px solid rgba(233,172,178,0.4)' }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--salmon)' }}>
        <EyeOffIcon size={16}/>
      </div>
      <div className="flex-1 min-w-0 text-[12px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        <div className="text-[13px] font-bold mb-0.5" style={{ color: '#B85563' }}>{targetName} ne verra pas cette idée.</div>
        Les autres proches la verront pour éviter les doublons.
      </div>
    </div>
  );
  if (mode === 'suggestion') return (
    <div className="rounded-2xl p-3.5 mb-4 flex gap-3" style={{ background: 'rgba(165,200,191,0.18)', border: '1px solid rgba(165,200,191,0.4)' }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--sage)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
      </div>
      <div className="flex-1 min-w-0 text-[12px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        <div className="text-[13px] font-bold mb-0.5" style={{ color: 'var(--active)' }}>{targetName} pourra voir cette idée.</div>
        Elle apparaîtra dans sa liste — elle pourra la garder ou la supprimer.
      </div>
    </div>
  );
  return (
    <div className="rounded-2xl p-3.5 mb-4 flex gap-3" style={{ background: 'rgba(165,200,191,0.18)', border: '1px solid rgba(165,200,191,0.4)' }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--sage)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
      </div>
      <div className="flex-1 min-w-0 text-[12px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        <div className="text-[13px] font-bold mb-0.5" style={{ color: 'var(--active)' }}>Visible par ta famille et tes amis.</div>
        Ils pourront réserver ce cadeau — sans que toi, tu ne saches lequel a été pris.
      </div>
    </div>
  );
}