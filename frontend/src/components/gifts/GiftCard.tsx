import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Gift } from '../../types';

interface Props {
  gift: Gift;
  forUserId: string;
  isOwnList: boolean;
}

function colorForName(name: string) {
  const palette = ['#FFD2B3', '#F5CD69', '#A7D49B', '#66B1B0', '#C4B7E8', '#E892A7', '#F88C85', '#98CBE9'];
  const h = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return palette[h % palette.length];
}

function GiftThumb({ gift }: { gift: Gift }) {
  return (
    <div className="rounded-2xl shrink-0 flex items-center justify-center overflow-hidden relative"
         style={{ width: 76, height: 76, background: 'var(--sand)', border: '1px solid rgba(31,27,23,0.04)' }}>
      {gift.ogImageUrl ? (
        <img src={gift.ogImageUrl} alt="" className="w-full h-full object-cover"/>
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: `${colorForName(gift.id)}44` }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18"/>
            <path d="M7.5 9a2.5 2.5 0 1 1 0-5C10 4 12 6 12 9M16.5 9a2.5 2.5 0 1 0 0-5C14 4 12 6 12 9"/>
          </svg>
        </div>
      )}
    </div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: 'sage' | 'salmon' | 'gray' | 'active' }) {
  const styles = {
    active: { bg: '#2D8C85', fg: '#fff' },
    sage: { bg: 'rgba(165,200,191,0.35)', fg: '#2D8C85' },
    salmon: { bg: 'rgba(233,172,178,0.3)', fg: '#B85563' },
    gray: { bg: 'rgba(31,27,23,0.06)', fg: 'var(--ink-soft)' },
  };
  const s = styles[tone];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: s.bg, color: s.fg }}>
      {children}
    </span>
  );
}

function CheckIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>;
}

function LockIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;
}

function EyeOffIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18"/><path d="M10.6 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.5 4.2"/><path d="M6.4 7.6A17 17 0 0 0 2 12s3.5 6 10 6a9.7 9.7 0 0 0 4.3-.9"/><path d="M9.6 9.6a3 3 0 0 0 4.2 4.2"/></svg>;
}

function EyeIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function TrashIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/></svg>;
}

function XIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
}

function detectAxis(dx: number, dy: number): 'horizontal' | 'vertical' | 'none' {
  if (Math.abs(dx) <= 5 && Math.abs(dy) <= 5) return 'none';
  return Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
}

const ZONE_WIDTH = 160;

function useSwipeDelete(enabled: boolean) {
  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const axis = useRef<'horizontal' | 'vertical' | 'none'>('none');

  const close = () => setOffsetX(0);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    axis.current = 'none';
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!enabled) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (axis.current === 'none') axis.current = detectAxis(dx, dy);
    if (axis.current !== 'horizontal' || dx >= 0) return;
    setOffsetX(Math.max(-ZONE_WIDTH, dx));
  };

  const onTouchEnd = () => {
    setDragging(false);
    if (offsetX < -ZONE_WIDTH / 2) setOffsetX(-ZONE_WIDTH);
    else close();
  };

  return { offsetX, dragging, isOpen: offsetX <= -ZONE_WIDTH, onTouchStart, onTouchMove, onTouchEnd, close };
}

