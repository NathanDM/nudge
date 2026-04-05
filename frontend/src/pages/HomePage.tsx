import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Family, User } from '../types';
import { useAuth } from '../hooks/useAuth';

const PALETTE = [
  '#FFF8E1', // Soft Cream
  '#FFD2B3', // Peach Blush
  '#F5CD69', // Soft Goldenrod
  '#A7D49B', // Spring Leaf
  '#A8D8AA', // Mint Mist
  '#66B1B0', // Ocean Teal
  '#C4B7E8', // Lavender Mist
  '#A87A86', // Dusty Rosewood
  '#98CBE9', // Sky Blue
  '#9FAED9', // Powder Blue
  '#E892A7', // Rose Petal
  '#F88C85', // Soft Coral
  '#DFA28A', // Light Terracotta
  '#B88A66', // Golden Sand
  '#85A68B', // Sage Green
  '#8FA6A3', // Misty Blue-Grey
  '#E3D4F3', // Pale Lilac
  '#FDF188', // Soft Butter Yellow
  '#F7C3CF', // Blossom Pink
  '#FDFDFD', // Cloud White
];

function colorForId(id: string) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

function textColorFor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return luminance > 0.65 ? '#2D5954' : '#ffffff';
}

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
  const color = colorForId(member.id);
  const textColor = textColorFor(color);

  return (
    <button
      onClick={() => navigate(`/user/${member.id}`)}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        style={{ backgroundColor: color, color: textColor }}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-all group-hover:scale-105 ${
          isMe ? 'ring-2 ring-offset-2 ring-dark-sage' : 'shadow-sm group-hover:shadow-md'
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
