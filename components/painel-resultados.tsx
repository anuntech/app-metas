"use client"

import { useState, useEffect, ReactNode } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ProgressCard } from "./progress-card"
import { UnitCard } from "./unit-card"
import { PageHeader } from "@/components/ui/page-header"
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { DateRange } from 'react-date-range'

// Define types for API responses
type SummaryData = {
  faturamento: {
    atual: number
    meta: number
    restante: number
    progresso: number
    nivel?: string
  }
  faturamentoPorFuncionario: {
    atual: number
    meta: number
    restante: number
    progresso: number
    nivel?: string
  }
  despesa: {
    atual: number
    meta: number
    restante: number
    progresso: number
    valorReais: number
    nivel?: string
  }
  inadimplencia: {
    atual: number
    meta: number
    restante: number
    progresso: number
    valorReais: number
    nivel?: string
  }
  totalFuncionarios: number
}

type UnitData = {
  nome: string
  faturamento: {
    atual: number
    meta: number
    progresso: number
    nivel?: string
  }
  despesa: {
    atual: number
    meta: number
    progresso: number
    valorReais: number
    isNegative: boolean
    nivel?: string
  }
  inadimplencia: {
    atual: number
    meta: number
    progresso: number
    valorReais: number
    isNegative: boolean
    nivel?: string
  }
}

// Wrapper components to handle ReactNode as titles
function ProgressCardWithLevel({ title, level, ...props }: { title: string, level?: string } & Omit<React.ComponentProps<typeof ProgressCard>, 'title'>) {
  // Convert the title and level to a string format that looks like a level indicator
  const titleStr = level ? `${title} (Nível ${level})` : title;
  
  return (
    <ProgressCard
      title={titleStr}
      {...props}
    />
  );
}

