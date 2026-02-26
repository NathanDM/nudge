import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { User } from '../../types';

export function useUsersCollection() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users').then((r) => r.data),
  });
}
