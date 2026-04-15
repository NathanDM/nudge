import axios from 'axios';
import { store } from '../store';

const publicClient = axios.create({ baseURL: '/api' });

publicClient.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default publicClient;
