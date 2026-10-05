import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(storage.getAdmin());
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = storage.getToken();
    if (!token) {
      setAdmin(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authService.getProfile();
      setAdmin(profile);
    } catch {
      storage.clear();
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (identifier, password) => {
    const data = await authService.login(identifier, password);
    setAdmin(data.admin);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setAdmin(null);
  };

  const value = {
    admin,
    isAuthenticated: Boolean(admin && admin.role === 'SUPER_ADMIN'),
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
