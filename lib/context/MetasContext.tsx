"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the Meta type
export type Meta = {
  _id: string;
  mes: string;
  ano: number;
  unidade: string;
  faturamento: number;
  funcionarios: number;
  despesa: number;
  inadimplencia: number;
  nivel: string;
  createdAt?: string;
  updatedAt?: string;
};

// Define the MetasContext type
type MetasContextType = {
  metas: Meta[];
  loading: boolean;
  error: string | null;
  fetchMetas: (year?: number) => Promise<void>;
  addMeta: (meta: Omit<Meta, '_id'>) => Promise<void>;
  updateMeta: (id: string, meta: Partial<Meta>) => Promise<void>;
  deleteMeta: (id: string) => Promise<void>;
  refreshMetas: () => Promise<void>;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  initializeData: () => void;
};

// Create the context with a default value
const MetasContext = createContext<MetasContextType | undefined>(undefined);

// Provider component
export function MetasProvider({ children }: { children: ReactNode }) {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);

  // Function to initialize data loading
  const initializeData = () => {
    if (!shouldFetch) {
      setShouldFetch(true);
    }
  };

  // Fetch metas based on year
  const fetchMetas = async (year?: number) => {
    const targetYear = year || currentYear;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/metas/search?ano=${targetYear}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setMetas(data);
    } catch (error) {
      console.error('Failed to fetch metas:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch metas');
    } finally {
      setLoading(false);
    }
  };

  // Add a new meta
  const addMeta = async (meta: Omit<Meta, '_id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/metas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meta),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      // Refresh the metas list
      await fetchMetas();
    } catch (error) {
      console.error('Failed to add meta:', error);
      setError(error instanceof Error ? error.message : 'Failed to add meta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update a meta
  const updateMeta = async (id: string, meta: Partial<Meta>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/metas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meta),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      // Refresh the metas list
      await fetchMetas();
    } catch (error) {
      console.error('Failed to update meta:', error);
      setError(error instanceof Error ? error.message : 'Failed to update meta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a meta
  const deleteMeta = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/metas/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      // Refresh the metas list
      await fetchMetas();
    } catch (error) {
      console.error('Failed to delete meta:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete meta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Refresh the metas list
  const refreshMetas = async () => {
    await fetchMetas();
  };

  // Load data when shouldFetch and currentYear change
  useEffect(() => {
    if (shouldFetch) {
      fetchMetas();
    }
  }, [shouldFetch, currentYear]);

  return (
    <MetasContext.Provider value={{ 
      metas, 
      loading, 
      error, 
      fetchMetas, 
      addMeta, 
      updateMeta, 
      deleteMeta, 
      refreshMetas,
      currentYear,
      setCurrentYear,
      initializeData
    }}>
      {children}
    </MetasContext.Provider>
  );
}

// Custom hook to use the MetasContext
export function useMetasContext() {
  const context = useContext(MetasContext);
  
  if (context === undefined) {
    throw new Error('useMetasContext must be used within a MetasProvider');
  }
  
  return context;
} 