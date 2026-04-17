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
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
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

  const priceDisplay = gift.price ? `${(gift.price / 100).toFixed(0)}€` : null;
  const claimedByOther = !!gift.claimedByUserId && !gift.canUnclaim;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-opacity ${claimedByOther ? 'opacity-55' : ''} ${gift.url ? 'cursor-pointer' : ''}`}
      onClick={() => gift.url && window.open(gift.url, '_blank', 'noopener,noreferrer')}
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
            <div className="flex items-center gap-2 shrink-0">
              {priceDisplay && (
                <span className="text-active font-bold text-base">{priceDisplay}</span>
              )}
              {gift.canDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); }}
                  disabled={deleteMutation.isPending}
                  className="text-gray-300 hover:text-red-400 transition-colors p-0.5"
                  aria-label="Supprimer"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
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
