import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Gift } from '../../types';

interface Props {
  gift: Gift;
  forUserId: string;
}

export default function ClaimButton({ gift, forUserId }: Props) {
  const queryClient = useQueryClient();

  const claimMutation = useMutation({
    mutationFn: () => apiClient.patch(`/gifts/${gift.id}/claim`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['gifts', forUserId] }),
  });

  const unclaimMutation = useMutation({
    mutationFn: () => apiClient.patch(`/gifts/${gift.id}/unclaim`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['gifts', forUserId] }),
  });

  if (gift.canUnclaim) {
    return (
      <button
        onClick={() => unclaimMutation.mutate()}
        disabled={unclaimMutation.isPending}
        className="w-full text-sm bg-sand py-2 rounded-lg hover:bg-sand/70 transition-colors font-medium"
      >
        Annuler ma réservation
      </button>
    );
  }

  if (gift.canClaim) {
    return (
      <button
        onClick={() => claimMutation.mutate()}
        disabled={claimMutation.isPending}
        className="w-full text-sm bg-sage text-white py-2 rounded-lg hover:bg-dark-sage transition-colors font-medium"
      >
        Réserver ce cadeau
      </button>
    );
  }

  return null;
}
