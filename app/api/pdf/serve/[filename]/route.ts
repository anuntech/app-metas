import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import PDFPainelResultados from '@/components/pdf-painel-resultados';
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importar funções de transformação do daily-report
import { transformSummaryData, transformUnitsData, fetchDashboardData } from '../../daily-report/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    console.log(`Servindo PDF: ${filename}`);

    // Extrair datas do filename ou usar padrão
    // Formato esperado: painel-resultados-YYYY-MM-ate-YYYY-MM-DD.pdf
    let startDate, endDate;
    
    if (filename.includes('painel-resultados-')) {
      try {
        // Tentar extrair datas do filename
        const dateMatch = filename.match(/painel-resultados-(\d{4}-\d{2})-ate-(\d{4}-\d{2}-\d{2})\.pdf/);
        if (dateMatch) {
          const [, monthYear, fullEndDate] = dateMatch;
          startDate = new Date(`${monthYear}-01`);
          endDate = new Date(fullEndDate);
        }
      } catch (error) {
        console.log('Erro ao extrair datas do filename, usando padrão');
      }
    }

    // Se não conseguir extrair datas, usar mês atual
    if (!startDate || !endDate) {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
    }

    console.log(`Gerando PDF para período: ${startDate.toISOString()} até ${endDate.toISOString()}`);

    // 1. Buscar dados
    const progressData = await fetchDashboardData(startDate.toISOString(), endDate.toISOString());
    
    // 2. Transformar dados
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

    // 3. Gerar PDF buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(PDFPainelResultados, { data: pdfData }) as any
    );

    // 4. Retornar PDF como resposta
    const actualFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${actualFilename}"`,
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
        'Access-Control-Allow-Origin': '*', // Permitir acesso externo
      },
    });

  } catch (error) {
    console.error('Erro ao servir PDF:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao servir PDF' },
      { status: 500 }
    );
  }
} 