export default function PainelResultados() {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      key: 'selection'
    }
  ])
  
  const [loading, setLoading] = useState(false)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [unitsData, setUnitsData] = useState<UnitData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentMetaLevel, setCurrentMetaLevel] = useState<string>("I")
  const [metaCompleting, setMetaCompleting] = useState<boolean>(false)
  const [updatingUnitIndex, setUpdatingUnitIndex] = useState<number | null>(null)
  const [activeMetaLevels, setActiveMetaLevels] = useState<{[key: string]: string}>({})

  // Month names array
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Function to handle next meta level for summary card
  const handleNextMetaLevel = async () => {
    if (metaCompleting) return; // Prevent multiple clicks
    
    console.log(`[handleNextMetaLevel] Starting with current level ${currentMetaLevel}`);
    
    // Get the current month and year
    const currentDate = dateRange[0].startDate;
    const month = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    
    setMetaCompleting(true);
    
    try {
      // Call API to mark the total meta as complete
      console.log(`[handleNextMetaLevel] Completing Total meta at level ${currentMetaLevel}`);
      const response = await fetch('/api/dashboard/meta/complete-total', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metaLevel: currentMetaLevel,
          month,
          year
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete meta');
      }
      
      const result = await response.json();
      console.log(`[handleNextMetaLevel] Complete meta response:`, result);
      
      // Update to the next meta level
      const nextLevel = result.nextLevel;
      console.log(`[handleNextMetaLevel] Updating to next level: ${nextLevel}`);
      
      // Set the current meta level first
      setCurrentMetaLevel(nextLevel);
      
      // Update activeMetaLevels for the Total unit
      setActiveMetaLevels(prev => {
        const updated = {
          ...prev,
          Total: nextLevel
        };
        console.log(`[handleNextMetaLevel] Updated active levels:`, updated);
        return updated;
      });
      
      // We need to completely refresh the data after changing the total meta level
      // This is important to ensure everything is in sync
      console.log(`[handleNextMetaLevel] Refreshing active meta levels`);
      await fetchActiveMetaLevels();
      
      // Very important: Pass the next level explicitly to ensure we fetch summary data
      // with the correct level, not the one from state which might not be updated yet
      console.log(`[handleNextMetaLevel] Fetching dashboard data with next level ${nextLevel}`);
      await fetchDashboardData(nextLevel);
      
    } catch (err) {
      console.error('[handleNextMetaLevel] Error completing meta:', err);
      setError(err instanceof Error ? err.message : 'Error completing meta');
    } finally {
      setMetaCompleting(false);
    }
  }
  
  // Function to handle next meta level for a specific unit
  const handleUnitNextMeta = async (unitName: string, currentLevel: string, unitIndex: number) => {
    if (metaCompleting || updatingUnitIndex !== null) return; // Prevent multiple clicks
    
    console.log(`Starting next meta for ${unitName} with current level ${currentLevel}`);
    
    // Get the current month and year
    const currentDate = dateRange[0].startDate;
    const month = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    
    setUpdatingUnitIndex(unitIndex);
    
    try {
      // Call API to mark the unit meta as complete
      console.log(`Completing meta for ${unitName} at level ${currentLevel}`);
      const response = await fetch('/api/dashboard/meta/complete-unit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unitName,
          metaLevel: currentLevel,
          month,
          year
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete unit meta');
      }
      
      const result = await response.json();
      console.log(`Got response for ${unitName}:`, result);
      
      if (result.hasNextMeta) {
        // Update activeMetaLevels state with the new level
        const nextLevel = result.nextLevel;
        console.log(`${unitName} has next level: ${nextLevel}`);
        
        // Update the active meta levels
        setActiveMetaLevels(prev => {
          const updated = {
            ...prev,
            [unitName]: nextLevel
          };
          console.log(`Updated active levels:`, updated);
          return updated;
        });
        
        // Fetch data for just this unit with the next level
        console.log(`Fetching new data for ${unitName} at level ${nextLevel}`);
        const unitData = await fetchUnitData(unitName, nextLevel);
        
        if (unitData) {
          console.log(`Received unit data:`, unitData);
          // Create a new copy of the units array to avoid race conditions
          const updatedUnitsData = [...unitsData];
          
          // Make sure we're updating the correct index in case the array changed
          const currentUnitIndex = updatedUnitsData.findIndex(u => u.nome === unitName);
          
          // Use the found index if it exists, otherwise use the original index
          const indexToUpdate = currentUnitIndex !== -1 ? currentUnitIndex : unitIndex;
          
          console.log(`Updating ${unitName} at index ${indexToUpdate} with level ${nextLevel}`);
          
          // Ensure the unit data has the correct meta level explicitly set
          unitData.faturamento.nivel = nextLevel;
          unitData.despesa.nivel = nextLevel;
          unitData.inadimplencia.nivel = nextLevel;
          
          // Update this specific unit with next level data
          updatedUnitsData[indexToUpdate] = unitData;
          
          // Set state with the new array
          setUnitsData(updatedUnitsData);
        } else {
          console.error(`Failed to fetch data for ${unitName} at level ${nextLevel}`);
        }
      } else {
        console.log(`${unitName} has no next meta, removing from list`);
        // If there's no next meta for this unit, just remove it from the list
        const updatedUnitsData = unitsData.filter((_, index) => index !== unitIndex);
        setUnitsData(updatedUnitsData);
        
        // Also remove it from activeMetaLevels
        const updatedLevels = { ...activeMetaLevels };
        delete updatedLevels[unitName];
        setActiveMetaLevels(updatedLevels);
      }
      
      // After processing this unit, ensure all active meta levels are in sync
      // by fetching them again from the server
      console.log(`Refreshing active meta levels after updating ${unitName}`);
      const refreshedLevels = await fetchActiveMetaLevels();
      console.log(`Refreshed levels:`, refreshedLevels);
      
    } catch (err) {
      console.error('Error completing unit meta:', err);
      setError(err instanceof Error ? err.message : 'Error completing unit meta');
    } finally {
      setUpdatingUnitIndex(null);
    }
  }

  // Function to fetch active meta levels for each unit
  const fetchActiveMetaLevels = async () => {
    try {
      // Get the current month and year
      const currentDate = dateRange[0].startDate;
      const month = monthNames[currentDate.getMonth()];
      const year = currentDate.getFullYear();
      
      // Build query params
      const queryParams = new URLSearchParams({ 
        month, 
        year: year.toString()
      });
      
      // Fetch active meta levels
      const response = await fetch(`/api/dashboard/meta/active-levels?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch active meta levels');
      }
      
      const result = await response.json();
      console.log('Active meta levels:', result);
      
      setActiveMetaLevels(result);
      
      return result;
    } catch (err) {
      console.error('Error fetching active meta levels:', err);
      return {};
    }
  };

  // Function to fetch a single unit's data
  const fetchUnitData = async (unitName: string, metaLevel: string) => {
    try {
      console.log(`[fetchUnitData] Fetching data for ${unitName} at level ${metaLevel}`);
      
      // Format dates for API requests
      const startDate = dateRange[0].startDate.toISOString();
      const endDate = dateRange[0].endDate.toISOString();
      
      // Build query params
      const queryParams = new URLSearchParams({ 
        startDate, 
        endDate,
        metaLevel
      });
      
      // Fetch unit data
      const response = await fetch(`/api/dashboard/units?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch unit data');
      }
      
      const unitsResult = await response.json();
      console.log(`[fetchUnitData] Got ${unitsResult.length} units, looking for ${unitName}`);
      
      // Find the unit in the results
      const unitData = unitsResult.find((u: UnitData) => u.nome === unitName);
      
      if (unitData) {
        // Set the meta level for the unit - ensure this is explicitly the requested level
        unitData.faturamento.nivel = metaLevel;
        unitData.despesa.nivel = metaLevel;
        unitData.inadimplencia.nivel = metaLevel;
        
        console.log(`[fetchUnitData] Found ${unitName} with faturamento:`, {
          atual: unitData.faturamento.atual,
          meta: unitData.faturamento.meta,
          progresso: unitData.faturamento.progresso,
          nivel: unitData.faturamento.nivel
        });
      } else {
        console.error(`[fetchUnitData] Unit ${unitName} not found in API response`);
      }
      
      return unitData;
    } catch (err) {
      console.error(`Error fetching data for unit ${unitName}:`, err);
      return null;
    }
  };

  // Modified to fetch all units with their individual meta levels
  const fetchDashboardData = async (summaryMetaLevel = currentMetaLevel) => {
    setLoading(true);
    setError(null);
    
    console.log(`[fetchDashboardData] Starting with summary level ${summaryMetaLevel}`);
    
    try {
      // Format dates for API requests
      const startDate = dateRange[0].startDate.toISOString();
      const endDate = dateRange[0].endDate.toISOString();
      
      // Step 1: Fetch active meta levels for all units
      console.log(`[fetchDashboardData] Fetching active meta levels`);
      const levels = await fetchActiveMetaLevels();
      console.log(`[fetchDashboardData] Active meta levels:`, levels);
      
      // Make sure the current meta level state is updated
      if (levels.Total) {
        console.log(`[fetchDashboardData] Updating current meta level from ${currentMetaLevel} to ${levels.Total}`);
        setCurrentMetaLevel(levels.Total);
      }
      
      // Use the explicit summary level passed in, or the Total's active level, or the current level state
      // The explicit level takes precedence because it's used when we're specifically changing levels
      const effectiveSummaryLevel = summaryMetaLevel || levels.Total || currentMetaLevel;
      console.log(`[fetchDashboardData] Using effective summary level: ${effectiveSummaryLevel}`);
      
      // Step 2: Fetch summary data using the effective level
      const queryParams = new URLSearchParams({ 
        startDate, 
        endDate,
        metaLevel: effectiveSummaryLevel
      });
      
      console.log(`[fetchDashboardData] Fetching summary data with metaLevel=${effectiveSummaryLevel}`);
      const summaryResponse = await fetch(`/api/dashboard/summary?${queryParams}`);
      
      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.json();
        throw new Error(errorData.message || 'Erro ao carregar dados do resumo');
      }
      
      const summaryResult = await summaryResponse.json();
      console.log(`[fetchDashboardData] Summary data received:`, {
        faturamento: {
          atual: summaryResult.faturamento.atual,
          meta: summaryResult.faturamento.meta,
          progresso: summaryResult.faturamento.progresso
        }
      });
      
      // IMPORTANT: Force the summary data to use the effective level, regardless of what came from the API
      // This ensures the UI displays the correct level consistently
      summaryResult.faturamento.nivel = effectiveSummaryLevel;
      summaryResult.faturamentoPorFuncionario.nivel = effectiveSummaryLevel;
      summaryResult.despesa.nivel = effectiveSummaryLevel;
      summaryResult.inadimplencia.nivel = effectiveSummaryLevel;
      
      console.log(`[fetchDashboardData] Set summary data nivel to ${effectiveSummaryLevel}`);
      
      // Set summary data state
      setSummaryData(summaryResult);
      
      // Step 3: Fetch units data with their individual active meta levels
      const unitPromises = [];
      const unitNames = Object.keys(levels).filter(name => name !== 'Total');
      
      console.log(`[fetchDashboardData] Fetching individual data for units:`, 
        unitNames.map(name => `${name}: ${levels[name]}`));
      
      // For each unit, fetch its data with the corresponding active meta level
      for (const unitName of unitNames) {
        const unitLevel = levels[unitName];
        unitPromises.push(fetchUnitData(unitName, unitLevel));
      }
      
      // Wait for all unit data to be fetched
      console.log(`[fetchDashboardData] Waiting for all unit data to be fetched`);
      const unitResults = await Promise.all(unitPromises);
      
      // Filter out null results (units that couldn't be fetched)
      const validUnitResults = unitResults.filter(unit => unit !== null) as UnitData[];
      console.log(`[fetchDashboardData] Got ${validUnitResults.length} valid unit results`);
      
      // Filter out units where isComplete is true and there's no next meta
      // This ensures we don't show units that have completed all their metas
      const filteredUnitResults = validUnitResults.filter(unit => {
        // Keep all units for now, we trust the API to return the correct active meta levels
        return true;
      });
      
      // Define a specific order for units
      const unitOrder = ["Caieiras", "SP - Perus", "Francisco Morato", "Franco da Rocha", "Mairiporã"];
      
      // Sort units according to the custom order
      filteredUnitResults.sort((a, b) => {
        const indexA = unitOrder.indexOf(a.nome);
        const indexB = unitOrder.indexOf(b.nome);
        
        // If both units are in the ordered list, sort by their order
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        
        // If only one unit is in the ordered list, prioritize it
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        // Otherwise sort alphabetically
        return a.nome.localeCompare(b.nome);
      });
      
      // Ensure each unit has the correct nivel explicitly set from the active levels
      filteredUnitResults.forEach(unit => {
        const unitLevel = levels[unit.nome];
        if (unitLevel) {
          unit.faturamento.nivel = unitLevel;
          unit.despesa.nivel = unitLevel;
          unit.inadimplencia.nivel = unitLevel;
        }
      });
      
      console.log(`[fetchDashboardData] Final sorted unit data:`, filteredUnitResults.map(u => ({
        nome: u.nome,
        nivel: u.faturamento.nivel,
        faturamento: {
          atual: u.faturamento.atual,
          meta: u.faturamento.meta,
          progresso: u.faturamento.progresso
        }
      })));
      
      // Update state with fetched unit data
      setUnitsData(filteredUnitResults);
      
    } catch (err) {
      console.error('[fetchDashboardData] Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data when date range changes
  useEffect(() => {
    // Special handling for the initial load to ensure we get and use the correct Total level
    const initializeData = async () => {
      // First get the active levels
      const levels = await fetchActiveMetaLevels();
      
      // Then use the Total level (if available) when fetching dashboard data
      const totalLevel = levels.Total || currentMetaLevel;
      console.log(`[initializeData] Using total level: ${totalLevel} for initial load`);
      fetchDashboardData(totalLevel);
    };
    
    initializeData();
  }, [dateRange]);

  // Format currency values (BRL)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Format period string (e.g., "1 a 31 de Janeiro")
  const formatPeriod = (from: Date, to: Date) => {
    if (from.getMonth() === to.getMonth()) {
      return `${format(from, "dd", { locale: ptBR })} a ${format(to, "dd", { locale: ptBR })} de ${format(from, "MMMM", { locale: ptBR })}`
    } else {
      return `${format(from, "dd 'de' MMMM", { locale: ptBR })} a ${format(to, "dd 'de' MMMM", { locale: ptBR })}`
    }
  }

  // Handle date range change
  const handleDateRangeChange = (ranges: any) => {
    setDateRange([ranges.selection])
  }

  return (
    <div>
      <PageHeader title="Painel de resultados" />

      <div className="container mx-auto space-y-8 px-4 sm:px-6">
        {/* Total Summary Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Resumo total</h2>
              <p className="text-muted-foreground">Período: {formatPeriod(dateRange[0].startDate, dateRange[0].endDate)}</p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-brand-blue bg-opacity-10 hover:bg-brand-blue hover:bg-opacity-20 hover:text-brand-blue border-brand-blue text-brand-blue"
                onClick={handleNextMetaLevel}
                disabled={metaCompleting}
              >
                <span>Próxima meta</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-xs font-medium text-white">
                  {activeMetaLevels.Total || currentMetaLevel}
                </span>
              </Button>           

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="justify-start text-left font-normal text-brand-blue border-brand-blue text-sm"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-brand-blue" />
                    {formatPeriod(dateRange[0].startDate, dateRange[0].endDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <DateRange
                    editableDateInputs={true}
                    onChange={handleDateRangeChange}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    locale={ptBR}
                    rangeColors={['#1E40AF']}
                    months={1}
                    direction="vertical"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, index) => (
                <div 
                  key={`skeleton-${index}`} 
                  className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 animate-pulse"
                >
                  <div className="space-y-3">
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p>Erro ao carregar dados: {error}</p>
              <Button 
                onClick={() => fetchDashboardData()} 
                variant="outline" 
                className="mt-2"
              >
                Tentar novamente
              </Button>
            </div>
          ) : summaryData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Faturamento Card */}
              <ProgressCardWithLevel
                title="Faturamento"
                value={formatCurrency(summaryData.faturamento.atual)}
                target={formatCurrency(summaryData.faturamento.meta)}
                progress={summaryData.faturamento.progresso}
                remaining={`${formatCurrency(summaryData.faturamento.restante)} para a meta`}
                isNegative={false}
              />

              {/* Faturamento por funcionário Card */}
              <ProgressCardWithLevel
                title="Faturamento por funcionário"
                value={formatCurrency(summaryData.faturamentoPorFuncionario.atual)}
                target={formatCurrency(summaryData.faturamentoPorFuncionario.meta)}
                progress={summaryData.faturamentoPorFuncionario.progresso}
                remaining={`${formatCurrency(summaryData.faturamentoPorFuncionario.restante)} para a meta`}
                isNegative={false}
              />

              {/* Despesa Card */}
              <ProgressCardWithLevel
                title="Despesa"
                value={`${summaryData.despesa.atual.toFixed(2)}%`}
                target={`Meta: ${summaryData.despesa.meta.toFixed(2)}%`}
                progress={summaryData.despesa.progresso}
                remaining={`${Math.abs(summaryData.despesa.restante).toFixed(2)}% ${summaryData.despesa.atual > summaryData.despesa.meta ? "acima" : "abaixo"} da meta`}
                secondaryText={formatCurrency(summaryData.despesa.valorReais)}
                isNegative={summaryData.despesa.progresso >= 100}
              />

              {/* Inadimplência Card */}
              <ProgressCardWithLevel
                title="Inadimplência"
                value={`${summaryData.inadimplencia.atual.toFixed(2)}%`}
                target={`Meta: ${summaryData.inadimplencia.meta.toFixed(2)}%`}
                progress={summaryData.inadimplencia.progresso}
                remaining={`${Math.abs(summaryData.inadimplencia.restante).toFixed(2)}% ${summaryData.inadimplencia.restante > 0 ? "acima" : "abaixo"} da meta`}
                secondaryText={formatCurrency(summaryData.inadimplencia.valorReais)}
                isNegative={summaryData.inadimplencia.progresso >= 100}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado disponível para o período selecionado
            </div>
          )}
        </div>

        {/* Units Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Unidades</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, index) => (
                <div 
                  key={`unit-skeleton-${index}`} 
                  className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 animate-pulse"
                >
                  <div className="space-y-4">
                    <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-3 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-3 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p>Erro ao carregar dados: {error}</p>
              <Button 
                onClick={() => fetchDashboardData()} 
                variant="outline" 
                className="mt-2"
              >
                Tentar novamente
              </Button>
            </div>
          ) : unitsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                // Debug logging to check all unit data
                console.log("Units Data:", unitsData.map(u => ({ 
                  nome: u.nome, 
                  nivel: u.faturamento.nivel,
                  faturamento: {
                    atual: u.faturamento.atual,
                    meta: u.faturamento.meta,
                    progresso: u.faturamento.progresso
                  }
                })));
                
                return unitsData.map((unidade, index) => {
                  // Ensure the unit has the correct meta level value
                  const metaLevel = unidade.faturamento.nivel || currentMetaLevel;
                  
                  return (
                    <UnitCard
                      key={`${unidade.nome}-${index}`}
                      name={unidade.nome + (metaLevel ? ` (Nível ${metaLevel})` : '')}
                      onNextMeta={() => handleUnitNextMeta(unidade.nome, metaLevel, index)}
                      isLoading={updatingUnitIndex === index}
                      faturamento={{
                        atual: formatCurrency(unidade.faturamento.atual),
                        meta: formatCurrency(unidade.faturamento.meta),
                        progresso: unidade.faturamento.progresso,
                        isNegative: unidade.faturamento.progresso < 100
                      }}
                      despesa={{
                        atual: `${unidade.despesa.atual.toFixed(2)}%`,
                        meta: `${unidade.despesa.meta.toFixed(2)}%`,
                        progresso: unidade.despesa.progresso,
                        valorReais: formatCurrency(unidade.despesa.valorReais),
                        isNegative: unidade.despesa.progresso >= 100
                      }}
                      inadimplencia={{
                        atual: `${unidade.inadimplencia.atual.toFixed(2)}%`,
                        meta: `${unidade.inadimplencia.meta.toFixed(2)}%`,
                        progresso: unidade.inadimplencia.progresso,
                        valorReais: formatCurrency(unidade.inadimplencia.valorReais),
                        isNegative: unidade.inadimplencia.progresso >= 100
                      }}
                    />
                  );
                });
              })()}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma unidade encontrada para o período selecionado
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

