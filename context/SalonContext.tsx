import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken } from '../api/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SalonContextType {
  salonId: string | null;
  setSalonId: (id: string) => void;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export function SalonProvider({ children }: { children: React.ReactNode }) {
  const [salonId, setSalonIdState] = useState<string | null>(null);

  useEffect(() => {
    // Load salon ID from AsyncStorage when app starts
    const loadSalonId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('salonId');
        if (storedId) setSalonIdState(storedId);
      } catch (error) {
        console.error('Error loading salon ID:', error);
      }
    };
    loadSalonId();
  }, []);

  // Persist salonId to AsyncStorage
  const setSalonId = (id: string) => {
    setSalonIdState(id);
    AsyncStorage.setItem('salonId', id);
  };

  return (
    <SalonContext.Provider value={{ salonId, setSalonId }}>
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  const context = useContext(SalonContext);
  if (context === undefined) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
} 