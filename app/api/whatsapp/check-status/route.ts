import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { statusUrl, authToken } = body;

    if (!statusUrl) {
      return NextResponse.json(
        { success: false, error: 'statusUrl é obrigatória' },
        { status: 400 }
      );
    }

    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'authToken é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`Verificando status da mensagem: ${statusUrl}`);

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': authToken,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          success: false, 
          error: `Erro na verificação do status: ${response.status} - ${errorText}`,
          statusCode: response.status
        },
        { status: 200 } // Retornamos 200 mas indicamos erro na resposta
      );
    }

    const statusData = await response.json();
    
    console.log('Status verificado:', statusData);

    return NextResponse.json({
      success: true,
      statusData,
      isDelivered: statusData.status === 'DELIVERED' || statusData.status === 'READ',
      isFailed: statusData.status === 'FAILED' || statusData.status === 'ERROR',
      isProcessing: statusData.status === 'PROCESSING' || statusData.status === 'SENT'
    });

  } catch (error) {
    console.error('Erro ao verificar status da mensagem:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor ao verificar status',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// GET para verificar múltiplos status de uma vez
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusUrlsParam = searchParams.get('statusUrls');
    const authToken = searchParams.get('authToken') || process.env.EXTERNAL_API_AUTH_TOKEN;

    if (!statusUrlsParam) {
      return NextResponse.json(
        { success: false, error: 'Parâmetro statusUrls é obrigatório' },
        { status: 400 }
      );
    }

    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'authToken não configurado' },
        { status: 400 }
      );
    }

    // Parse URLs (esperando formato: url1,url2,url3)
    const statusUrls = statusUrlsParam.split(',').map(url => url.trim()).filter(url => url.length > 0);

    if (statusUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma statusUrl válida fornecida' },
        { status: 400 }
      );
    }

    console.log(`Verificando status de ${statusUrls.length} mensagem(ns)`);

    const results = [];
    
    for (let i = 0; i < statusUrls.length; i++) {
      const statusUrl = statusUrls[i];
      
      try {
        const response = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'Authorization': authToken,
            'accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          results.push({
            statusUrl,
            success: false,
            error: `Erro ${response.status}: ${errorText}`,
            statusCode: response.status
          });
        } else {
          const statusData = await response.json();
          results.push({
            statusUrl,
            success: true,
            statusData,
            isDelivered: statusData.status === 'DELIVERED' || statusData.status === 'READ',
            isFailed: statusData.status === 'FAILED' || statusData.status === 'ERROR',
            isProcessing: statusData.status === 'PROCESSING' || statusData.status === 'SENT'
          });
        }

        // Pequeno delay entre requests para evitar rate limiting
        if (i < statusUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        results.push({
          statusUrl,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    // Calcular estatísticas
    const delivered = results.filter(r => r.success && r.isDelivered).length;
    const failed = results.filter(r => r.success && r.isFailed).length;
    const processing = results.filter(r => r.success && r.isProcessing).length;
    const errors = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      total: results.length,
      stats: {
        delivered,
        failed,
        processing,
        errors
      },
      results
    });

  } catch (error) {
    console.error('Erro ao verificar múltiplos status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 