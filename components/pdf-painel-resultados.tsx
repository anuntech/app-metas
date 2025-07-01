import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format, differenceInCalendarDays, isWeekend, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Type definitions matching the original component
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
    metaLevels?: MetaLevel[]
  }
  faturamentoPorFuncionario: {
    atual: number
    meta: number
    restante: number
    progresso: number
    metaLevels?: MetaLevel[]
  }
  despesa: {
    atual: number
    meta: number
    restante: number
    progresso: number
    valorReais: number
    metaLevels?: MetaLevel[]
  }
  inadimplencia: {
    atual: number
    meta: number
    restante: number
    progresso: number
    valorReais: number
    metaLevels?: MetaLevel[]
  }
  quantidadeContratos: {
    atual: number
    meta: number
    restante: number
    progresso: number
    metaLevels?: MetaLevel[]
  }
  ticketMedio: {
    atual: number
    meta: number
    restante: number
    progresso: number
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
    metaLevels?: MetaLevel[]
  }
  despesa: {
    atual: number
    meta: number
    progresso: number
    valorReais: number
    isNegative: boolean
    metaLevels?: MetaLevel[]
  }
  inadimplencia: {
    atual: number
    meta: number
    progresso: number
    valorReais: number
    isNegative: boolean
    metaLevels?: MetaLevel[]
  }
  quantidadeContratos: {
    atual: number
    meta: number
    progresso: number
    metaLevels?: MetaLevel[]
  }
  ticketMedio: {
    atual: number
    meta: number
    progresso: number
    metaLevels?: MetaLevel[]
  }
}

type PDFData = {
  summaryData: SummaryData;
  unitsData: UnitData[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

interface PDFPainelResultadosProps {
  data: PDFData;
}

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 15,
    borderBottom: '2 solid #e5e7eb',
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  periodInfo: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '2 6',
    borderRadius: 4,
    fontSize: 9,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    border: '1 solid #e5e7eb',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardTarget: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 6,
  },
  progressContainer: {
    backgroundColor: '#f3f4f6',
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 9,
    color: '#6b7280',
  },
  unitCard: {
    border: '1 solid #e5e7eb',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    backgroundColor: '#ffffff',
    marginBottom: 12,
    minHeight: 150,
  },
  unitName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  unitMetric: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottom: '1 solid #f3f4f6',
  },
  metricLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  metricMeta: {
    fontSize: 8,
    color: '#6b7280',
  },
  unitProgressContainer: {
    backgroundColor: '#f3f4f6',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  unitProgressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1e40af',
  },
});

// Utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatPeriod = (from: Date, to: Date) => {
  if (from.getMonth() === to.getMonth()) {
    return `${format(from, "dd", { locale: ptBR })} a ${format(to, "dd", { locale: ptBR })} de ${format(from, "MMMM", { locale: ptBR })}`;
  } else {
    return `${format(from, "dd 'de' MMMM", { locale: ptBR })} a ${format(to, "dd 'de' MMMM", { locale: ptBR })}`;
  }
};

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

const getProgressColor = (progress: number, isNegative: boolean = false) => {
  // Always use blue for progress bars
  return '#1e40af'; // blue
};

const getRemainingText = (metric: { atual: number; metaLevels?: MetaLevel[] }) => {
  if (!metric || !metric.metaLevels || metric.metaLevels.length === 0) {
    return "Sem metas definidas";
  }

  const metaLevel = metric.metaLevels[0];
  if (!metaLevel) return "Sem metas definidas";
  
  const remaining = Math.max(0, metaLevel.valor - metric.atual);
  return `${formatCurrency(remaining)} para Meta`;
};

const getReversedRemainingText = (metric: { atual: number; meta: number; restante: number; metaLevels?: MetaLevel[] }) => {
  if (!metric || !metric.metaLevels || metric.metaLevels.length === 0) {
    const isGood = metric.atual <= metric.meta;
    return `${Math.abs(metric.restante || 0).toFixed(2)}% ${isGood ? "abaixo" : "acima"} da meta`;
  }

  const metaLevel = metric.metaLevels[0];
  if (!metaLevel) return `${Math.abs(metric.restante || 0).toFixed(2)}% da meta`;
  
  const difference = Math.abs(metric.atual - metaLevel.valor).toFixed(2);
  const isGood = metric.atual <= metaLevel.valor;
  return `${difference}% ${isGood ? "abaixo" : "acima"} da meta`;
};

