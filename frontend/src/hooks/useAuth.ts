import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setCredentials, logout as logoutAction } from '../store/authSlice';
import apiClient from '../api/client';
import { queryClient } from '../db/queryClient';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const login = async (phone: string, pin: string) => {
    const { data } = await apiClient.post('/auth/login', { phone, pin });
    dispatch(setCredentials({ token: data.accessToken, user: data.user }));
  };

  const register = async (name: string, phone: string, pin: string) => {
    const { data } = await apiClient.post('/auth/register', { name, phone, pin });
    dispatch(setCredentials({ token: data.accessToken, user: data.user }));
  };

  const logout = () => {
    queryClient.clear();
    dispatch(logoutAction());
  };

  return { user, token, isAuthenticated: !!token, login, register, logout };
}
