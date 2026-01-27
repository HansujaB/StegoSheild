import { useAuth } from '@clerk/clerk-react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export const useApi = () => {
  const { getToken } = useAuth();

  const callApi = async (path, options = {}) => {
    const token = await getToken().catch(() => null);
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      // ignore JSON parse error, will throw generic below
    }

    if (!res.ok || (data && data.success === false)) {
      const msg = data?.error || 'API error';
      throw new Error(msg);
    }

    return data;
  };

  return { callApi };
};

