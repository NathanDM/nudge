import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{user?.name}</h1>
      <button
        onClick={handleLogout}
        className="text-sm bg-sage text-white px-4 py-2 rounded-lg hover:bg-dark-sage transition-colors"
      >
        Déconnexion
      </button>
    </div>
  );
}
