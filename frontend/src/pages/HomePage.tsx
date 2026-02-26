import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Family } from '../types';
import FamilyGroup from '../components/home/FamilyGroup';

export default function HomePage() {
  const { data: families, isLoading } = useQuery<Family[]>({
    queryKey: ['families'],
    queryFn: () => apiClient.get('/families').then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="text-center text-dark-sage py-12">Chargement...</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-teal mb-6">
        Listes de cadeaux
      </h1>
      {families?.map((family) => (
        <FamilyGroup key={family.id} family={family} />
      ))}
    </div>
  );
}
