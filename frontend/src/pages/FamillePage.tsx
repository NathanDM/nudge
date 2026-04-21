import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/client';
import { User } from '../types';
import { AppShellContext } from '../components/layout/AppShell';
import { AvatarCard } from '../components/home/AvatarCard';
import { BirthdayStrip } from '../components/home/BirthdayStrip';
import { useAuth } from '../hooks/useAuth';

function AddCard({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl active:scale-[0.97] transition">
      <div className="w-16 h-16 rounded-full flex items-center justify-center"
           style={{ background: 'rgba(238,215,207,0.25)', border: '1.8px dashed rgba(238,215,207,0.9)', color: 'var(--salmon)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>
      <div className="text-[12px] font-bold" style={{ color: 'var(--ink-soft)' }}>{label}</div>
    </button>
  );
}

export default function FamillePage() {
  const { setCloseHandler, notifyDrawerOpen, openInvitePicker, openAddChild } = useOutletContext<AppShellContext>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: family = [], isLoading, isError } = useQuery<User[]>({
    queryKey: ['family'],
    queryFn: () => apiClient.get('/users/family').then((r) => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (contactId: string) => apiClient.delete(`/users/contacts/${contactId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['family'] }),
  });

  useEffect(() => {
    setCloseHandler(null);
    notifyDrawerOpen(false);
    return () => { setCloseHandler(null); notifyDrawerOpen(false); };
  }, [setCloseHandler, notifyDrawerOpen]);

  const adults = family.filter((m) => !m.managedBy);
  const myChildren = family.filter((m) => m.managedBy === user?.id);
  const othersChildren = family.filter((m) => !!m.managedBy && m.managedBy !== user?.id);

  if (isLoading)
    return <div className="px-5 pt-16 text-center text-sm font-semibold" style={{ color: 'var(--ink-mute)' }}>Chargement…</div>;

  if (isError)
    return <div className="px-5 pt-16 text-center text-red-400 text-sm">Impossible de charger la famille. Réessayez.</div>;

  return (
    <div className="pt-2 pb-4">
      <div className="px-5 pt-3 pb-2">
        <h1 className="display text-[28px] font-black leading-tight" style={{ color: 'var(--ink)' }}>Ma famille</h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>Les listes de tes proches, au même endroit.</p>
      </div>

      {family.length === 0 ? (
        <div className="px-5 mt-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(165,200,191,.2)' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--active)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5V20a2 2 0 0 1-2 2h-3v-7h-8v7H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>
          <h2 className="display text-[22px] font-bold mb-1" style={{ color: 'var(--ink)' }}>Ta famille n'est pas encore là.</h2>
          <p className="text-[13px] mb-5 max-w-[260px]" style={{ color: 'var(--ink-soft)' }}>Invite tes proches pour partager vos listes de cadeaux.</p>
          <div className="flex flex-col gap-2 w-full max-w-[260px]">
            <button onClick={() => openInvitePicker('family')}
              className="px-5 py-3.5 rounded-2xl font-bold text-white transition active:scale-[0.98]"
              style={{ background: 'var(--sage)' }}>
              Inviter un proche
            </button>
            <button onClick={openAddChild}
              className="px-5 py-3.5 rounded-2xl font-bold transition active:scale-[0.98]"
              style={{ background: 'rgba(245,205,105,0.3)', color: '#8B6914' }}>
              Ajouter un enfant
            </button>
          </div>
        </div>
      ) : (
        <>
          <BirthdayStrip contacts={family}/>

          <div className="px-5 flex items-baseline justify-between mt-5 mb-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--ink-soft)' }}>Adultes</div>
            <div className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>{adults.length} proche{adults.length > 1 ? 's' : ''}</div>
          </div>
          <div className="px-4 grid grid-cols-4 gap-y-3 gap-x-1">
            {adults.map((m) => (
              <AvatarCard key={m.id} member={m} onRemove={() => removeMutation.mutate(m.id)}/>
            ))}
            <AddCard onClick={() => openInvitePicker('family')} label="Inviter"/>
          </div>

          {othersChildren.length > 0 && (
            <>
              <div className="px-5 flex items-baseline justify-between mt-5 mb-2">
                <div className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--ink-soft)' }}>Enfants</div>
                <div className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>De tes proches</div>
              </div>
              <div className="px-4 grid grid-cols-4 gap-y-3 gap-x-1">
                {othersChildren.map((m) => (
                  <AvatarCard key={m.id} member={m} isChild/>
                ))}
              </div>
            </>
          )}

          {myChildren.length > 0 && (
            <>
              <div className="px-5 flex items-baseline justify-between mt-5 mb-2">
                <div className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--ink-soft)' }}>Mes enfants</div>
                <div className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>Gérés par toi</div>
              </div>
              <div className="px-4 grid grid-cols-4 gap-y-3 gap-x-1">
                {myChildren.map((m) => (
                  <AvatarCard key={m.id} member={m} isChild/>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
