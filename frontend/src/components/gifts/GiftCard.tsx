import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Gift } from '../../types';
import ClaimButton from './ClaimButton';

interface Props {
  gift: Gift;
  forUserId: string;
  isOwnList: boolean;
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

export default function GiftCard({ gift, forUserId, isOwnList }: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/gifts/${gift.id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['gifts', forUserId] }),
  });

  const priceDisplay = gift.price
    ? `${(gift.price / 100).toFixed(2)} €`
    : null;

  const claimedByOther = !!gift.claimedByUserId && !gift.canUnclaim;

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden transition-opacity ${claimedByOther ? 'opacity-55' : ''}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold leading-snug">{gift.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            {priceDisplay && (
              <span className="text-xs font-semibold bg-sand px-2.5 py-1 rounded-full">
                {priceDisplay}
              </span>
            )}
            {gift.canUnclaim && (
              <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                Réservé par moi
              </span>
            )}
            {claimedByOther && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                Réservé
              </span>
            )}
            {gift.canDelete && (
              <button
                onClick={() => deleteMutation.mutate()}
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
          <p className="text-sm text-gray-400 leading-relaxed mb-3">{gift.description}</p>
        )}

        {gift.url && (
          <div className="mt-2">
            <a
              href={gift.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sage hover:text-dark-sage flex items-center gap-1 transition-colors w-fit"
            >
              <ExternalLinkIcon />
              Voir l'article
            </a>
          </div>
        )}
      </div>

      {!isOwnList && !claimedByOther && (
        <div className="px-4 pb-4">
          <ClaimButton gift={gift} forUserId={forUserId} />
        </div>
      )}
    </div>
  );
}
