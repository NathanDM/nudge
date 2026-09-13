import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { FamilySuggestion } from '../types';

export const FAMILY_SUGGESTIONS_KEY = ['family-suggestions'];

export function useFamilySuggestionsQuery() {
  return useQuery<FamilySuggestion[]>({
    queryKey: FAMILY_SUGGESTIONS_KEY,
    queryFn: () => apiClient.get('/users/family/suggestions').then((r) => r.data),
  });
}

type Action = 'accept' | 'dismiss';

export function useFamilySuggestionActions() {
  const queryClient = useQueryClient();
  const [errorId, setErrorId] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: FAMILY_SUGGESTIONS_KEY });
    queryClient.invalidateQueries({ queryKey: ['family'] });
    queryClient.invalidateQueries({ queryKey: ['friends'] });
  };

  const onError = (err: any, id: string) => {
    if (err?.response?.status === 403) invalidate();
    else setErrorId(id);
  };

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: Action }) =>
      apiClient.post(`/users/family/suggestions/${id}/${action}`),
    onMutate: () => setErrorId(null),
    onSuccess: invalidate,
    onError: (err, { id }) => onError(err, id),
  });

  const run = (action: Action) => (id: string) => {
    if (mutation.isPending) return;
    mutation.mutate({ id, action });
  };

  return {
    accept: run('accept'),
    dismiss: run('dismiss'),
    pendingId: mutation.isPending ? mutation.variables.id : null,
    errorId,
  };
}
