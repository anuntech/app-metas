import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFExportOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export const usePDFExport = () => {
  const exportToPDF = useCallback(async (
    elementId: string, 
    options: PDFExportOptions = {}
  ) => {
    const {
      filename = 'painel-resultados.pdf',
      quality = 0.95,
      format = 'a4',
      orientation = 'portrait',
      margins = { top: 5, right: 5, bottom: 5, left: 5 }
    } = options;

    try {
      // Encontrar o elemento a ser exportado
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Elemento com ID "${elementId}" não encontrado`);
      }

      // Preparar elemento para captura
      const originalStyle = element.style.cssText;
      element.style.background = '#ffffff';
      element.style.padding = '20px';

      // Configurar html2canvas para melhor qualidade
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      // Restaurar estilo original
      element.style.cssText = originalStyle;

      // Calcular dimensões do PDF
      const pdfWidth = format === 'a4' ? 210 : 216; // mm
      const pdfHeight = format === 'a4' ? 297 : 279; // mm
      
      const availableWidth = pdfWidth - margins.left - margins.right;
      const availableHeight = pdfHeight - margins.top - margins.bottom;
      
      // Calcular dimensões da imagem para ocupar a largura disponível
      const canvasAspectRatio = canvas.height / canvas.width;
      let imgWidth = availableWidth;
      let imgHeight = availableWidth * canvasAspectRatio;
      
      // Se a altura calculada exceder a altura disponível, redimensionar pela altura
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = availableHeight / canvasAspectRatio;
      }
      
      // Calcular posição para centralizar
      const xPos = margins.left + (availableWidth - imgWidth) / 2;
      const yPos = margins.top + (availableHeight - imgHeight) / 2;

      // Criar PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      // Verificar se a imagem precisa ser dividida em múltiplas páginas
      if (imgHeight > availableHeight) {
        // Dividir em múltiplas páginas
        let remainingHeight = imgHeight;
        let sourceY = 0;
        let pageNumber = 0;

        while (remainingHeight > 0) {
          const currentPageHeight = Math.min(remainingHeight, availableHeight);
          const sourceHeight = (currentPageHeight / imgHeight) * canvas.height;

          // Criar canvas temporário para a página atual
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(
              canvas,
              0, sourceY, canvas.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            );

            const tempImgData = tempCanvas.toDataURL('image/jpeg', quality);

            if (pageNumber > 0) {
              pdf.addPage();
            }

            // Calcular posição X centralizada para cada página
            const pageXPos = margins.left + (availableWidth - imgWidth) / 2;

            pdf.addImage(
              tempImgData,
              'JPEG',
              pageXPos,
              margins.top,
              imgWidth,
              currentPageHeight
            );
          }

          sourceY += sourceHeight;
          remainingHeight -= currentPageHeight;
          pageNumber++;
        }
      } else {
        // Imagem cabe em uma página - usar posição centralizada
        const imgData = canvas.toDataURL('image/jpeg', quality);
        pdf.addImage(
          imgData,
          'JPEG',
          xPos,
          yPos,
          imgWidth,
          imgHeight
        );
      }

      // Adicionar metadados
      pdf.setProperties({
        title: 'Painel de Resultados',
        subject: 'Resultado dos Indicadores de Premiação',
        author: 'Sistema de Metas',
        creator: 'App Metas'
      });

      // Salvar o PDF
      pdf.save(filename);
      
      return { success: true, message: 'PDF exportado com sucesso!' };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido ao exportar PDF' 
      };
    }
  }, []);

  return { exportToPDF };
}; 