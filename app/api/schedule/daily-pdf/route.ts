import { NextRequest, NextResponse } from 'next/server';
import { testDailyPDFTask, executeDailyPDFTask } from '@/lib/daily-pdf-scheduler';

// GET - Test the daily PDF task manually
export async function GET(request: NextRequest) {
  try {
    console.log('Executando teste manual da tarefa diária de PDF...');
    
    const result = await testDailyPDFTask();
    
    return NextResponse.json({
      success: true,
      message: 'Teste da tarefa diária executado com sucesso',
      data: result
    });

  } catch (error) {
    console.error('Erro no teste manual:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao executar teste da tarefa diária',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// POST - Execute the daily PDF task immediately
export async function POST(request: NextRequest) {
  try {
    console.log('Executando tarefa diária de PDF imediatamente...');
    
    const result = await executeDailyPDFTask();
    
    return NextResponse.json({
      success: true,
      message: 'Tarefa diária executada com sucesso',
      data: result
    });

  } catch (error) {
    console.error('Erro na execução imediata:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao executar tarefa diária',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 