// Progress Card Component for PDF
const ProgressCardPDF: React.FC<{
  title: string;
  value: string;
  target: string;
  progress: number;
  remaining: string;
  isNegative?: boolean;
}> = ({ title, value, target, progress, remaining, isNegative = false }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardTarget}>Meta: {target}</Text>
    
    <View style={styles.progressContainer}>
      <View style={[
        styles.progressBar,
        { 
          width: `${Math.min(progress, 100)}%`,
          backgroundColor: getProgressColor(progress, isNegative)
        }
      ]} />
    </View>
    
    <Text style={styles.progressText}>
      {progress.toFixed(1)}% - {remaining}
    </Text>
  </View>
);

// Unit Card Component for PDF
const UnitCardPDF: React.FC<{
  unit: UnitData;
}> = ({ unit }) => (
  <View style={styles.unitCard}>
    <Text style={styles.unitName}>{unit.nome}</Text>
    
    <View style={styles.unitMetric}>
      <Text style={styles.metricLabel}>Faturamento</Text>
      <Text style={styles.metricValue}>{formatCurrency(unit.faturamento.atual)}</Text>
      <View style={styles.metricRow}>
        <View style={[styles.unitProgressContainer, { flex: 1, marginRight: 8 }]}>
          <View style={[
            styles.unitProgressBar,
            { width: `${Math.min(unit.faturamento.progresso, 100)}%` }
          ]} />
        </View>
        <Text style={styles.metricMeta}>Meta: {formatCurrency(unit.faturamento.meta)}</Text>
      </View>
    </View>
    
    <View style={styles.unitMetric}>
      <Text style={styles.metricLabel}>Despesa</Text>
      <Text style={styles.metricValue}>{unit.despesa.atual.toFixed(2)}%</Text>
      <View style={styles.metricRow}>
        <View style={[styles.unitProgressContainer, { flex: 1, marginRight: 8 }]}>
          <View style={[
            styles.unitProgressBar,
            { width: `${Math.min(unit.despesa.progresso, 100)}%` }
          ]} />
        </View>
        <Text style={styles.metricMeta}>Meta: {unit.despesa.meta.toFixed(2)}%</Text>
      </View>
    </View>
    
    <View style={styles.unitMetric}>
      <Text style={styles.metricLabel}>Inadimplência</Text>
      <Text style={styles.metricValue}>{unit.inadimplencia.atual.toFixed(2)}%</Text>
      <View style={styles.metricRow}>
        <View style={[styles.unitProgressContainer, { flex: 1, marginRight: 8 }]}>
          <View style={[
            styles.unitProgressBar,
            { width: `${Math.min(unit.inadimplencia.progresso, 100)}%` }
          ]} />
        </View>
        <Text style={styles.metricMeta}>Meta: {unit.inadimplencia.meta.toFixed(2)}%</Text>
      </View>
    </View>
    
    <View style={styles.unitMetric}>
      <Text style={styles.metricLabel}>Contratos</Text>
      <Text style={styles.metricValue}>{unit.quantidadeContratos.atual.toLocaleString('pt-BR')}</Text>
      <View style={styles.metricRow}>
        <View style={[styles.unitProgressContainer, { flex: 1, marginRight: 8 }]}>
          <View style={[
            styles.unitProgressBar,
            { width: `${Math.min(unit.quantidadeContratos.progresso, 100)}%` }
          ]} />
        </View>
        <Text style={styles.metricMeta}>Meta: {unit.quantidadeContratos.meta.toLocaleString('pt-BR')}</Text>
      </View>
    </View>
    
    <View style={[styles.unitMetric, { borderBottom: 'none' }]}>
      <Text style={styles.metricLabel}>Ticket Médio</Text>
      <Text style={styles.metricValue}>{formatCurrency(unit.ticketMedio.atual)}</Text>
      <View style={styles.metricRow}>
        <View style={[styles.unitProgressContainer, { flex: 1, marginRight: 8 }]}>
          <View style={[
            styles.unitProgressBar,
            { width: `${Math.min(unit.ticketMedio.progresso, 100)}%` }
          ]} />
        </View>
        <Text style={styles.metricMeta}>Meta: {formatCurrency(unit.ticketMedio.meta)}</Text>
      </View>
    </View>
  </View>
);

