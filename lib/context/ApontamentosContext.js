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
  updatedAt: '',
  isCalculated: false
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

  // Calculate totals from individual unit apontamentos
  const calculateTotals = (apontamentosData) => {
    // Filter out any existing "Total" entries
    const unitApontamentos = apontamentosData.filter(item => item.unidade !== "Total");
    
    // If no unit apontamentos, return the original data
    if (unitApontamentos.length === 0) {
      return apontamentosData;
    }

    // Get unique periods from the apontamentos
    const uniquePeriods = [...new Set(unitApontamentos.map(a => a.periodo))];
    
    // For each unique period, calculate totals
    const calculatedTotals = uniquePeriods.map(period => {
      // Filter apontamentos for this period
      const apontamentosForPeriod = unitApontamentos.filter(a => a.periodo === period);
      
      if (apontamentosForPeriod.length === 0) return null;
      
      // Take sample apontamento for period-specific data
      const sampleApontamento = apontamentosForPeriod[0];
      
      // Calculate sums
      const totalFaturamento = apontamentosForPeriod.reduce((sum, a) => sum + a.faturamento, 0);
      const totalRecebimento = apontamentosForPeriod.reduce((sum, a) => sum + a.recebimento, 0);
      const totalDespesa = apontamentosForPeriod.reduce((sum, a) => sum + a.despesa, 0);
      
      // Calculate inadimplência percentual (faturamento - recebimento) / faturamento * 100
      const inadimplenciaPercentual = totalFaturamento === 0 
        ? 0 
        : Number(((totalFaturamento - totalRecebimento) / totalFaturamento * 100).toFixed(2));
      
      // Create calculated total object
      return {
        _id: `calculated-total-${period}`,
        periodo: period,
        unidade: "Total",
        faturamento: totalFaturamento,
        recebimento: totalRecebimento,
        despesa: totalDespesa,
        inadimplenciaPercentual: inadimplenciaPercentual,
        inadimplenciaValor: totalFaturamento - totalRecebimento,
        nivel: '',
        dataInicio: sampleApontamento.dataInicio,
        dataFim: sampleApontamento.dataFim,
        mes: sampleApontamento.mes,
        ano: sampleApontamento.ano,
        isCalculated: true // Mark as calculated to identify it
      };
    }).filter(Boolean);
    
    // Find the latest total by looking at the dataFim date
    let latestTotal = null;
    if (calculatedTotals.length > 0) {
      latestTotal = calculatedTotals.reduce((latest, current) => {
        // If we don't have a latest yet, use the current one
        if (!latest) return current;
        
        // Compare dates to find the most recent one
        const latestDate = new Date(latest.dataFim);
        const currentDate = new Date(current.dataFim);
        
        return currentDate > latestDate ? current : latest;
      }, null);
    }
    
    // Return unit apontamentos plus only the latest calculated total
    return [...unitApontamentos, ...(latestTotal ? [latestTotal] : [])];
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
      
      // Apply the total calculation and set the apontamentos
      const dataWithCalculatedTotals = calculateTotals(data);
      setApontamentos(dataWithCalculatedTotals);
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
      // Don't allow manually adding "Total" apontamentos
      if (newApontamento.unidade === "Total") {
        throw new Error("Não é possível adicionar apontamentos do tipo 'Total' manualmente. Os totais são calculados automaticamente.");
      }
      
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
      // Don't allow updating to "Total" unidade
      if (updatedData.unidade === "Total") {
        throw new Error("Não é possível alterar um apontamento para o tipo 'Total'. Os totais são calculados automaticamente.");
      }
      
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
      // Check if this is a calculated total (which can't be deleted)
      if (id.startsWith('calculated-total-')) {
        throw new Error("Não é possível excluir totais calculados automaticamente.");
      }
      
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