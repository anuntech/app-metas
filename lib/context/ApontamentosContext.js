import { createContext, useState, useContext, useEffect } from 'react';

// Define the Apontamento type
export const ApontamentoType = {
  _id: '',
  periodo: '',
  unidade: '',
  faturamento: 0,
  recebimento: 0,
  despesa: 0,
  inadimplenciaPercentual: 0,
  inadimplenciaValor: 0,
  nivel: '',
  dataInicio: '',
  dataFim: '',
  mes: '',
  ano: 0,
  createdAt: '',
  updatedAt: ''
};

// Create a context for apontamentos
const ApontamentosContext = createContext();

// Provider component for the apontamentos context
export function ApontamentosProvider({ children }) {
  const [apontamentos, setApontamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Function to initialize data loading
  const initializeData = () => {
    if (!shouldFetch) {
      setShouldFetch(true);
    }
  };

  // Fetch apontamentos based on the selected month and year
  const fetchApontamentos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get month name from the month number (0-indexed)
      const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      const monthName = months[currentMonth];

      // Create query params
      const queryParams = new URLSearchParams({
        ano: currentYear.toString(),
        mes: monthName
      });
      
      // Fetch apontamentos from the API
      const response = await fetch(`/api/apontamentos/search?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch apontamentos: ${response.statusText}`);
      }
      
      const data = await response.json();
      setApontamentos(data);
    } catch (err) {
      console.error('Error fetching apontamentos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a new apontamento
  const addApontamento = async (newApontamento) => {
    try {
      const response = await fetch('/api/apontamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApontamento)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add apontamento');
      }
      
      // Refetch apontamentos to update the list
      fetchApontamentos();
      
      return { success: true };
    } catch (err) {
      console.error('Error adding apontamento:', err);
      return { success: false, error: err.message };
    }
  };

  // Update an existing apontamento
  const updateApontamento = async (id, updatedData) => {
    try {
      const response = await fetch(`/api/apontamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update apontamento');
      }
      
      // Refetch apontamentos to update the list
      fetchApontamentos();
      
      return { success: true };
    } catch (err) {
      console.error('Error updating apontamento:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete an apontamento
  const deleteApontamento = async (id) => {
    try {
      const response = await fetch(`/api/apontamentos/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete apontamento');
      }
      
      // Refetch apontamentos to update the list
      fetchApontamentos();
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting apontamento:', err);
      return { success: false, error: err.message };
    }
  };

  // Effect to fetch apontamentos when the selected month or year changes
  useEffect(() => {
    if (shouldFetch) {
      fetchApontamentos();
    }
  }, [shouldFetch, currentMonth, currentYear]);

  // Create the context value object
  const contextValue = {
    apontamentos,
    loading,
    error,
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    fetchApontamentos,
    addApontamento,
    updateApontamento,
    deleteApontamento,
    initializeData
  };

  return (
    <ApontamentosContext.Provider value={contextValue}>
      {children}
    </ApontamentosContext.Provider>
  );
}

// Custom hook to use the apontamentos context
export function useApontamentosContext() {
  const context = useContext(ApontamentosContext);
  if (!context) {
    throw new Error('useApontamentosContext must be used within an ApontamentosProvider');
  }
  return context;
}

export default ApontamentosContext; 