import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-teal text-white px-6 py-4 flex items-center justify-between">
      <button onClick={() => navigate('/')} className="cursor-pointer">
        <Logo size={48} className="text-2xl text-white font-bold" />
      </button>
      <button
        onClick={() => navigate('/profile')}
        className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
        aria-label="Mon profil"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
      </button>
    </header>
  );
}
