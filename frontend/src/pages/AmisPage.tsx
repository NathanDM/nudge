import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/client';
import { User } from '../types';
import { AppShellContext } from '../components/layout/AppShell';
import { AvatarCard } from '../components/home/AvatarCard';
import { BirthdayStrip } from '../components/home/BirthdayStrip';

function AddCard({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl active:scale-[0.97] transition">
      <div className="w-16 h-16 rounded-full flex items-center justify-center"
           style={{ background: 'rgba(238,215,207,0.25)', border: '1.8px dashed rgba(238,215,207,0.9)', color: 'var(--salmon)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>
      <div className="text-[12px] font-bold" style={{ color: 'var(--ink-soft)' }}>Inviter</div>
    </button>
  );
}

export default function AmisPage() {
  const { setCloseHandler, notifyDrawerOpen, openInvitePicker } = useOutletContext<AppShellContext>();
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading, isError } = useQuery<User[]>({
    queryKey: ['friends'],
    queryFn: () => apiClient.get('/users/friends').then((r) => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (contactId: string) => apiClient.delete(`/users/contacts/${contactId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
  });

  useEffect(() => {
    setCloseHandler(null);
    notifyDrawerOpen(false);
    return () => { setCloseHandler(null); notifyDrawerOpen(false); };
  }, [setCloseHandler, notifyDrawerOpen]);

  if (isLoading)
    return <div className="px-5 pt-16 text-center text-sm font-semibold" style={{ color: 'var(--ink-mute)' }}>Chargement…</div>;

  if (isError)
    return <div className="px-5 pt-16 text-center text-red-400 text-sm">Impossible de charger les amis. Réessayez.</div>;

  if (friends.length === 0) {
    return (
      <div className="pt-2 pb-4">
        <div className="px-5 pt-3 pb-2">
          <h1 className="display text-[28px] font-black leading-tight" style={{ color: 'var(--ink)' }}>Mes amis</h1>
        </div>
        <div className="px-5 mt-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(165,200,191,.2)' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--active)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="8" r="3.2"/><path d="M3 20c.5-3.4 3.1-5.5 6-5.5s5.5 2.1 6 5.5"/>
              <path d="M16 4.2a3.5 3.5 0 0 1 0 6.6"/><path d="M21 20c-.3-2.5-1.7-4.3-3.8-5.1"/>
            </svg>
          </div>
          <h2 className="display text-[22px] font-bold mb-1" style={{ color: 'var(--ink)' }}>Pas encore d'ami ici.</h2>
          <p className="text-[13px] mb-5 max-w-[260px]" style={{ color: 'var(--ink-soft)' }}>
            Invite quelqu'un avec un lien ou un numéro, et commencez à partager vos listes.
          </p>
          <button onClick={() => openInvitePicker('friend')}
            className="px-5 py-3.5 rounded-2xl font-bold text-white transition active:scale-[0.98]"
            style={{ background: 'var(--sage)' }}>
            Inviter un ami
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 pb-4">
      <div className="px-5 pt-3 pb-2">
        <h1 className="display text-[28px] font-black leading-tight" style={{ color: 'var(--ink)' }}>Mes amis</h1>
      </div>
      <BirthdayStrip contacts={friends}/>

      <div className="px-5 flex items-baseline justify-between mt-5 mb-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--ink-soft)' }}>Cercle proche</div>
        <div className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>{friends.length} ami{friends.length > 1 ? 's' : ''}</div>
      </div>
      <div className="px-4 grid grid-cols-4 gap-y-3 gap-x-1">
        {friends.map((m) => (
          <AvatarCard key={m.id} member={m} onRemove={() => removeMutation.mutate(m.id)}/>
        ))}
        <AddCard onClick={() => openInvitePicker('friend')}/>
      </div>
    </div>
  );
}
