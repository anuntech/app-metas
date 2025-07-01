import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import PDFPainelResultados from '@/components/pdf-painel-resultados';
import React from 'react';
import fs from 'fs-extra';
import path from 'path';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types from the PDF component
type MetaLevel = {
  nivel: string;
  valor: number;
  progress: number;
};

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

async function fetchDashboardData(startDate: string, endDate: string): Promise<ApiProgressResponse> {
  try {
    // Get the absolute URL for the API call
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const queryParams = new URLSearchParams({ 
      startDate, 
      endDate
    });
    
    console.log(`Fetching progress data for daily PDF:`, {
      startDate,
      endDate,
      queryString: queryParams.toString()
    });
    
    const progressResponse = await fetch(`${baseUrl}/api/dashboard/progress?${queryParams}`);
    
    if (!progressResponse.ok) {
      const errorData = await progressResponse.json();
      throw new Error(errorData.message || 'Erro ao carregar dados do progresso');
    }
    
    const progressData = await progressResponse.json();
    return progressData;
    
  } catch (error) {
    console.error('Error fetching dashboard data for daily PDF:', error);
    throw error;
  }
}

function transformSummaryData(progressSummary: ApiProgressResponse["summary"]) {
  if (!progressSummary) {
    throw new Error('Dados de resumo não encontrados');
  }

  const defaultMetrics = {
    atual: 0,
    overallProgress: 0,
    metaLevels: []
  };
  
  const faturamento = progressSummary.faturamento || defaultMetrics;
  const faturamentoPorFuncionario = progressSummary.faturamentoPorFuncionario || defaultMetrics;
  const despesa = progressSummary.despesa || {...defaultMetrics, valorReais: 0};
  const inadimplencia = progressSummary.inadimplencia || {...defaultMetrics, valorReais: 0};
  const quantidadeContratos = progressSummary.quantidadeContratos || defaultMetrics;

  const getMetaValue = (metric: { atual: number, metaLevels?: MetaLevel[] }) => {
    if (metric.metaLevels && metric.metaLevels.length > 0) {
      return metric.metaLevels[0].valor;
    }
    return metric.atual * 1.1;
  };

  // Calculate ticket médio
  const ticketMedioAtual = progressSummary.faturamento?.atual && progressSummary.quantidadeContratos?.atual
    ? progressSummary.faturamento.atual / progressSummary.quantidadeContratos.atual
    : 0;

  const ticketMedioMeta = progressSummary.faturamento?.metaLevels?.[0]?.valor && progressSummary.quantidadeContratos?.metaLevels?.[0]?.valor
    ? progressSummary.faturamento.metaLevels[0].valor / progressSummary.quantidadeContratos.metaLevels[0].valor
    : 0;

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
}

function transformUnitsData(units: ApiProgressResponse["units"]) {
  if (!units || units.length === 0) return [];
  
  const getMetaValue = (metric: { atual: number, metaLevels?: MetaLevel[] }) => {
    if (metric.metaLevels && metric.metaLevels.length > 0) {
      return metric.metaLevels[0].valor;
    }
    return metric.atual * 1.1;
  };
  
  return units.map(unit => {
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
}

async function generateAndSavePDF(startDate: Date, endDate: Date) {
  try {
    console.log('Gerando PDF diário do painel de resultados...');

    // 1. Fetch the data
    const progressData = await fetchDashboardData(startDate.toISOString(), endDate.toISOString());
    
    // 2. Transform the data
    const summaryData = transformSummaryData(progressData.summary);
    const unitsData = transformUnitsData(progressData.units);
    
    const pdfData = {
      summaryData,
      unitsData,
      dateRange: {
        startDate,
        endDate
      }
    };

    // 3. Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(PDFPainelResultados, { data: pdfData }) as any
    );

    // 4. Generate filename with current date
    const currentDate = format(new Date(), 'yyyy-MM-dd', { locale: ptBR });
    const monthYear = format(startDate, 'yyyy-MM', { locale: ptBR });
    const filename = `painel-resultados-${monthYear}-ate-${currentDate}.pdf`;

    // 5. Ensure directory exists
    const publicDir = path.join(process.cwd(), 'public', 'pdfs', 'daily-reports');
    await fs.ensureDir(publicDir);

    // 6. Save PDF to file
    const filePath = path.join(publicDir, filename);
    await fs.writeFile(filePath, pdfBuffer);

    console.log(`PDF diário salvo em: ${filePath}`);

    // 7. Return public URL
    const publicUrl = `/pdfs/daily-reports/${filename}`;
    
    return {
      success: true,
      filename,
      publicUrl,
      filePath
    };

  } catch (error) {
    console.error('Erro ao gerar PDF diário:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current date
    const now = new Date();
    
    // Calculate start date (first day of current month)
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // End date is today
    const endDate = now;

    console.log(`Gerando PDF diário para período: ${startDate.toISOString()} até ${endDate.toISOString()}`);

    const result = await generateAndSavePDF(startDate, endDate);

    return NextResponse.json({
      success: true,
      message: 'PDF diário gerado com sucesso',
      data: result
    });

  } catch (error) {
    console.error('Erro ao gerar PDF diário:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor ao gerar PDF diário',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate: startDateStr, endDate: endDateStr } = body;

    // Use provided dates or default to current month
    const startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    console.log(`Gerando PDF customizado para período: ${startDate.toISOString()} até ${endDate.toISOString()}`);

    const result = await generateAndSavePDF(startDate, endDate);

    return NextResponse.json({
      success: true,
      message: 'PDF customizado gerado com sucesso',
      data: result
    });

  } catch (error) {
    console.error('Erro ao gerar PDF customizado:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor ao gerar PDF customizado',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 