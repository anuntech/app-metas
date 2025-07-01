// Exemplo de como usar a API de geração de PDF do painel de resultados

// 1. Usando GET para gerar PDF inline (visualizar no navegador)
export async function generatePDFInline(startDate: Date, endDate: Date): Promise<string> {
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  // Retorna URL que pode ser usada em iframe ou window.open
  return `/api/pdf/painel-resultados?${params.toString()}`;
}

// 2. Usando POST para download do PDF
export async function downloadPDF(startDate: Date, endDate: Date, filename?: string): Promise<void> {
  try {
    const response = await fetch('/api/pdf/painel-resultados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        filename: filename || 'painel-resultados.pdf',
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar PDF');
    }

    // Baixar o arquivo
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename || 'painel-resultados.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
    throw error;
  }
}

// 3. Usando GET para obter buffer do PDF (para uso em servidor)
export async function getPDFBuffer(startDate: Date, endDate: Date): Promise<ArrayBuffer> {
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const response = await fetch(`/api/pdf/painel-resultados?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Erro ao gerar PDF');
  }

  return response.arrayBuffer();
}

// Exemplo de uso em componente React:
/*
import { useState } from 'react';
import { downloadPDF, generatePDFInline } from './examples/pdf-generation-example';

export function PainelResultadosExample() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
  });

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await downloadPDF(dateRange.startDate, dateRange.endDate, 'painel-resultados.pdf');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      // Mostrar toast de erro
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPDFInNewTab = () => {
    const pdfUrl = generatePDFInline(dateRange.startDate, dateRange.endDate);
    window.open(pdfUrl, '_blank');
  };

  return (
    <div>
      <button onClick={handleDownloadPDF} disabled={isGenerating}>
        {isGenerating ? 'Gerando PDF...' : 'Baixar PDF'}
      </button>
      
      <button onClick={handleOpenPDFInNewTab}>
        Abrir PDF em nova aba
      </button>
    </div>
  );
}
*/

// Exemplo para uso em Node.js/Server:
/*
import fs from 'fs/promises';
import { getPDFBuffer } from './examples/pdf-generation-example';

async function saveServerPDF() {
  try {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    
    const pdfBuffer = await getPDFBuffer(startDate, endDate);
    
    // Salvar em arquivo
    await fs.writeFile('./reports/painel-2024.pdf', Buffer.from(pdfBuffer));
    
    console.log('PDF salvo com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar PDF:', error);
  }
}
*/ 