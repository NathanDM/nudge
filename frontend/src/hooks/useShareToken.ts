import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export type ShareTarget = { kind: 'self' } | { kind: 'child'; childId: string };

export function shareTokenEndpoint(target: ShareTarget) {
  if (target.kind === 'child') return `/users/children/${target.childId}/share-token`;
  return '/users/share-token';
}

export function useShareToken(target: ShareTarget | null) {
  const queryClient = useQueryClient();
  const endpoint = target ? shareTokenEndpoint(target) : null;
  const queryKey = ['share-token', endpoint];

  const { data } = useQuery<{ shareToken: string | null }>({
    queryKey,
    queryFn: () => apiClient.get(endpoint!).then((r) => r.data),
    enabled: !!endpoint,
  });

  const setToken = (shareToken: string | null) => queryClient.setQueryData(queryKey, { shareToken });

  const generate = useMutation({
    mutationFn: () => apiClient.post<{ shareToken: string }>(endpoint!).then((r) => r.data.shareToken),
    onSuccess: setToken,
  });

  const revoke = useMutation({
    mutationFn: () => apiClient.delete(endpoint!),
    onSuccess: () => setToken(null),
  });

  return {
    shareToken: data?.shareToken ?? null,
    generate: () => generate.mutate(),
    generating: generate.isPending,
    revoke: () => revoke.mutate(),
    revoking: revoke.isPending,
  };
}
