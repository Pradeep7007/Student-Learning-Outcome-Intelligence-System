// Simple auth utility using localStorage
export function setAuth(user) {
  if (!user) return;
  localStorage.setItem('slois_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('slois_user');
}

export function getAuth() {
  const s = localStorage.getItem('slois_user');
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}

export function isAuthenticated() {
  return !!getAuth();
}
