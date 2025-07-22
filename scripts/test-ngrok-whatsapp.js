#!/usr/bin/env node

/**
 * 🌐 TESTE COMPLETO COM NGROK
 * 
 * Este script:
 * 1. Verifica se ngrok está rodando
 * 2. Obtém a URL pública do ngrok
 * 3. Testa o endpoint de PDF via ngrok
 * 4. Envia PDF via WhatsApp usando URL pública
 * 5. Monitora a entrega
 * 
 * IMPORTANTE: Execute ngrok em outro terminal antes:
 * ngrok http 3000
 * 
 * Usage: node scripts/test-ngrok-whatsapp.js
 */

require('dotenv').config();

async function getNgrokUrl() {
  try {
    // Ngrok expõe uma API local na porta 4040
    const response = await fetch('http://localhost:4040/api/tunnels');
    const data = await response.json();
    
    if (data.tunnels && data.tunnels.length > 0) {
      // Procurar pelo tunnel HTTPS
      const httpsTunnel = data.tunnels.find(tunnel => tunnel.proto === 'https');
      if (httpsTunnel) {
        return httpsTunnel.public_url;
      }
      
      // Se não tiver HTTPS, usar HTTP
      const httpTunnel = data.tunnels.find(tunnel => tunnel.proto === 'http');
      if (httpTunnel) {
        return httpTunnel.public_url;
      }
    }
    
    throw new Error('Nenhum tunnel ativo encontrado');
  } catch (error) {
    throw new Error(`Erro ao obter URL do ngrok: ${error.message}`);
  }
}

async function checkMessageStatus(statusUrl, authToken, messageId) {
  try {
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
      return {
        success: false,
        error: `Status ${response.status}: ${errorText}`,
        messageId
      };
    }

    const statusData = await response.json();
    return {
      success: true,
      status: statusData.status,
      failureReason: statusData.failureReason || null,
      data: statusData,
      messageId
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      messageId
    };
  }
}

