import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Gift } from '../../types';
import ClaimButton from './ClaimButton';

interface Props {
  gift: Gift;
  forUserId: string;
  isOwnList: boolean;
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

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-teal">{gift.title}</h3>
          {gift.description && (
            <p className="text-sm text-dark-sage mt-1">{gift.description}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {priceDisplay && (
              <span className="text-sm text-sage font-medium">
                {priceDisplay}
              </span>
            )}
            {gift.url && (
              <a
                href={gift.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sage underline hover:text-dark-sage"
              >
                Voir le lien
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {!isOwnList && <ClaimButton gift={gift} forUserId={forUserId} />}
          {gift.canDelete && (
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
