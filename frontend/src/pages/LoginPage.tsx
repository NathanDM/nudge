import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import { User } from '../types';

export default function LoginPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    apiClient
      .get('/users')
      .then((res) => setUsers(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(selectedUserId, pin);
      navigate('/');
    } catch {
      setError('PIN incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-teal mb-6 text-center">
          Nudge
        </h1>
        <p className="text-dark-sage text-center mb-6">
          Connectez-vous pour accéder aux listes de cadeaux
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-teal mb-1">
              Qui êtes-vous ?
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full border border-sage/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
              required
            >
              <option value="">Choisir...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-teal mb-1">
              PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={10}
              className="w-full border border-sage/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={!selectedUserId || !pin}
            className="w-full bg-sage text-white rounded-lg py-2 font-medium hover:bg-dark-sage transition-colors disabled:opacity-50"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