// Main PDF Component
const PDFPainelResultados: React.FC<PDFPainelResultadosProps> = ({ data }) => {
  const { summaryData, unitsData, dateRange } = data;
  const businessDays = calculateBusinessDays(dateRange.startDate, dateRange.endDate);
  const totalDays = differenceInCalendarDays(dateRange.endDate, dateRange.startDate) + 1;

  // Split units into chunks for better page distribution (4 units per page)
  const unitsPerPage = 4;
  const unitChunks = [];
  for (let i = 0; i < unitsData.length; i += unitsPerPage) {
    unitChunks.push(unitsData.slice(i, i + unitsPerPage));
  }

  return (
    <Document>
      {/* First page with summary only */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Resultado dos Indicadores de Premiação</Text>
          <Text style={styles.subtitle}>
            Período: {formatPeriod(dateRange.startDate, dateRange.endDate)}
          </Text>
          <View style={styles.periodInfo}>
            <Text style={styles.badge}>{businessDays} dias úteis</Text>
            <Text style={styles.badge}>{totalDays} dias corridos</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Geral</Text>
          <View style={styles.cardsContainer}>
            <ProgressCardPDF
              title="Faturamento"
              value={formatCurrency(summaryData.faturamento.atual)}
              target={formatCurrency(summaryData.faturamento.meta)}
              progress={summaryData.faturamento.progresso}
              remaining={getRemainingText(summaryData.faturamento)}
              isNegative={false}
            />
            
            <ProgressCardPDF
              title="Faturamento por funcionário"
              value={formatCurrency(summaryData.faturamentoPorFuncionario.atual)}
              target={formatCurrency(summaryData.faturamentoPorFuncionario.meta)}
              progress={summaryData.faturamentoPorFuncionario.progresso}
              remaining={getRemainingText(summaryData.faturamentoPorFuncionario)}
              isNegative={false}
            />
            
            <ProgressCardPDF
              title="Despesa"
              value={`${summaryData.despesa.atual.toFixed(2)}%`}
              target={`${summaryData.despesa.meta.toFixed(2)}%`}
              progress={summaryData.despesa.progresso}
              remaining={getReversedRemainingText(summaryData.despesa)}
              isNegative={true}
            />
            
            <ProgressCardPDF
              title="Inadimplência"
              value={`${summaryData.inadimplencia.atual.toFixed(2)}%`}
              target={`${summaryData.inadimplencia.meta.toFixed(2)}%`}
              progress={summaryData.inadimplencia.progresso}
              remaining={getReversedRemainingText(summaryData.inadimplencia)}
              isNegative={true}
            />
            
            <ProgressCardPDF
              title="Quantidade de contratos"
              value={summaryData.quantidadeContratos.atual.toLocaleString('pt-BR')}
              target={summaryData.quantidadeContratos.meta.toLocaleString('pt-BR')}
              progress={summaryData.quantidadeContratos.progresso}
              remaining={getRemainingText(summaryData.quantidadeContratos)}
              isNegative={false}
            />
            
            <ProgressCardPDF
              title="Ticket médio"
              value={formatCurrency(summaryData.ticketMedio.atual)}
              target={formatCurrency(summaryData.ticketMedio.meta)}
              progress={summaryData.ticketMedio.progresso}
              remaining={getRemainingText(summaryData.ticketMedio)}
              isNegative={false}
            />
          </View>
        </View>
      </Page>

      {/* Pages dedicated to units only */}
      {unitChunks.map((chunk, chunkIndex) => (
        <Page key={`units-page-${chunkIndex + 1}`} size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {chunkIndex === 0 ? 'Unidades' : 'Unidades (continuação)'}
            </Text>
            <View style={styles.cardsContainer}>
              {chunk.map((unit, index) => (
                <UnitCardPDF key={`${unit.nome}-${chunkIndex}-${index}`} unit={unit} />
              ))}
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default PDFPainelResultados; 