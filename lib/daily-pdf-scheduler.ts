import cron from 'node-cron';

// Types for external API configuration
interface ExternalAPIConfig {
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  authToken?: string;
  apiKey?: string;
}

// Function to check message status
async function checkMessageStatus(statusUrl: string, authToken: string): Promise<any> {
  try {
    // Corrigir URL se for path relativo
    const fullStatusUrl = statusUrl.startsWith('http') 
      ? statusUrl 
      : `https://api.wts.chat${statusUrl}`;

    const response = await fetch(fullStatusUrl, {
      method: 'GET',
      headers: {
        'Authorization': authToken,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro ao verificar status: ${error}`);
    throw error;
  }
}

// Function to send PDF URL to multiple numbers via WTS Chat API
async function sendPDFToExternalAPI(pdfUrl: string, config: ExternalAPIConfig) {
  try {
    console.log(`Enviando URL do PDF para WTS Chat API: ${config.url}`);
    
    // Get phone numbers from environment
    const fromPhone = process.env.WTS_FROM_PHONE;
    const toPhones = process.env.WTS_TO_PHONE;
    const messageText = process.env.WTS_MESSAGE_TEXT || 'Relatório diário do painel de resultados';

    if (!fromPhone || !toPhones) {
      throw new Error('Números de telefone não configurados. Configure WTS_FROM_PHONE e WTS_TO_PHONE');
    }

    // Parse multiple phone numbers (comma-separated)
    const phoneList = toPhones.split(',').map(phone => phone.trim()).filter(phone => phone.length > 0);
    
    if (phoneList.length === 0) {
      throw new Error('Nenhum número de telefone válido encontrado em WTS_TO_PHONE');
    }

    console.log(`📱 Enviando para ${phoneList.length} número(s): ${phoneList.join(', ')}`);

    // Prepare headers for WTS Chat API
    const headers: Record<string, string> = {
      'accept': 'application/json',
      'content-type': 'application/*+json',
      ...config.headers
    };

    // Add authentication - WTS uses Authorization header directly (not Bearer)
    if (config.authToken) {
      headers['Authorization'] = config.authToken;
    }
    
    if (config.apiKey) {
      headers['Authorization'] = config.apiKey;
    }

      // Send to each phone number
  const results: Array<{
    phone: string;
    success: boolean;
    response: any;
  }> = [];
  const errors: Array<{
    phone: string;
    error: string;
  }> = [];

    for (let i = 0; i < phoneList.length; i++) {
      const toPhone = phoneList[i];
      
      try {
        console.log(`📤 Enviando para ${toPhone} (${i + 1}/${phoneList.length})...`);

        // Prepare payload for this specific number
        const payload = {
          body: {
            text: messageText,
            fileUrl: pdfUrl
          },
          from: fromPhone,
          to: toPhone
        };

        const response = await fetch(config.url, {
          method: config.method,
          headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro na WTS Chat API para ${toPhone}: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log(`✅ PDF enviado com sucesso para ${toPhone}:`, result);
        
        // Corrigir statusUrl se for path relativo
        if (result.statusUrl && !result.statusUrl.startsWith('http')) {
          result.statusUrl = `https://api.wts.chat${result.statusUrl}`;
        }
        
        results.push({
          phone: toPhone,
          success: true,
          response: result
        });

        // Add small delay between requests to avoid rate limiting
        if (i < phoneList.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Erro ao enviar para ${toPhone}:`, errorMessage);
        errors.push({
          phone: toPhone,
          error: errorMessage
        });
      }
    }

    // Summary
    console.log(`\n📊 RESUMO DO ENVIO:`);
    console.log(`✅ Sucessos: ${results.length}`);
    console.log(`❌ Erros: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Números com erro:`);
      errors.forEach(err => console.log(`  - ${err.phone}: ${err.error}`));
    }

    if (results.length > 0) {
      console.log(`\n✅ Números enviados com sucesso:`);
      results.forEach(res => console.log(`  - ${res.phone}`));
      
      // Verificar status das mensagens após 30 segundos
      console.log(`\n⏳ Aguardando 30 segundos antes de verificar status de entrega...`);
      setTimeout(async () => {
        console.log(`\n🔍 Verificando status de entrega das mensagens...`);
        
        for (const result of results) {
          if (result.response?.statusUrl && config.authToken) {
            try {
              const status = await checkMessageStatus(result.response.statusUrl, config.authToken);
              const deliveryStatus = status.status === 'DELIVERED' || status.status === 'READ' ? '✅ ENTREGUE' : 
                                   status.status === 'FAILED' || status.status === 'ERROR' ? '❌ FALHOU' : 
                                   `⏳ ${status.status}`;
              console.log(`📱 ${result.phone}: ${deliveryStatus}`);
            } catch (error) {
              console.log(`📱 ${result.phone}: ❓ Erro ao verificar status`);
            }
          }
        }
      }, 30000);
    }

    return {
      success: results.length > 0,
      totalSent: results.length,
      totalErrors: errors.length,
      results,
      errors
    };

  } catch (error) {
    console.error('Erro geral ao enviar PDF via WTS Chat:', error);
    throw error;
  }
}

// Function to execute daily PDF generation and send to external API
async function executeDailyPDFTask() {
  try {
    console.log('=== INICIANDO TAREFA DIÁRIA DE PDF ===');
    console.log('Horário:', new Date().toLocaleString('pt-BR'));

    // 1. Generate and save PDF
    console.log('1. Gerando PDF diário...');
    
    // Import the daily report route handler directly to avoid HTTP request issues
    const { GET } = await import('../app/api/pdf/daily-report/route');
    const { NextRequest } = await import('next/server');
    
    // Create a mock NextRequest object
    const mockRequest = new NextRequest('http://localhost:3000/api/pdf/daily-report');
    
    // Call the route handler directly
    const response = await GET(mockRequest);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao gerar PDF: ${errorData.message}`);
    }

    const pdfResult = await response.json();
    
    if (!pdfResult.success) {
      throw new Error(`Falha ao gerar PDF: ${pdfResult.error}`);
    }

    console.log('✅ PDF gerado com sucesso:', pdfResult.data.filename);

    // 2. Prepare full URL for external API using the dynamic serve endpoint
    const domain = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const fullPdfUrl = `${domain}/api/pdf/serve/${pdfResult.data.filename}`;
    
    console.log('2. URL do PDF (endpoint dinâmico):', fullPdfUrl);

    // 3. Send to external API (if configured)
    const externalAPIConfig = getExternalAPIConfig();
    
    if (externalAPIConfig) {
      console.log('3. Enviando para API externa...');
      await sendPDFToExternalAPI(fullPdfUrl, externalAPIConfig);
      console.log('✅ PDF enviado para API externa com sucesso');
    } else {
      console.log('⚠️ Configuração da API externa não encontrada - pulando envio');
    }

    console.log('=== TAREFA DIÁRIA CONCLUÍDA COM SUCESSO ===');
    
    return {
      success: true,
      pdfUrl: fullPdfUrl,
      filename: pdfResult.data.filename
    };

  } catch (error) {
    console.error('❌ ERRO NA TAREFA DIÁRIA DE PDF:', error);
    
    // You could implement error notifications here (email, Slack, etc.)
    // await sendErrorNotification(error);
    
    throw error;
  }
}

// Function to get external API configuration from environment variables
function getExternalAPIConfig(): ExternalAPIConfig | null {
  const url = process.env.EXTERNAL_API_URL;
  
  if (!url) {
    console.warn('EXTERNAL_API_URL não configurada - PDF não será enviado para API externa');
    return null;
  }

  return {
    url,
    method: (process.env.EXTERNAL_API_METHOD as 'POST' | 'PUT' | 'PATCH') || 'POST',
    authToken: process.env.EXTERNAL_API_AUTH_TOKEN,
    apiKey: process.env.EXTERNAL_API_KEY,
    headers: process.env.EXTERNAL_API_HEADERS ? JSON.parse(process.env.EXTERNAL_API_HEADERS) : {}
  };
}

// Schedule the daily task
export function startDailyPDFScheduler() {
  console.log('🕐 Agendador de PDF diário iniciado');
  console.log('📅 Executará todos os dias às 11:00 AM');

  // Schedule for 11:00 AM every day
  cron.schedule('0 11 * * *', async () => {
    console.log('⏰ Executando tarefa agendada de PDF diário...');
    
    try {
      await executeDailyPDFTask();
    } catch (error) {
      console.error('Erro na execução agendada:', error);
    }
  }, {
    timezone: "America/Sao_Paulo" // Adjust timezone as needed
  });

  console.log('✅ Agendador configurado e ativo');
}

// Function to test the task manually (for development)
export async function testDailyPDFTask() {
  console.log('🧪 Executando teste da tarefa diária...');
  
  try {
    const result = await executeDailyPDFTask();
    console.log('✅ Teste concluído com sucesso:', result);
    return result;
  } catch (error) {
    console.error('❌ Teste falhou:', error);
    throw error;
  }
}

// Export the main function for manual execution
export { executeDailyPDFTask }; 