export default function GiftCard({ gift, forUserId, isOwnList }: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/gifts/${gift.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gifts', forUserId] }),
  });
  const claimMutation = useMutation({
    mutationFn: () => apiClient.patch(`/gifts/${gift.id}/claim`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gifts', forUserId] }),
  });
  const unclaimMutation = useMutation({
    mutationFn: () => apiClient.patch(`/gifts/${gift.id}/unclaim`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gifts', forUserId] }),
  });
  const releaseAnonMutation = useMutation({
    mutationFn: () => apiClient.delete(`/users/gifts/${gift.id}/anonymous-claim`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gifts', forUserId] }),
  });

  const swipe = useSwipeDelete(gift.canDelete);
  const priceDisplay = gift.price ? `${(gift.price / 100).toFixed(0)}\u202f€` : null;
  const claimedByOther = !!gift.claimedByUserId && !gift.canUnclaim;

  const handleCardClick = () => {
    if (swipe.isOpen) { swipe.close(); return; }
    if (gift.url) window.open(gift.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative overflow-hidden rounded-[22px]" style={{ boxShadow: '0 1px 2px rgba(31,27,23,.04), 0 8px 20px -16px rgba(31,27,23,.2)', border: '1px solid var(--line)' }}>
      {gift.canDelete && (
        <div className="absolute inset-y-0 right-0 w-40 flex">
          <button
            className="flex-1 flex flex-col items-center justify-center gap-1 hover:bg-gray-200 transition-colors"
            style={{ background: 'rgba(31,27,23,0.08)', color: 'var(--ink-soft)' }}
            onClick={(e) => { e.stopPropagation(); swipe.close(); }}
          >
            <XIcon/>
            <span className="text-xs font-semibold">Annuler</span>
          </button>
          <button
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-red-400 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); swipe.close(); }}
            disabled={deleteMutation.isPending}
          >
            <TrashIcon/>
            <span className="text-xs font-semibold">Supprimer</span>
          </button>
        </div>
      )}

      <div
        style={{ transform: `translateX(${swipe.offsetX}px)`, transition: swipe.dragging ? 'none' : 'transform 200ms ease' }}
        className={`bg-white ${claimedByOther ? 'opacity-55' : ''} ${gift.url || swipe.isOpen ? 'cursor-pointer' : ''}`}
        onClick={handleCardClick}
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={swipe.onTouchEnd}
      >
        <button onClick={handleCardClick} className="w-full flex gap-3.5 p-3.5 text-left">
          <GiftThumb gift={gift}/>
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="display font-bold text-[15px] leading-tight pr-1" style={{ color: 'var(--ink)' }}>{gift.title}</h3>
              {priceDisplay && <span className="font-black text-[14px] shrink-0" style={{ color: 'var(--active)' }}>{priceDisplay}</span>}
            </div>
            {gift.description && (
              <p className="text-[12px] leading-relaxed mt-1 line-clamp-2" style={{ color: 'var(--ink-soft)' }}>{gift.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {gift.canUnclaim && <Pill tone="active"><CheckIcon/> Tu l'as réservé</Pill>}
              {claimedByOther && <Pill tone="gray"><LockIcon/> Déjà réservé</Pill>}
              {!isOwnList && !gift.canUnclaim && !claimedByOther && gift.canClaim && <Pill tone="sage">Disponible</Pill>}
            </div>
          </div>
        </button>

        <div className="flex items-center justify-between gap-2 px-3.5 pb-3.5 -mt-1" onClick={(e) => e.stopPropagation()}>
          {!isOwnList ? (
            <GuestFooter
              gift={gift} claimedByOther={claimedByOther}
              onClaim={() => claimMutation.mutate()} onUnclaim={() => unclaimMutation.mutate()}
              claimPending={claimMutation.isPending} unclaimPending={unclaimMutation.isPending}
            />
          ) : (
            <OwnerFooter gift={gift} forUserId={forUserId} onRelease={() => releaseAnonMutation.mutate()} releasePending={releaseAnonMutation.isPending}/>
          )}
        </div>
      </div>
    </div>
  );
}

function GuestFooter({ gift, claimedByOther, onClaim, onUnclaim, claimPending, unclaimPending }: {
  gift: Gift; claimedByOther: boolean;
  onClaim: () => void; onUnclaim: () => void;
  claimPending: boolean; unclaimPending: boolean;
}) {
  const color = colorForName(gift.addedByName);
  return (
    <>
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
             style={{ background: color }}>{gift.addedByName[0]?.toUpperCase() ?? '?'}</div>
        <span className="text-[11px] truncate" style={{ color: 'var(--ink-soft)' }}>Ajouté par {gift.addedByName}</span>
      </div>
      {gift.canClaim && !gift.canUnclaim && !claimedByOther && (
        <button onClick={onClaim} disabled={claimPending}
          className="flex items-center gap-1.5 text-white rounded-full px-3.5 py-1.5 text-[12px] font-bold active:scale-95 disabled:opacity-50"
          style={{ background: 'var(--active)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18"/><path d="M7.5 9a2.5 2.5 0 1 1 0-5C10 4 12 6 12 9M16.5 9a2.5 2.5 0 1 0 0-5C14 4 12 6 12 9"/></svg>
          Réserver
        </button>
      )}
      {gift.canUnclaim && (
        <button onClick={onUnclaim} disabled={unclaimPending}
          className="rounded-full px-3.5 py-1.5 text-[12px] font-bold active:scale-95 disabled:opacity-50"
          style={{ background: 'rgba(238,215,207,0.45)', color: '#8A5A4A' }}>
          Libérer
        </button>
      )}
      {claimedByOther && (
        <span className="text-[11px] font-medium" style={{ color: 'var(--ink-mute)' }}>Quelqu'un s'en occupe</span>
      )}
    </>
  );
}

function OwnerFooter({ gift, forUserId, onRelease, releasePending }: { gift: Gift; forUserId: string; onRelease: () => void; releasePending: boolean }) {
  const addedByOther = gift.addedByUserId !== forUserId;
  const color = colorForName(gift.addedByName);

  if (gift.claimedByName)
    return (
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--ink-soft)' }}>
        <EyeOffIcon/> Réservé par {gift.claimedByName}
      </div>
    );

  if (gift.claimedAnonymously)
    return (
      <>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--ink-soft)' }}>
          <EyeOffIcon/> Quelqu'un s'en occupe (anonyme)
        </div>
        <button onClick={onRelease} disabled={releasePending}
          className="text-[11px] font-bold disabled:opacity-50" style={{ color: '#B85563' }}>
          Libérer
        </button>
      </>
    );

  if (addedByOther)
    return (
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--ink-soft)' }}>
        <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
             style={{ background: color }}>{gift.addedByName[0]?.toUpperCase() ?? '?'}</div>
        Suggéré par {gift.addedByName}
      </div>
    );

  return (
    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--ink-soft)' }}>
      <EyeIcon/> Visible par ta famille
    </div>
  );
}
