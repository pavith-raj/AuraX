import React, { createContext, useEffect, useState, useCallback } from 'react';
import { getToken, setToken, removeToken } from '../api/storage';
import { getProfile } from '../api/user';
import { loginUser, registerUser } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkLogin = useCallback(async () => {
    setLoading(true);
    const token = await getToken();
    if (token) {
      try {
        const data = await getProfile();
        setUser(data.user);
      } catch (err) {
        console.log('Token invalid, removing:', err.message);
        await removeToken();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await loginUser(email, password);
      await setToken(data.token);
      checkLogin();
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [checkLogin]);

  const logout = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const data = await registerUser(userData);
      await setToken(data.token);
      checkLogin();
      return data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, [checkLogin]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
