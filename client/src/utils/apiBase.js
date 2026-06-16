const RENDER_API = 'https://lake-pass-mern-1.onrender.com/api';

function normalizeApiUrl(url) {
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

export function getApiBaseUrl() {
  // Vercel rewrites proxy /api -> Render, so same-origin avoids CORS.
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')) {
    return '/api';
  }
  if (import.meta.env.VITE_API_URL) {
    return normalizeApiUrl(import.meta.env.VITE_API_URL);
  }
  return '/api';
}

export { RENDER_API };
