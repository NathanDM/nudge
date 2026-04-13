import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';

const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
