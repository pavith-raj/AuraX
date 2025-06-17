import React, { createContext, useEffect, useState } from 'react';
import { getToken } from '../api/storage';
import { getUserProfile } from '../api/user';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkLogin = async () => {
    const token = await getToken();
    if (token) {
      try {
        const user = await getUserProfile(token);
        setUser(user);
      } catch (err) {
        console.log('Token invalid:', err.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