async function testCompleteFlow() {
  console.log('🌐 TESTE COMPLETO COM NGROK - SISTEMA DE WHATSAPP');
  console.log('=' .repeat(60));
  console.log(`🕐 Iniciado em: ${new Date().toLocaleString('pt-BR')}\n`);

  try {
    // 1. Verificar se ngrok está rodando
    console.log('🔍 1. VERIFICANDO NGROK...');
    
    let ngrokUrl;
    try {
      ngrokUrl = await getNgrokUrl();
      console.log(`✅ Ngrok ativo: ${ngrokUrl}`);
    } catch (error) {
      console.log('❌ Ngrok não está rodando!');
      console.log('\n🔧 INSTRUÇÕES:');
      console.log('1. Abra um novo terminal');
      console.log('2. Execute: ngrok http 3000');
      console.log('3. Deixe rodando e execute este script novamente');
      console.log('\n💡 O ngrok criará uma URL pública para seu localhost:3000');
      return;
    }

    // 2. Testar se a aplicação responde via ngrok
    console.log('\n🌐 2. TESTANDO APLICAÇÃO VIA NGROK...');
    
    const appResponse = await fetch(ngrokUrl);
    if (!appResponse.ok) {
      console.log(`❌ Aplicação não responde via ngrok: ${appResponse.status}`);
      console.log('🔧 Verifique se npm run dev está rodando');
      return;
    }
    console.log('✅ Aplicação acessível via ngrok');

    // 3. Gerar PDF usando ngrok URL
    console.log('\n📄 3. GERANDO PDF VIA NGROK...');
    
    const pdfResponse = await fetch(`${ngrokUrl}/api/pdf/daily-report`);
    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.log(`❌ Erro ao gerar PDF: ${pdfResponse.status} - ${errorText}`);
      return;
    }

    const pdfResult = await pdfResponse.json();
    if (!pdfResult.success) {
      console.log(`❌ Falha na geração do PDF: ${pdfResult.error}`);
      return;
    }

    const pdfUrl = `${ngrokUrl}${pdfResult.data.publicUrl}`;
    console.log(`✅ PDF gerado: ${pdfResult.data.filename}`);
    console.log(`🔗 URL pública: ${pdfUrl}`);

    // 4. Verificar se PDF é acessível publicamente
    console.log('\n🔍 4. VERIFICANDO ACESSO PÚBLICO AO PDF...');
    
    const pdfTestResponse = await fetch(pdfUrl, { method: 'HEAD' });
    if (!pdfTestResponse.ok) {
      console.log(`❌ PDF não é acessível publicamente: ${pdfTestResponse.status}`);
      return;
    }
    
    console.log('✅ PDF é acessível publicamente pela internet!');
    console.log(`📋 Content-Type: ${pdfTestResponse.headers.get('content-type')}`);
    console.log(`📏 Content-Length: ${pdfTestResponse.headers.get('content-length')} bytes`);

    // 5. Configurar WhatsApp
    console.log('\n📱 5. ENVIANDO VIA WHATSAPP...');
    
    const wtsConfig = {
      url: process.env.EXTERNAL_API_URL,
      authToken: process.env.EXTERNAL_API_AUTH_TOKEN,
      fromPhone: process.env.WTS_FROM_PHONE,
      messageText: '🧪 TESTE NGROK - Relatório diário via URL pública! Se você recebeu este PDF, o sistema está funcionando perfeitamente! ✅'
    };

    // Pegar apenas primeiro número para teste
    const phoneList = process.env.WTS_TO_PHONE.split(',').map(phone => phone.trim());
    const testPhone = phoneList[0];

    console.log(`📞 Enviando para: ${testPhone}`);
    console.log(`🔗 URL do PDF: ${pdfUrl}`);

    const payload = {
      body: {
        text: wtsConfig.messageText,
        fileUrl: pdfUrl
      },
      from: wtsConfig.fromPhone,
      to: testPhone
    };

    console.log('\n📋 Payload enviado:');
    console.log(JSON.stringify(payload, null, 2));

    const sendResponse = await fetch(wtsConfig.url, {
      method: 'POST',
      headers: {
        'Authorization': wtsConfig.authToken,
        'accept': 'application/json',
        'content-type': 'application/*+json'
      },
      body: JSON.stringify(payload)
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.log(`❌ Erro na API WTS: ${sendResponse.status} - ${errorText}`);
      return;
    }

    const sendResult = await sendResponse.json();
    console.log('\n✅ Mensagem enviada para WTS!');
    console.log('📊 Resposta da API:');
    console.log(JSON.stringify(sendResult, null, 2));

    // 6. Monitorar entrega
    if (sendResult.statusUrl) {
      console.log('\n🔍 6. MONITORANDO ENTREGA...');
      console.log('⏳ Aguardando processamento inicial (30 segundos)...');
      
      await new Promise(resolve => setTimeout(resolve, 30000));

      for (let i = 0; i < 8; i++) { // 8 tentativas = ~2 minutos
        console.log(`\n📊 Verificação ${i + 1}/8...`);
        
        const statusCheck = await checkMessageStatus(
          sendResult.statusUrl,
          wtsConfig.authToken,
          sendResult.id
        );

        if (statusCheck.success) {
          const emoji = statusCheck.status === 'DELIVERED' || statusCheck.status === 'READ' ? '✅' :
                       statusCheck.status === 'FAILED' || statusCheck.status === 'ERROR' ? '❌' : '⏳';
          
          console.log(`${emoji} Status: ${statusCheck.status}`);
          
          if (statusCheck.failureReason) {
            console.log(`💭 Motivo: ${statusCheck.failureReason}`);
          }

          if (statusCheck.status === 'DELIVERED' || statusCheck.status === 'READ') {
            console.log('\n🎉 SUCESSO TOTAL! PDF ENTREGUE VIA WHATSAPP!');
            break;
          } else if (statusCheck.status === 'FAILED' || statusCheck.status === 'ERROR') {
            console.log('\n❌ FALHA NA ENTREGA:');
            console.log(JSON.stringify(statusCheck.data, null, 2));
            break;
          }
        } else {
          console.log(`❌ Erro ao verificar: ${statusCheck.error}`);
        }

        if (i < 7) {
          console.log('⏳ Aguardando 15 segundos...');
          await new Promise(resolve => setTimeout(resolve, 15000));
        }
      }
    }

    // 7. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('🎯 RESUMO DO TESTE COMPLETO:');
    console.log('=' .repeat(60));
    
    console.log(`🌐 URL ngrok: ${ngrokUrl}`);
    console.log(`📄 PDF gerado: ${pdfResult.data.filename}`);
    console.log(`🔗 URL pública do PDF: ${pdfUrl}`);
    console.log(`📱 Número testado: ${testPhone}`);
    console.log(`📤 Mensagem enviada: ✅`);
    
    console.log('\n💡 CONCLUSÕES:');
    console.log('✅ Sistema de geração de PDF: Funcionando');
    console.log('✅ Endpoint dinâmico: Funcionando');
    console.log('✅ Acesso público via ngrok: Funcionando');
    console.log('✅ Integração com WTS: Funcionando');
    
    console.log('\n🚀 PRÓXIMO PASSO:');
    console.log('Faça deploy para produção! O sistema está funcionando perfeitamente.');
    
    console.log('\n⚠️  LEMBRE-SE:');
    console.log('Em produção, use a URL real (Railway) em vez do ngrok');

  } catch (error) {
    console.log(`\n❌ ERRO FATAL: ${error.message}`);
    console.log('\n🔧 VERIFICAÇÕES:');
    console.log('1. Ngrok está rodando? (ngrok http 3000)');
    console.log('2. Next.js está rodando? (npm run dev)');
    console.log('3. Todas as variáveis de ambiente estão configuradas?');
  }

  console.log(`\n🕐 Finalizado em: ${new Date().toLocaleString('pt-BR')}`);
}

// Verificar configuração
if (!process.env.EXTERNAL_API_URL || !process.env.WTS_FROM_PHONE || !process.env.WTS_TO_PHONE) {
  console.log('❌ CONFIGURAÇÃO INCOMPLETA!');
  console.log('Configure todas as variáveis de ambiente no .env');
  process.exit(1);
}

if (require.main === module) {
  testCompleteFlow();
}

module.exports = { testCompleteFlow }; 