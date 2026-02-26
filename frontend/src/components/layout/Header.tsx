import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-teal text-white px-6 py-4 flex items-center justify-between">
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate('/')}
      >
        Nudge
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-sand">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="text-sm bg-dark-sage px-3 py-1 rounded-lg hover:bg-sage transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
