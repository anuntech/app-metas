"use client"

import { useState, useEffect } from "react"
import { format, isWeekend, addDays, differenceInCalendarDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ProgressCard } from "./progress-card"
import { UnitCard } from "./unit-card"
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { DateRange } from 'react-date-range'
import { useToast } from "@/components/custom-toast"
import { usePDFExport } from "@/hooks/usePDFExport"
import { PDFIcon } from "@/components/ui/pdf-icon"

// Type definitions for API responses
type ApiProgressResponse = {
  summary: {
    faturamento: {
      atual: number;
      overallProgress: number;
      metaLevels: MetaLevel[];
    };
    faturamentoPorFuncionario: {
      atual: number;
      overallProgress: number;
      metaLevels: MetaLevel[];
    };
    despesa: {
      atual: number;
      overallProgress: number;
      valorReais: number;
      metaLevels: MetaLevel[];
    };
    inadimplencia: {
      atual: number;
      overallProgress: number;
      valorReais: number;
      metaLevels: MetaLevel[];
    };
    quantidadeContratos: {
      atual: number;
      overallProgress: number;
      metaLevels: MetaLevel[];
    };
    ticketMedio: {
      atual: number;
      overallProgress: number;
      metaLevels: MetaLevel[];
    };
    totalFuncionarios: number;
  };
  units: Array<{
    nome: string;
    faturamento: {
      atual: number;
      overallProgress: number;
      metaLevels: MetaLevel[];
    };
    despesa: {
      atual: number;
      overallProgress: number;
      valorReais: number;
      metaLevels: MetaLevel[];
    };
    inadimplencia: {
      atual: number;
      overallProgress: number;
      valorReais: number;
      metaLevels: MetaLevel[];
    };
    quantidadeContratos: {
      atual: number;
      overallProgress: number;
      metaLevels: MetaLevel[];
    };
    ticketMedio: {
      atual: number;
      overallProgress: number;
      metaLevels: MetaLevel[];
    };
  }>;
};

// Update the type definitions to include metaLevels
type MetaLevel = {
  nivel: string;
  valor: number;
  progress: number;
};

type SummaryData = {
  faturamento: {
    atual: number
    meta: number
    restante: number
    progresso: number
    nivel?: string
    metaLevels?: MetaLevel[]
  }
  faturamentoPorFuncionario: {
    atual: number
    meta: number
    restante: number
    progresso: number
    nivel?: string
    metaLevels?: MetaLevel[]
  }
  despesa: {
    atual: number
    meta: number
    restante: number
    progresso: number
    valorReais: number
    nivel?: string
    metaLevels?: MetaLevel[]
  }
  inadimplencia: {
    atual: number
    meta: number
    restante: number
    progresso: number
    valorReais: number
    nivel?: string
    metaLevels?: MetaLevel[]
  }
  quantidadeContratos: {
    atual: number
    meta: number
    restante: number
    progresso: number
    nivel?: string
    metaLevels?: MetaLevel[]
  }
  ticketMedio: {
    atual: number
    meta: number
    restante: number
    progresso: number
    nivel?: string
    metaLevels?: MetaLevel[]
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
    metaLevels?: MetaLevel[]
  }
  despesa: {
    atual: number
    meta: number
    progresso: number
    valorReais: number
    isNegative: boolean
    nivel?: string
    metaLevels?: MetaLevel[]
  }
  inadimplencia: {
    atual: number
    meta: number
    progresso: number
    valorReais: number
    isNegative: boolean
    nivel?: string
    metaLevels?: MetaLevel[]
  }
  quantidadeContratos: {
    atual: number
    meta: number
    progresso: number
    nivel?: string
    metaLevels?: MetaLevel[]
  }
  ticketMedio: {
    atual: number
    meta: number
    progresso: number
    nivel?: string
    metaLevels?: MetaLevel[]
  }
}

// Wrapper components to handle ReactNode as titles
/* function ProgressCardWithLevel({ title, level, ...props }: { title: string, level?: string } & Omit<React.ComponentProps<typeof ProgressCard>, 'title'>) {
  // Convert the title and level to a string format that looks like a level indicator
  const titleStr = level ? `${title} (Nível ${level})` : title;
  
  return (
    <ProgressCard
      title={titleStr}
      {...props}
    />
  );
} */

