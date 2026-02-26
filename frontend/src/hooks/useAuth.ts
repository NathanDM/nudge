import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setCredentials, logout as logoutAction } from '../store/authSlice';
import apiClient from '../api/client';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const login = async (userId: string, pin: string) => {
    const { data } = await apiClient.post('/auth/login', { userId, pin });
    dispatch(setCredentials({ token: data.accessToken, user: data.user }));
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return { user, token, isAuthenticated: !!token, login, logout };
}
