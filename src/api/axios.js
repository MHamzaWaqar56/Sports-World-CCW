import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;

const getApiBaseUrl = () => {
  if (typeof rawApiUrl === 'string' && rawApiUrl.trim()) {
    const trimmed = rawApiUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  // Safe fallback: same-origin API (works with reverse proxies / Vercel rewrites).
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_ORIGIN = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    try {
      const authStorage = localStorage.getItem('auth-storage');

      if (authStorage) {
        const parsedData = JSON.parse(authStorage);
        const token = parsedData?.state?.userInfo?.token;

        if (token) {
          if (config.headers && typeof config.headers.set === 'function') {
             config.headers.set('Authorization', `Bearer ${token}`);
          } else {
             config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
          }
        }
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Error parsing auth token', e);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
