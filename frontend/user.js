'use strict';

const IncantoAuth = (() => {
  const AUTH_API_BASE = 'http://localhost:5000/api/v1';
  const AUTH_TOKEN_KEY = 'incanto_auth_token';
  const AUTH_USER_KEY = 'incanto_user';
  const GOOGLE_CLIENT_ID = '436047080407-nougkk1036aasu9pa5j4vgqlkib5pb7m.apps.googleusercontent.com'; // Paste your Google OAuth web client ID here.

  const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null');
    } catch (_err) {
      return null;
    }
  };

  const setSession = ({ token, user }) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('incanto:auth-change', { detail: { user, token } }));
  };

  const clearSession = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    window.dispatchEvent(new CustomEvent('incanto:auth-change', { detail: { user: null, token: null } }));
  };

  const request = async (path, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${AUTH_API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Authentication request failed.');
    }
    return data.data;
  };

  const register = async ({ username, email, password }) => {
    const data = await request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    setSession(data);
    return data.user;
  };

  const login = async ({ email, password }) => {
    const data = await request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setSession(data);
    return data.user;
  };

  const loginWithGoogle = async (credential) => {
    const data = await request('/users/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    setSession(data);
    return data.user;
  };

  const refreshProfile = async () => {
    const data = await request('/users/profile');
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    window.dispatchEvent(new CustomEvent('incanto:auth-change', { detail: { user: data.user, token: getToken() } }));
    return data.user;
  };

  return {
    GOOGLE_CLIENT_ID,
    getToken,
    getUser,
    isAuthenticated: () => Boolean(getToken() && getUser()),
    register,
    login,
    loginWithGoogle,
    refreshProfile,
    logout: clearSession,
  };
})();

window.IncantoAuth = IncantoAuth;
