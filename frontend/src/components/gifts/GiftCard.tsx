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
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
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
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-base leading-snug">{gift.title}</h3>
          {gift.canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              className="text-gray-300 hover:text-red-400 transition-colors p-0.5 shrink-0 mt-0.5"
              aria-label="Supprimer"
            >
              <TrashIcon />
            </button>
          )}
        </div>

        {gift.description && (
          <p className="text-sm text-gray-400 leading-relaxed">{gift.description}</p>
        )}

        <div className="flex items-end justify-between mt-4">
          {priceDisplay
            ? <span className="text-xl font-bold tracking-tight">{priceDisplay}</span>
            : <span />
          }
          {!isOwnList && (
            <span className="text-xs text-gray-400">par {gift.addedByName}</span>
          )}
        </div>
      </div>

      {!isOwnList && (
        <div className="px-5 pb-5">
          {gift.canClaim && (
            <button
              onClick={(e) => { e.stopPropagation(); claimMutation.mutate(); }}
              disabled={claimMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-salmon text-white rounded-xl py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <CalendarIcon />
              Réserver
            </button>
          )}
          {gift.canUnclaim && (
            <button
              onClick={(e) => { e.stopPropagation(); unclaimMutation.mutate(); }}
              disabled={unclaimMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-blush/20 text-blush rounded-xl py-3 font-medium hover:bg-blush/30 transition-colors disabled:opacity-50"
            >
              <CalendarIcon />
              Annuler la réservation
            </button>
          )}
          {claimedByOther && (
            <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 rounded-xl py-3 font-medium">
              <CalendarIcon />
              Déjà réservé
            </div>
          )}
        </div>
      )}
      {isOwnList && gift.claimedByName && (
        <div className="px-5 pb-5">
          <span className="text-xs text-gray-400">Réservé par {gift.claimedByName}</span>
        </div>
      )}
      {isOwnList && gift.claimedAnonymously && (
        <div className="px-5 pb-5 flex items-center justify-between">
          <span className="text-xs text-gray-400">Quelqu'un s'en occupe (anonyme)</span>
          <button
            onClick={(e) => { e.stopPropagation(); releaseAnonMutation.mutate(); }}
            disabled={releaseAnonMutation.isPending}
            className="text-xs text-blush hover:text-sage transition-colors disabled:opacity-50"
          >
            Libérer
          </button>
        </div>
      )}
    </div>
  );
}
