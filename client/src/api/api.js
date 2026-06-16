import axios from 'axios';

const isVercelPreview = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');
const deployedApiBase = 'https://lake-pass-mern.vercel.app/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isVercelPreview ? deployedApiBase : '/api'),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
