import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Gift } from '../../types';

export function useGiftsCollection(forUserId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['gifts', forUserId];

  const query = useQuery<Gift[]>({
    queryKey,
    queryFn: () =>
      apiClient.get(`/users/${forUserId}/gifts`).then((r) => r.data),
    enabled: !!forUserId,
  });

  const addGift = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      url?: string;
      price?: number;
    }) => apiClient.post(`/users/${forUserId}/gifts`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteGift = useMutation({
    mutationFn: (giftId: string) => apiClient.delete(`/gifts/${giftId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const claimGift = useMutation({
    mutationFn: (giftId: string) =>
      apiClient.patch(`/gifts/${giftId}/claim`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const unclaimGift = useMutation({
    mutationFn: (giftId: string) =>
      apiClient.patch(`/gifts/${giftId}/unclaim`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { ...query, addGift, deleteGift, claimGift, unclaimGift };
}