export default function PainelResultados() {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      key: 'selection'
    }
  ])
  
  const [loading, setLoading] = useState(false)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [unitsData, setUnitsData] = useState<UnitData[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Use the toast hook
  const { addToast } = useToast()
  
  // Use the PDF export hook
  const { exportToPDF } = usePDFExport()

  // Month names array - keep for reference but mark as unused
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Calculate the number of business days in the selected period
  const calculateBusinessDays = (startDate: Date, endDate: Date) => {
    // Brazilian holidays for 2024 and 2025
    const holidays = [
      // 2024 holidays
      new Date(2024, 0, 1),  // New Year's Day
      new Date(2024, 1, 12), // Carnival Monday
      new Date(2024, 1, 13), // Carnival Tuesday
      new Date(2024, 1, 14), // Ash Wednesday
      new Date(2024, 2, 29), // Good Friday
      new Date(2024, 3, 21), // Tiradentes Day
      new Date(2024, 4, 1),  // Labor Day
      new Date(2024, 4, 30), // Corpus Christi
      new Date(2024, 8, 7),  // Independence Day
      new Date(2024, 9, 12), // Our Lady of Aparecida
      new Date(2024, 10, 2), // All Souls' Day
      new Date(2024, 10, 15), // Republic Proclamation Day
      new Date(2024, 11, 25), // Christmas Day
      
      // 2025 holidays
      new Date(2025, 0, 1),  // New Year's Day
      new Date(2025, 2, 3),  // Carnival Monday
      new Date(2025, 2, 4),  // Carnival Tuesday
      new Date(2025, 2, 5),  // Ash Wednesday
      new Date(2025, 3, 18), // Good Friday
      new Date(2025, 3, 21), // Tiradentes Day
      new Date(2025, 4, 1),  // Labor Day
      new Date(2025, 5, 19), // Corpus Christi
      new Date(2025, 8, 7),  // Independence Day
      new Date(2025, 9, 12), // Our Lady of Aparecida
      new Date(2025, 10, 2), // All Souls' Day
      new Date(2025, 10, 15), // Republic Proclamation Day
      new Date(2025, 11, 25), // Christmas Day
      
      // 2026 holidays
      new Date(2026, 0, 1),  // New Year's Day
      new Date(2026, 1, 16), // Carnival Monday
      new Date(2026, 1, 17), // Carnival Tuesday
      new Date(2026, 1, 18), // Ash Wednesday
      new Date(2026, 3, 3),  // Good Friday
      new Date(2026, 3, 21), // Tiradentes Day
      new Date(2026, 4, 1),  // Labor Day
    ];

    // Check if a date is a holiday
    const isHoliday = (date: Date) => {
      return holidays.some(holiday => 
        holiday.getDate() === date.getDate() && 
        holiday.getMonth() === date.getMonth() && 
        holiday.getFullYear() === date.getFullYear()
      );
    };

    // Count business days
    let businessDays = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
        businessDays++;
      }
      currentDate = addDays(currentDate, 1);
    }

    return businessDays;
  };

  // Get the business days count for the selected period
  const businessDays = calculateBusinessDays(dateRange[0].startDate, dateRange[0].endDate);

  // Fetch data from the new API endpoint
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Format dates for API requests
      const startDate = dateRange[0].startDate.toISOString();
      const endDate = dateRange[0].endDate.toISOString();
      
      // Fetch data using the new progress API endpoint
      const queryParams = new URLSearchParams({ 
        startDate, 
        endDate
      });
      
      console.log(`Fetching progress data with date range:`, {
        startDate,
        endDate,
        queryString: queryParams.toString()
      });
      
      const progressResponse = await fetch(`/api/dashboard/progress?${queryParams}`);
      
      if (!progressResponse.ok) {
        const errorData = await progressResponse.json();
        throw new Error(errorData.message || 'Erro ao carregar dados do progresso');
      }
      
      const progressData = await progressResponse.json();
      console.log(`Progress data received:`, progressData);
      
      // Check if we have data for Total/summary
      console.log('Summary data available:', !!progressData.summary && Object.keys(progressData.summary).length > 0);
      if (progressData.summary && progressData.summary.faturamento) {
        console.log('Total faturamento:', progressData.summary.faturamento.atual);
      } else {
        console.log('No total faturamento data found in the response');
      }
      
      // Log apontamento availability
      if (progressData.apontamentos) {
        console.log('Total apontamentos found:', progressData.apontamentos.length);
        console.log('Apontamentos:', progressData.apontamentos);
      } else {
        console.log('No apontamentos data in the response');
      }
      
      // Transform the progress data to match our state structure
      const transformedSummary = transformSummaryData(progressData.summary);
      console.log('Transformed summary data:', transformedSummary);
      setSummaryData(transformedSummary);
      
      // Transform and set units data
      const transformedUnits = transformUnitsData(progressData.units);
      console.log('Transformed units data:', transformedUnits);
      setUnitsData(transformedUnits);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      addToast({
        title: "Erro",
        message: err instanceof Error ? err.message : 'Erro ao carregar dados',
        type: "error",
        duration: 5000,
      });
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };
  
  // Transform progress data to match our summary data structure
  const transformSummaryData = (progressSummary: ApiProgressResponse["summary"]): SummaryData => {
    // Ensure the summary data exists
    if (!progressSummary) {
      console.error('Invalid or empty summary data');
      return {
        faturamento: {
          atual: 0,
          meta: 0,
          restante: 0,
          progresso: 0,
          metaLevels: []
        },
        faturamentoPorFuncionario: {
          atual: 0,
          meta: 0,
          restante: 0,
          progresso: 0,
          metaLevels: []
        },
        despesa: {
          atual: 0,
          meta: 0,
          restante: 0,
          progresso: 0,
          valorReais: 0,
          metaLevels: []
        },
        inadimplencia: {
          atual: 0,
          meta: 0,
          restante: 0,
          progresso: 0,
          valorReais: 0,
          metaLevels: []
        },
        quantidadeContratos: {
          atual: 0,
          meta: 0,
          restante: 0,
          progresso: 0,
          metaLevels: []
        },
        ticketMedio: {
          atual: 0,
          meta: 0,
          restante: 0,
          progresso: 0,
          metaLevels: []
        },
        totalFuncionarios: 0
      };
    }

    // Create default structure to handle missing properties
    const defaultMetrics = {
      atual: 0,
      overallProgress: 0,
      metaLevels: []
    };
    
    // Safely access faturamento or use default
    const faturamento = progressSummary.faturamento || defaultMetrics;
    const faturamentoPorFuncionario = progressSummary.faturamentoPorFuncionario || defaultMetrics;
    
    // Safely access despesa or use default with valorReais
    const despesa = progressSummary.despesa || {...defaultMetrics, valorReais: 0};
    const inadimplencia = progressSummary.inadimplencia || {...defaultMetrics, valorReais: 0};

    // For metrics that have actual values but no meta levels (e.g., we have apontamento but no metas)
    // Set a default meta value that's a bit higher than the atual value for display purposes
    const getDefaultMetaValue = (atual: number) => atual * 1.1; // 10% higher than atual as default
    
    // Get meta value, defaulting to something reasonable if metaLevels is empty
    const getMetaValue = (metric: { atual: number, metaLevels?: MetaLevel[] }) => {
      if (metric.metaLevels && metric.metaLevels.length > 0) {
        return metric.metaLevels[0].valor;
      }
      return getDefaultMetaValue(metric.atual);
    };
    
    const quantidadeContratos = progressSummary.quantidadeContratos || defaultMetrics;
    const ticketMedio = progressSummary.ticketMedio || defaultMetrics;

    // Calculate ticket médio if we have faturamento and quantidadeContratos
    const ticketMedioAtual = progressSummary.faturamento?.atual && progressSummary.quantidadeContratos?.atual
      ? progressSummary.faturamento.atual / progressSummary.quantidadeContratos.atual
      : 0;

    // Calculate ticket médio meta if we have metas for both
    const ticketMedioMeta = progressSummary.faturamento?.metaLevels?.[0]?.valor && progressSummary.quantidadeContratos?.metaLevels?.[0]?.valor
      ? progressSummary.faturamento.metaLevels[0].valor / progressSummary.quantidadeContratos.metaLevels[0].valor
      : 0;

    // Calculate progress for ticket médio
    const ticketMedioProgress = ticketMedioMeta > 0
      ? (ticketMedioAtual / ticketMedioMeta) * 100
      : 0;

    return {
      faturamento: {
        atual: faturamento.atual,
        meta: getMetaValue(faturamento),
        restante: Math.max(0, getMetaValue(faturamento) - faturamento.atual),
        progresso: faturamento.overallProgress,
        metaLevels: faturamento.metaLevels || []
      },
      faturamentoPorFuncionario: {
        atual: faturamentoPorFuncionario.atual,
        meta: getMetaValue(faturamentoPorFuncionario),
        restante: Math.max(0, getMetaValue(faturamentoPorFuncionario) - faturamentoPorFuncionario.atual),
        progresso: faturamentoPorFuncionario.overallProgress,
        metaLevels: faturamentoPorFuncionario.metaLevels || []
      },
      despesa: {
        atual: despesa.atual,
        meta: getMetaValue(despesa),
        restante: despesa.atual - getMetaValue(despesa),
        progresso: despesa.overallProgress,
        valorReais: despesa.valorReais || 0,
        metaLevels: despesa.metaLevels || []
      },
      inadimplencia: {
        atual: inadimplencia.atual,
        meta: getMetaValue(inadimplencia),
        restante: inadimplencia.atual - getMetaValue(inadimplencia),
        progresso: inadimplencia.overallProgress,
        valorReais: inadimplencia.valorReais || 0,
        metaLevels: inadimplencia.metaLevels || []
      },
      quantidadeContratos: {
        atual: quantidadeContratos.atual,
        meta: getMetaValue(quantidadeContratos),
        restante: Math.max(0, getMetaValue(quantidadeContratos) - quantidadeContratos.atual),
        progresso: quantidadeContratos.overallProgress,
        metaLevels: quantidadeContratos.metaLevels || []
      },
      ticketMedio: {
        atual: ticketMedioAtual,
        meta: ticketMedioMeta,
        restante: Math.max(0, ticketMedioMeta - ticketMedioAtual),
        progresso: ticketMedioProgress,
        metaLevels: [{
          nivel: 'I',
          valor: ticketMedioMeta,
          progress: ticketMedioProgress
        }]
      },
      totalFuncionarios: progressSummary.totalFuncionarios || 0
    };
  };
  
  // Transform progress data to match our units data structure
  const transformUnitsData = (units: ApiProgressResponse["units"]): UnitData[] => {
    if (!units || units.length === 0) return [];
    
    // Helper function for getting default meta value when no meta levels exist
    const getDefaultMetaValue = (atual: number) => atual * 1.1; // 10% higher than atual as default
    
    // Get meta value, defaulting to something reasonable if metaLevels is empty
    const getMetaValue = (metric: { atual: number, metaLevels?: MetaLevel[] }) => {
      if (metric.metaLevels && metric.metaLevels.length > 0) {
        return metric.metaLevels[0].valor;
      }
      return getDefaultMetaValue(metric.atual);
    };
    
    return units.map(unit => {
      // Calculate ticket médio for each unit
      const ticketMedioAtual = unit.faturamento?.atual && unit.quantidadeContratos?.atual
        ? unit.faturamento.atual / unit.quantidadeContratos.atual
        : 0;

      const ticketMedioMeta = unit.faturamento?.metaLevels?.[0]?.valor && unit.quantidadeContratos?.metaLevels?.[0]?.valor
        ? unit.faturamento.metaLevels[0].valor / unit.quantidadeContratos.metaLevels[0].valor
        : 0;

      const ticketMedioProgress = ticketMedioMeta > 0
        ? (ticketMedioAtual / ticketMedioMeta) * 100
        : 0;

      return {
        nome: unit.nome,
        faturamento: {
          atual: unit.faturamento?.atual || 0,
          meta: getMetaValue(unit.faturamento || { atual: 0 }),
          progresso: unit.faturamento?.overallProgress || 0,
          metaLevels: unit.faturamento?.metaLevels || []
        },
        despesa: {
          atual: unit.despesa?.atual || 0,
          meta: getMetaValue(unit.despesa || { atual: 0 }),
          progresso: unit.despesa?.overallProgress || 0,
          valorReais: unit.despesa?.valorReais || 0,
          isNegative: true,
          metaLevels: unit.despesa?.metaLevels || []
        },
        inadimplencia: {
          atual: unit.inadimplencia?.atual || 0,
          meta: getMetaValue(unit.inadimplencia || { atual: 0 }),
          progresso: unit.inadimplencia?.overallProgress || 0,
          valorReais: unit.inadimplencia?.valorReais || 0,
          isNegative: true,
          metaLevels: unit.inadimplencia?.metaLevels || []
        },
        quantidadeContratos: {
          atual: unit.quantidadeContratos?.atual || 0,
          meta: getMetaValue(unit.quantidadeContratos || { atual: 0 }),
          progresso: unit.quantidadeContratos?.overallProgress || 0,
          metaLevels: unit.quantidadeContratos?.metaLevels || []
        },
        ticketMedio: {
          atual: ticketMedioAtual,
          meta: ticketMedioMeta,
          progresso: ticketMedioProgress,
          metaLevels: [{
            nivel: 'I',
            valor: ticketMedioMeta,
            progress: ticketMedioProgress
          }]
        }
      };
    });
  };
  
  // Fetch data when date range changes
  useEffect(() => {
    fetchDashboardData();
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDateRangeChange = (ranges: any) => {
    setDateRange([ranges.selection])
  }

  // Handle PDF export
  const handlePDFExport = async () => {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const periodStr = formatPeriod(dateRange[0].startDate, dateRange[0].endDate);
    const filename = `painel-resultados-${periodStr.replace(/\s+/g, '-').toLowerCase()}-${currentDate.replace(/\//g, '-')}.pdf`;
    
    const result = await exportToPDF('painel-resultados-content', {
      filename,
      format: 'a4',
      orientation: 'portrait',
      quality: 0.95,
      margins: { top: 3, right: 3, bottom: 3, left: 3 }
    });

    if (result.success) {
      addToast({
        title: "Sucesso!",
        message: "PDF exportado com sucesso!",
        type: "success",
        duration: 3000,
      });
    } else {
      addToast({
        title: "Erro",
        message: result.message,
        type: "error",
        duration: 5000,
      });
    }
  }

  // New function to get remaining text based on the next incomplete meta level
  const getRemainingText = (faturamento: { atual: number; metaLevels?: MetaLevel[] }) => {
    if (!faturamento || !faturamento.metaLevels || faturamento.metaLevels.length === 0) {
      return "Sem metas definidas";
    }

    // With just a single meta level, we don't need to sort or find the next level
    const metaLevel = faturamento.metaLevels[0];
    if (!metaLevel) return "Sem metas definidas";
    
    // Calculate remaining value to reach this meta
    const remaining = Math.max(0, metaLevel.valor - faturamento.atual);
    return `${formatCurrency(remaining)} para Meta`;
  };

  // Function to get remaining text for reversed metrics like despesa and inadimplência
  const getReversedRemainingText = (metric: { atual: number; meta: number; restante: number; metaLevels?: MetaLevel[] }) => {
    if (!metric || !metric.metaLevels || metric.metaLevels.length === 0) {
      // If no meta levels, use simple comparison with meta value
      const isGood = metric.atual <= metric.meta;
      return `${Math.abs(metric.restante || 0).toFixed(2)}% ${isGood ? "abaixo" : "acima"} da meta`;
    }

    // With just a single meta level, we don't need to sort or find the next level
    const metaLevel = metric.metaLevels[0];
    if (!metaLevel) return `${Math.abs(metric.restante || 0).toFixed(2)}% da meta`;
    
    // For uncompleted metas, show difference between actual and target
    const difference = Math.abs(metric.atual - metaLevel.valor).toFixed(2);
    const isGood = metric.atual <= metaLevel.valor;
    return `${difference}% ${isGood ? "abaixo" : "acima"} da meta`;
  };

  return (
    <div>
      <div id="painel-resultados-content" className="container mx-auto space-y-8 px-4 sm:px-6 mt-5">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-semibold">Resultado dos Indicadores de Premiação</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-muted-foreground">Período: {formatPeriod(dateRange[0].startDate, dateRange[0].endDate)}</p>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    {businessDays} dias úteis
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                    {differenceInCalendarDays(dateRange[0].endDate, dateRange[0].startDate) + 1} dias corridos
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePDFExport}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50"
                disabled={loading || !summaryData}
              >
                <PDFIcon className="mr-2 h-4 w-4" />
                Exportar PDF
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
          ) : !summaryData && error ? (
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
              <ProgressCard
                title="Faturamento"
                value={formatCurrency(summaryData.faturamento.atual)}
                target={formatCurrency(summaryData.faturamento.meta)}
                progress={summaryData.faturamento.progresso}
                overallProgress={summaryData.faturamento.progresso}
                remaining={getRemainingText(summaryData.faturamento)}
                isNegative={false}
                metaLevels={summaryData.faturamento.metaLevels}
              />

              {/* Faturamento por funcionário Card */}
              <ProgressCard
                title="Faturamento por funcionário"
                value={formatCurrency(summaryData.faturamentoPorFuncionario.atual)}
                target={formatCurrency(summaryData.faturamentoPorFuncionario.meta)}
                progress={summaryData.faturamentoPorFuncionario.progresso}
                overallProgress={summaryData.faturamentoPorFuncionario.progresso}
                remaining={getRemainingText(summaryData.faturamentoPorFuncionario)}
                isNegative={false}
                metaLevels={summaryData.faturamentoPorFuncionario.metaLevels}
              />

              {/* Despesa Card */}
              <ProgressCard
                title="Despesa"
                value={`${summaryData.despesa.atual.toFixed(2)}%`}
                target={`${summaryData.despesa.meta.toFixed(2)}%`}
                progress={summaryData.despesa.progresso}
                overallProgress={summaryData.despesa.progresso}
                remaining={getReversedRemainingText(summaryData.despesa)}
                isNegative={true}
                metaLevels={summaryData.despesa.metaLevels}
              />

              {/* Inadimplência Card */}
              <ProgressCard
                title="Inadimplência"
                value={`${summaryData.inadimplencia.atual.toFixed(2)}%`}
                target={`${summaryData.inadimplencia.meta.toFixed(2)}%`}
                progress={summaryData.inadimplencia.progresso}
                overallProgress={summaryData.inadimplencia.progresso}
                remaining={getReversedRemainingText(summaryData.inadimplencia)}
                isNegative={true}
                metaLevels={summaryData.inadimplencia.metaLevels}
              />

              {/* Quantidade de Contratos Card */}
              <ProgressCard
                title="Quantidade de contratos"
                value={summaryData.quantidadeContratos.atual.toLocaleString('pt-BR')}
                target={summaryData.quantidadeContratos.meta.toLocaleString('pt-BR')}
                progress={summaryData.quantidadeContratos.progresso}
                overallProgress={summaryData.quantidadeContratos.progresso}
                remaining={getRemainingText(summaryData.quantidadeContratos)}
                isNegative={false}
                metaLevels={summaryData.quantidadeContratos.metaLevels}
              />

              {/* Ticket Médio Card */}
              <ProgressCard
                title="Ticket médio"
                value={formatCurrency(summaryData.ticketMedio.atual)}
                target={formatCurrency(summaryData.ticketMedio.meta)}
                progress={summaryData.ticketMedio.progresso}
                overallProgress={summaryData.ticketMedio.progresso}
                remaining={getRemainingText(summaryData.ticketMedio)}
                isNegative={false}
                metaLevels={summaryData.ticketMedio.metaLevels}
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
              {unitsData.map((unidade, index) => (
                <UnitCard
                  key={`${unidade.nome}-${index}`}
                  name={unidade.nome}
                  faturamento={{
                    atual: formatCurrency(unidade.faturamento.atual),
                    meta: formatCurrency(unidade.faturamento.meta),
                    progresso: unidade.faturamento.progresso,
                    isNegative: false,
                    metaLevels: unidade.faturamento.metaLevels,
                    overallProgress: unidade.faturamento.progresso
                  }}
                  despesa={{
                    atual: `${unidade.despesa.atual.toFixed(2)}%`,
                    meta: `${unidade.despesa.meta.toFixed(2)}%`,
                    progresso: unidade.despesa.progresso,
                    valorReais: formatCurrency(unidade.despesa.valorReais),
                    isNegative: true,
                    metaLevels: unidade.despesa.metaLevels,
                    overallProgress: unidade.despesa.progresso
                  }}
                  inadimplencia={{
                    atual: `${unidade.inadimplencia.atual.toFixed(2)}%`,
                    meta: `${unidade.inadimplencia.meta.toFixed(2)}%`,
                    progresso: unidade.inadimplencia.progresso,
                    valorReais: formatCurrency(unidade.inadimplencia.valorReais),
                    isNegative: true,
                    metaLevels: unidade.inadimplencia.metaLevels,
                    overallProgress: unidade.inadimplencia.progresso
                  }}
                  quantidadeContratos={{
                    atual: unidade.quantidadeContratos.atual.toLocaleString('pt-BR'),
                    meta: unidade.quantidadeContratos.meta.toLocaleString('pt-BR'),
                    progresso: unidade.quantidadeContratos.progresso,
                    isNegative: false,
                    metaLevels: unidade.quantidadeContratos.metaLevels,
                    overallProgress: unidade.quantidadeContratos.progresso
                  }}
                  ticketMedio={{
                    atual: formatCurrency(unidade.ticketMedio.atual),
                    meta: formatCurrency(unidade.ticketMedio.meta),
                    progresso: unidade.ticketMedio.progresso,
                    isNegative: false,
                    metaLevels: unidade.ticketMedio.metaLevels,
                    overallProgress: unidade.ticketMedio.progresso
                  }}
                />
              ))}
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

