import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename é obrigatório' },
        { status: 400 }
      );
    }

    // Sanitizar o filename para prevenir path traversal
    const sanitizedFilename = path.basename(filename);
    
    // Procurar o arquivo em diferentes localizações
    const possiblePaths = [
      // PDFs de relatório diário
      path.join(process.cwd(), 'public', 'pdfs', 'daily-reports', sanitizedFilename),
      // PDFs gerais
      path.join(process.cwd(), 'public', 'pdfs', sanitizedFilename),
      // Diretório raiz dos PDFs
      path.join(process.cwd(), 'public', sanitizedFilename)
    ];

    let filePath: string | null = null;
    
    // Verificar qual caminho existe
    for (const possiblePath of possiblePaths) {
      if (await fs.pathExists(possiblePath)) {
        filePath = possiblePath;
        break;
      }
    }

    if (!filePath) {
      console.log(`PDF não encontrado: ${sanitizedFilename}`);
      console.log('Caminhos verificados:', possiblePaths);
      
      return NextResponse.json(
        { error: 'PDF não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se é um arquivo PDF
    if (!sanitizedFilename.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Apenas arquivos PDF são permitidos' },
        { status: 400 }
      );
    }

    // Ler o arquivo
    const fileBuffer = await fs.readFile(filePath);

    // Retornar o PDF
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${sanitizedFilename}"`,
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Erro ao servir PDF:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao servir PDF',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 