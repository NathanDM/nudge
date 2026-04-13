import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

type Props = { drawerOpen: boolean; onPlusClick: () => void; onCloseClick: () => void };

function FriendsIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M21 20c0-3 -1.8-5.4-4.5-6" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3a3 3 0 0 0-3-3z" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function NavItem({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 w-16 py-2 transition-colors" style={{ color: active ? '#2D8C85' : '#94a3a8' }}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export default function BottomNav({ drawerOpen, onPlusClick, onCloseClick }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isHome = location.pathname === '/';
  const isMyList = location.pathname === `/user/${user?.id}`;
  const isProfile = location.pathname === '/profile';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-4xl mx-auto flex items-end justify-around pb-safe">
        <NavItem label="Amis" active={isHome} onClick={() => navigate('/')} icon={<FriendsIcon active={isHome} />} />
        <NavItem label="Ma liste" active={isMyList} onClick={() => navigate(`/user/${user?.id}`)} icon={<ListIcon active={isMyList} />} />
        <button
          onClick={drawerOpen ? onCloseClick : onPlusClick}
          className="-translate-y-3 w-14 h-14 bg-teal rounded-full flex items-center justify-center shadow-lg hover:bg-dark-sage active:scale-95 transition-all"
          aria-label={drawerOpen ? 'Fermer' : 'Ajouter'}
        >
          <span className={`text-white font-light leading-none transition-transform duration-200 ${drawerOpen ? 'text-2xl rotate-45' : 'text-3xl'}`}>+</span>
        </button>
        <NavItem label="Profil" active={isProfile} onClick={() => navigate('/profile')} icon={<ProfileIcon active={isProfile} />} />
      </div>
    </nav>
  );
}
