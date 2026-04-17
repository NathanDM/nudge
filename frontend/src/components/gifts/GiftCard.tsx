import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Gift } from '../../types';

interface Props {
  gift: Gift;
  forUserId: string;
  isOwnList: boolean;
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-6 h-6 rounded-full bg-blush flex items-center justify-center text-xs font-semibold text-white shrink-0">
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  );
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
  const priceDisplay = gift.price ? `${(gift.price / 100).toFixed(0)}€` : null;
  const claimedByOther = !!gift.claimedByUserId && !gift.canUnclaim;

  const handleCardClick = () => {
    if (swipe.isOpen) { swipe.close(); return; }
    if (gift.url) window.open(gift.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-sm">
      {gift.canDelete && (
        <div className="absolute inset-y-0 right-0 w-40 flex">
          <button
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
            onClick={(e) => { e.stopPropagation(); swipe.close(); }}
          >
            <XIcon />
            <span className="text-xs font-medium">Annuler</span>
          </button>
          <button
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-red-400 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); swipe.close(); }}
            disabled={deleteMutation.isPending}
          >
            <TrashIcon />
            <span className="text-xs font-medium">Supprimer</span>
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
        <div className="flex gap-4 p-4">
          <div className="w-20 h-20 rounded-xl shrink-0 overflow-hidden bg-sand">
            {gift.ogImageUrl && (
              <img src={gift.ogImageUrl} alt="" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm leading-snug">{gift.title}</h3>
              {priceDisplay && (
                <span className="text-active font-bold text-base shrink-0">{priceDisplay}</span>
              )}
            </div>

            {gift.description && (
              <p className="text-xs text-gray-400 leading-relaxed mt-1 line-clamp-2">{gift.description}</p>
            )}

            <div className="flex items-center justify-between mt-auto pt-3" onClick={(e) => e.stopPropagation()}>
              {!isOwnList && <GuestFooter gift={gift} claimedByOther={claimedByOther} claimMutation={claimMutation} unclaimMutation={unclaimMutation} />}
              {isOwnList && <OwnerFooter gift={gift} releaseAnonMutation={releaseAnonMutation} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuestFooter({ gift, claimedByOther, claimMutation, unclaimMutation }: {
  gift: Gift;
  claimedByOther: boolean;
  claimMutation: ReturnType<typeof useMutation>;
  unclaimMutation: ReturnType<typeof useMutation>;
}) {
  return (
    <>
      <div className="flex items-center gap-1.5">
        <Avatar name={gift.addedByName} />
        <span className="text-xs text-gray-400">{gift.addedByName}</span>
      </div>
      {gift.canClaim && (
        <button
          onClick={() => claimMutation.mutate()}
          disabled={claimMutation.isPending}
          className="flex items-center gap-1.5 bg-active text-white rounded-full px-4 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <CalendarIcon />
          Réserver
        </button>
      )}
      {gift.canUnclaim && (
        <button
          onClick={() => unclaimMutation.mutate()}
          disabled={unclaimMutation.isPending}
          className="flex items-center gap-1.5 bg-blush/20 text-blush rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-blush/30 transition-colors disabled:opacity-50"
        >
          <CalendarIcon />
          Annuler
        </button>
      )}
      {claimedByOther && (
        <span className="flex items-center gap-1.5 bg-gray-100 text-gray-400 rounded-full px-4 py-1.5 text-xs font-semibold">
          <CalendarIcon />
          Réservé
        </span>
      )}
    </>
  );
}

function OwnerFooter({ gift, releaseAnonMutation }: {
  gift: Gift;
  releaseAnonMutation: ReturnType<typeof useMutation>;
}) {
  if (gift.claimedByName)
    return <span className="text-xs text-gray-400">Réservé par {gift.claimedByName}</span>;

  if (gift.claimedAnonymously)
    return (
      <>
        <span className="text-xs text-gray-400">Quelqu'un s'en occupe (anonyme)</span>
        <button
          onClick={() => releaseAnonMutation.mutate()}
          disabled={releaseAnonMutation.isPending}
          className="text-xs text-blush hover:text-sage transition-colors disabled:opacity-50"
        >
          Libérer
        </button>
      </>
    );

  return null;
}
