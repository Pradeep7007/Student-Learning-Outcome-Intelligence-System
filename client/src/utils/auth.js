// Simple auth utility using localStorage
export function setAuth(data) {
  if (!data || !data.token) return;
  localStorage.setItem('slois_token', data.token);
  localStorage.setItem('slois_user', JSON.stringify(data.user));
}

export function getToken() {
  return localStorage.getItem('slois_token');
}

export function clearAuth() {
  localStorage.removeItem('slois_token');
  localStorage.removeItem('slois_user');
}

export function getAuth() {
  const s = localStorage.getItem('slois_user');
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}

export function isAuthenticated() {
  return !!getToken();
}
