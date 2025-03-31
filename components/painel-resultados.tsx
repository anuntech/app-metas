"use client"

import { useState, useEffect } from "react"
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
  }
  faturamentoPorFuncionario: {
    atual: number
    meta: number
    restante: number
    progresso: number
  }
  despesa: {
    atual: number
    meta: number
    restante: number
    progresso: number
    valorReais: number
  }
  inadimplencia: {
    atual: number
    meta: number
    restante: number
    progresso: number
    valorReais: number
  }
  totalFuncionarios: number
}

type UnitData = {
  nome: string
  faturamento: {
    atual: number
    meta: number
    progresso: number
  }
  despesa: {
    atual: number
    meta: number
    progresso: number
    valorReais: number
    isNegative: boolean
  }
  inadimplencia: {
    atual: number
    meta: number
    progresso: number
    valorReais: number
    isNegative: boolean
  }
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

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Format dates for API requests
      const startDate = dateRange[0].startDate.toISOString()
      const endDate = dateRange[0].endDate.toISOString()
      
      // Build query params
      const queryParams = new URLSearchParams({ startDate, endDate })
      
      // Fetch summary data
      const summaryResponse = await fetch(`/api/dashboard/summary?${queryParams}`)
      
      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.json()
        throw new Error(errorData.message || 'Erro ao carregar dados do resumo')
      }
      
      const summaryResult = await summaryResponse.json()
      
      // Fetch units data
      const unitsResponse = await fetch(`/api/dashboard/units?${queryParams}`)
      
      if (!unitsResponse.ok) {
        const errorData = await unitsResponse.json()
        throw new Error(errorData.message || 'Erro ao carregar dados das unidades')
      }
      
      const unitsResult = await unitsResponse.json()
      
      // Update state with fetched data
      setSummaryData(summaryResult)
      setUnitsData(unitsResult)
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch data when date range changes
  useEffect(() => {
    fetchDashboardData()
  }, [dateRange])

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
                onClick={fetchDashboardData} 
                variant="outline" 
                className="mt-2"
              >
                Tentar novamente
              </Button>
            </div>
          ) : summaryData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Faturamento Card */}
              <ProgressCard
                title="Faturamento"
                value={formatCurrency(summaryData.faturamento.atual)}
                target={formatCurrency(summaryData.faturamento.meta)}
                progress={summaryData.faturamento.progresso}
                remaining={`${formatCurrency(summaryData.faturamento.restante)} para a meta`}
                isNegative={false}
              />

              {/* Faturamento por funcionário Card */}
              <ProgressCard
                title="Faturamento por funcionário"
                value={formatCurrency(summaryData.faturamentoPorFuncionario.atual)}
                target={formatCurrency(summaryData.faturamentoPorFuncionario.meta)}
                progress={summaryData.faturamentoPorFuncionario.progresso}
                remaining={`${formatCurrency(summaryData.faturamentoPorFuncionario.restante)} para a meta`}
                isNegative={false}
              />

              {/* Despesa Card */}
              <ProgressCard
                title="Despesa"
                value={`${summaryData.despesa.atual.toFixed(2)}%`}
                target={`Meta: ${summaryData.despesa.meta.toFixed(2)}%`}
                progress={summaryData.despesa.progresso}
                remaining={`${Math.abs(summaryData.despesa.restante).toFixed(2)}% ${summaryData.despesa.atual > summaryData.despesa.meta ? "acima" : "abaixo"} da meta`}
                secondaryText={formatCurrency(summaryData.despesa.valorReais)}
                isNegative={summaryData.despesa.atual > summaryData.despesa.meta}
              />

              {/* Inadimplência Card */}
              <ProgressCard
                title="Inadimplência"
                value={`${summaryData.inadimplencia.atual.toFixed(2)}%`}
                target={`Meta: ${summaryData.inadimplencia.meta.toFixed(2)}%`}
                progress={summaryData.inadimplencia.progresso}
                remaining={`${Math.abs(summaryData.inadimplencia.restante).toFixed(2)}% ${summaryData.inadimplencia.restante > 0 ? "acima" : "abaixo"} da meta`}
                secondaryText={formatCurrency(summaryData.inadimplencia.valorReais)}
                isNegative={summaryData.inadimplencia.restante > 0}
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
            <p className="text-muted-foreground">Período: {formatPeriod(dateRange[0].startDate, dateRange[0].endDate)}</p>
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
                onClick={fetchDashboardData} 
                variant="outline" 
                className="mt-2"
              >
                Tentar novamente
              </Button>
            </div>
          ) : unitsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                // Debug logging to check Francisco Morato data
                console.log("Units Data:", unitsData.map(u => ({ 
                  nome: u.nome, 
                  despesa: { 
                    atual: u.despesa.atual, 
                    meta: u.despesa.meta, 
                    isNegative: u.despesa.atual > u.despesa.meta 
                  }
                })));
                
                return unitsData.map((unidade, index) => {
                  // Special handling for Francisco Morato
                  const isNegativeDespesa = unidade.nome === "Francisco Morato" 
                    ? true // Force to true for this specific unit
                    : unidade.despesa.atual > unidade.despesa.meta;
                  
                  return (
                    <UnitCard
                      key={`${unidade.nome}-${index}`}
                      name={unidade.nome}
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
                        isNegative: isNegativeDespesa
                      }}
                      inadimplencia={{
                        atual: `${unidade.inadimplencia.atual.toFixed(2)}%`,
                        meta: `${unidade.inadimplencia.meta.toFixed(2)}%`,
                        progresso: unidade.inadimplencia.progresso,
                        valorReais: formatCurrency(unidade.inadimplencia.valorReais),
                        isNegative: unidade.inadimplencia.atual > unidade.inadimplencia.meta
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

