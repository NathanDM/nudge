import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Family, User } from '../types';
import { useAuth } from '../hooks/useAuth';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function AvatarCard({ member }: { member: User }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMe = user?.id === member.id;

  return (
    <button
      onClick={() => navigate(`/user/${member.id}`)}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-all group-hover:scale-105 ${
          isMe
            ? 'bg-sage text-white ring-2 ring-offset-2 ring-dark-sage'
            : 'bg-white text-teal shadow-sm group-hover:shadow-md'
        }`}
      >
        {getInitials(member.name)}
      </div>
      <span className="text-xs font-medium text-teal text-center leading-tight max-w-[72px] truncate">
        {isMe ? 'Moi' : member.name.split(' ')[0]}
      </span>
    </button>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { data: families, isLoading } = useQuery<Family[]>({
    queryKey: ['families'],
    queryFn: () => apiClient.get('/families').then((r) => r.data),
  });

  if (isLoading)
    return <div className="text-center text-dark-sage py-12">Chargement...</div>;

  const seen = new Set<string>();
  const members: User[] = [];
  for (const family of families ?? []) {
    for (const m of family.members) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        members.push(m);
      }
    }
  }

  members.sort((a, b) => {
    if (a.id === user?.id) return -1;
    if (b.id === user?.id) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-teal mb-6">Listes de cadeaux</h1>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
        {members.map((m) => (
          <AvatarCard key={m.id} member={m} />
        ))}
      </div>
    </div>
  );
}
