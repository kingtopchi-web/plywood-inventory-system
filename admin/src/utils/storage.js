const TOKEN_KEY = 'plywood_admin_token';
const ADMIN_KEY = 'plywood_admin_user';

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  getAdmin: () => {
    try {
      const data = localStorage.getItem(ADMIN_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setAdmin: (admin) => localStorage.setItem(ADMIN_KEY, JSON.stringify(admin)),
  removeAdmin: () => localStorage.removeItem(ADMIN_KEY),

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },
};
