import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../api/client';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { AppShellContext } from '../components/layout/AppShell';

const PALETTE = [
  '#FFF8E1', '#FFD2B3', '#F5CD69', '#A7D49B', '#A8D8AA',
  '#66B1B0', '#C4B7E8', '#A87A86', '#98CBE9', '#9FAED9',
  '#E892A7', '#F88C85', '#DFA28A', '#B88A66', '#85A68B',
  '#8FA6A3', '#E3D4F3', '#FDF188', '#F7C3CF', '#FDFDFD',
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
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function AvatarCard({ member }: { member: User }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMe = user?.id === member.id;
  const color = colorForId(member.id);
  const textColor = textColorFor(color);

  return (
    <button onClick={() => navigate(`/user/${member.id}`)} className="flex flex-col items-center gap-2 group">
      <div
        style={{ backgroundColor: color, color: textColor }}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-all group-hover:scale-105 ${
          isMe ? 'ring-2 ring-offset-2 ring-dark-sage' : 'shadow-sm group-hover:shadow-md'
        }`}
      >
        {getInitials(member.name)}
      </div>
      <span className="text-xs font-medium text-center leading-tight max-w-[72px] truncate">
        {isMe ? 'Moi' : member.name.split(' ')[0]}
      </span>
    </button>
  );
}

function AddContactForm({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (phone: string) => apiClient.post('/users/contacts', { phone }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: () => setError('Numéro introuvable'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutate(phone);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start">
      <div className="flex flex-col gap-1 flex-1">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Numéro de téléphone"
          autoFocus
          className="border border-sage/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
          required
        />
        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
      <button
        type="submit"
        disabled={!phone || isPending}
        className="bg-sage text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-dark-sage transition-colors disabled:opacity-50"
      >
        Ajouter
      </button>
    </form>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { setPlusHandler, setCloseHandler, notifyDrawerOpen } = useOutletContext<AppShellContext>();
  const [showAddContact, setShowAddContact] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users').then((r) => r.data),
  });

  useEffect(() => {
    setPlusHandler(() => () => setShowAddContact(true));
    setCloseHandler(() => () => setShowAddContact(false));
    return () => { setPlusHandler(null); setCloseHandler(null); notifyDrawerOpen(false); };
  }, [setPlusHandler, setCloseHandler, notifyDrawerOpen]);

  useEffect(() => { notifyDrawerOpen(showAddContact); }, [showAddContact, notifyDrawerOpen]);

  if (isLoading)
    return <div className="text-center text-dark-sage py-12">Chargement...</div>;

  const sorted = [...(users ?? [])].sort((a, b) => {
    if (a.id === user?.id) return -1;
    if (b.id === user?.id) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Listes de cadeaux</h1>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
        {sorted.map((m) => (
          <AvatarCard key={m.id} member={m} />
        ))}
      </div>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          showAddContact ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddContact(false)} />
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl px-5 pt-4 pb-24 transition-transform duration-300 ${
            showAddContact ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Ajouter un ami</h3>
            <button onClick={() => setShowAddContact(false)} className="text-sage text-xl leading-none hover:text-dark-sage transition-colors">
              ✕
            </button>
          </div>
          <AddContactForm onClose={() => setShowAddContact(false)} />
        </div>
      </div>
    </div>
  );
}
