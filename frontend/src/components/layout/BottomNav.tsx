import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

type Props = { drawerOpen: boolean; onFabClick: () => void };

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5V20a2 2 0 0 1-2 2h-3v-7h-8v7H5a2 2 0 0 1-2-2z"/>
    </svg>
  );
}

function FriendsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2"/><path d="M3 20c.5-3.4 3.1-5.5 6-5.5s5.5 2.1 6 5.5"/>
      <path d="M16 4.2a3.5 3.5 0 0 1 0 6.6"/><path d="M21 20c-.3-2.5-1.7-4.3-3.8-5.1"/>
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
      <path d="M10 3.5h4a1 1 0 0 1 1 1V6H9V4.5a1 1 0 0 1 1-1z"/>
      <path d="M9.5 11h5M9.5 15h5"/>
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20.5c.8-3.7 4-6 8-6s7.2 2.3 8 6"/>
    </svg>
  );
}

function NavBtn({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 w-14 py-1 transition"
            style={{ color: active ? 'var(--active)' : 'var(--ink-mute)' }}>
      {icon}
      <span className={`text-[10px] ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
      <div className="h-0.5 w-1 rounded-full mt-0.5" style={{ background: active ? 'var(--active)' : 'transparent' }}/>
    </button>
  );
}

export default function BottomNav({ drawerOpen, onFabClick }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isFamille = location.pathname === '/';
  const isAmis = location.pathname === '/amis';
  const isMyList = location.pathname === `/user/${user?.id}`;
  const isProfile = location.pathname === '/profile';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="absolute bottom-0 left-0 right-0 h-[86px] bg-white" style={{ boxShadow: '0 -1px 0 rgba(31,27,23,0.06)' }}/>
      <div className="relative max-w-4xl mx-auto flex items-end justify-around px-2 pb-4 pt-2">
        <NavBtn label="Famille" active={isFamille} onClick={() => navigate('/')} icon={<HomeIcon active={isFamille}/>}/>
        <NavBtn label="Amis" active={isAmis} onClick={() => navigate('/amis')} icon={<FriendsIcon active={isAmis}/>}/>
        <button
          onClick={onFabClick}
          className="-translate-y-4 w-[60px] h-[60px] rounded-full flex items-center justify-center transition active:scale-95"
          style={{ background: 'var(--salmon)', boxShadow: '0 14px 24px -8px rgba(233,172,178,.6), 0 4px 10px -4px rgba(0,0,0,.15)' }}
          aria-label={drawerOpen ? 'Fermer' : 'Ajouter'}
        >
          <span className={`text-white transition-transform duration-200 ${drawerOpen ? 'rotate-45' : ''}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </span>
        </button>
        <NavBtn label="Ma liste" active={isMyList} onClick={() => navigate(`/user/${user?.id}`)} icon={<ListIcon active={isMyList}/>}/>
        <NavBtn label="Profil" active={isProfile} onClick={() => navigate('/profile')} icon={<ProfileIcon active={isProfile}/>}/>
      </div>
    </nav>
  );
}