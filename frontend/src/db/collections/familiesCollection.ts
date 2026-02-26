import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Family } from '../../types';

export function useFamiliesCollection() {
  return useQuery<Family[]>({
    queryKey: ['families'],
    queryFn: () => apiClient.get('/families').then((r) => r.data),
  });
}
