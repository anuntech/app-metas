#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE TESTE DE ENTREGA VIA WHATSAPP
 * 
 * Este script testa e diagnostica problemas de entrega do WhatsApp:
 * 1. Envia uma mensagem de teste para seu número
 * 2. Verifica o status da mensagem usando a statusUrl
 * 3. Monitora a entrega por alguns minutos
 * 4. Mostra logs detalhados para diagnóstico
 * 
 * Usage: node scripts/test-whatsapp-delivery.js
 */

require('dotenv').config();

async function checkConfiguration() {
  console.log('🔍 VERIFICANDO CONFIGURAÇÃO...\n');

  const requiredVars = {
    'EXTERNAL_API_URL': process.env.EXTERNAL_API_URL,
    'EXTERNAL_API_AUTH_TOKEN': process.env.EXTERNAL_API_AUTH_TOKEN,
    'WTS_FROM_PHONE': process.env.WTS_FROM_PHONE,
    'WTS_TO_PHONE': process.env.WTS_TO_PHONE
  };

  let allConfigured = true;

  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      const displayValue = key.includes('TOKEN') ? 
        `${value.substring(0, 15)}...` : 
        value;
      console.log(`✅ ${key}: ${displayValue}`);
    } else {
      console.log(`❌ ${key}: NÃO CONFIGURADA`);
      allConfigured = false;
    }
  }

  if (!allConfigured) {
    console.log('\n❌ CONFIGURAÇÃO INCOMPLETA!');
    process.exit(1);
  }

  // Parse phone numbers (pegue apenas o primeiro para teste)
  const phoneList = process.env.WTS_TO_PHONE.split(',').map(phone => phone.trim());
  const testPhone = phoneList[0];

  console.log(`\n📱 Número de teste: ${testPhone}`);
  console.log('✅ Configuração OK!\n');

  return { testPhone };
}

async function checkMessageStatus(statusUrl, authToken, maxRetries = 10) {
  console.log(`🔍 Verificando status da mensagem...`);
  console.log(`📍 StatusUrl: ${statusUrl}`);
  
  // Corrigir URL se for apenas um path relativo
  const fullStatusUrl = statusUrl.startsWith('http') 
    ? statusUrl 
    : `https://api.wts.chat${statusUrl}`;
  
  console.log(`🔗 URL completa: ${fullStatusUrl}`);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(fullStatusUrl, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Erro ao verificar status (tentativa ${i + 1}): ${response.status} - ${errorText}`);
        
        if (i < maxRetries - 1) {
          console.log('⏳ Aguardando 10 segundos antes de tentar novamente...\n');
          await new Promise(resolve => setTimeout(resolve, 10000));
          continue;
        } else {
          return { success: false, error: `Erro ${response.status}: ${errorText}` };
        }
      }

      const statusData = await response.json();
      console.log(`📊 Status da mensagem (tentativa ${i + 1}):`, JSON.stringify(statusData, null, 2));

      // Verificar se a mensagem foi entregue
      if (statusData.status === 'DELIVERED' || statusData.status === 'READ') {
        console.log('✅ MENSAGEM ENTREGUE COM SUCESSO!');
        return { success: true, status: statusData.status, data: statusData };
      } else if (statusData.status === 'FAILED' || statusData.status === 'ERROR') {
        console.log('❌ MENSAGEM FALHOU NA ENTREGA!');
        return { success: false, status: statusData.status, data: statusData };
      } else if (statusData.status === 'PROCESSING' || statusData.status === 'SENT') {
        console.log(`⏳ Mensagem ainda sendo processada... Status: ${statusData.status}`);
        
        if (i < maxRetries - 1) {
          console.log('⏳ Aguardando 15 segundos antes de verificar novamente...\n');
          await new Promise(resolve => setTimeout(resolve, 15000));
        }
      }

    } catch (error) {
      console.log(`❌ Erro na verificação (tentativa ${i + 1}):`, error.message);
      
      if (i < maxRetries - 1) {
        console.log('⏳ Aguardando 10 segundos antes de tentar novamente...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  return { success: false, error: 'Timeout: Mensagem não foi entregue após múltiplas tentativas' };
}

async function sendTestMessage(testPhone) {
  console.log('📱 ENVIANDO MENSAGEM DE TESTE...\n');

  const wtsConfig = {
    url: process.env.EXTERNAL_API_URL,
    authToken: process.env.EXTERNAL_API_AUTH_TOKEN,
    fromPhone: process.env.WTS_FROM_PHONE,
    messageText: '🧪 TESTE DE ENTREGA - Se você recebeu esta mensagem, o sistema está funcionando! ✅'
  };

  console.log(`📤 Enviando mensagem de teste para: ${testPhone}`);
  console.log(`📝 Texto: ${wtsConfig.messageText}`);

  try {
    const payload = {
      body: {
        text: wtsConfig.messageText
      },
      from: wtsConfig.fromPhone,
      to: testPhone
    };

    console.log('\n📋 Payload enviado:');
    console.log(JSON.stringify(payload, null, 2));

    const response = await fetch(wtsConfig.url, {
      method: 'POST',
      headers: {
        'Authorization': wtsConfig.authToken,
        'accept': 'application/json',
        'content-type': 'application/*+json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`\n📊 Resposta da API WTS:`);
    console.log(`Status HTTP: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Erro da API WTS: ${errorText}`);
      throw new Error(`WTS API Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Resposta completa:', JSON.stringify(result, null, 2));

    if (!result.statusUrl) {
      console.log('\n⚠️  ATENÇÃO: API não retornou statusUrl! Isso pode indicar um problema na configuração.');
      return {
        success: false,
        error: 'statusUrl não fornecida pela API'
      };
    }

    console.log('\n✅ Mensagem enviada para a API WTS com sucesso!');
    console.log(`📍 Status inicial: ${result.status}`);
    console.log(`🔗 StatusUrl: ${result.statusUrl}`);

    return {
      success: true,
      messageId: result.id,
      statusUrl: result.statusUrl,
      initialStatus: result.status,
      response: result
    };

  } catch (error) {
    console.log(`❌ Erro ao enviar mensagem: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

async function testPDFDelivery(testPhone) {
  console.log('\n📄 TESTANDO ENVIO DE PDF...\n');

  // Primeiro, vamos gerar um PDF de teste
  try {
    const pdfResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/pdf/daily-report`);
    
    if (!pdfResponse.ok) {
      console.log('❌ Erro ao gerar PDF de teste');
      return { success: false, error: 'Falha ao gerar PDF' };
    }

    const pdfResult = await pdfResponse.json();
    
    if (!pdfResult.success) {
      console.log('❌ Falha na geração do PDF');
      return { success: false, error: pdfResult.error };
    }

    const domain = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const fullPdfUrl = `${domain}${pdfResult.data.publicUrl}`;

    console.log(`✅ PDF gerado: ${pdfResult.data.filename}`);
    console.log(`🔗 URL do PDF: ${fullPdfUrl}`);

    // Agora enviar o PDF via WhatsApp
    const wtsConfig = {
      url: process.env.EXTERNAL_API_URL,
      authToken: process.env.EXTERNAL_API_AUTH_TOKEN,
      fromPhone: process.env.WTS_FROM_PHONE,
      messageText: '🧪 TESTE DE PDF - Relatório diário de teste'
    };

    const payload = {
      body: {
        text: wtsConfig.messageText,
        fileUrl: fullPdfUrl
      },
      from: wtsConfig.fromPhone,
      to: testPhone
    };

    console.log('\n📋 Payload do PDF enviado:');
    console.log(JSON.stringify(payload, null, 2));

    const response = await fetch(wtsConfig.url, {
      method: 'POST',
      headers: {
        'Authorization': wtsConfig.authToken,
        'accept': 'application/json',
        'content-type': 'application/*+json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WTS API Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('\n✅ PDF enviado para a API WTS!');
    console.log('Resposta:', JSON.stringify(result, null, 2));

    return {
      success: true,
      messageId: result.id,
      statusUrl: result.statusUrl,
      initialStatus: result.status,
      pdfUrl: fullPdfUrl,
      response: result
    };

  } catch (error) {
    console.log(`❌ Erro no teste de PDF: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  try {
    console.log('🧪 TESTE DE DIAGNÓSTICO DE ENTREGA WHATSAPP');
    console.log('=' .repeat(50));
    console.log(`🕐 Iniciado em: ${new Date().toLocaleString('pt-BR')}\n`);

    // 1. Verificar configuração
    const { testPhone } = await checkConfiguration();

    // 2. Enviar mensagem de teste
    const textResult = await sendTestMessage(testPhone);
    
    if (textResult.success && textResult.statusUrl) {
      console.log('\n🔍 MONITORANDO ENTREGA DA MENSAGEM DE TEXTO...');
      const textStatus = await checkMessageStatus(
        textResult.statusUrl, 
        process.env.EXTERNAL_API_AUTH_TOKEN,
        8 // 8 tentativas = ~2 minutos de monitoramento
      );
      
      console.log('\n📋 RESULTADO DO TESTE DE TEXTO:');
      if (textStatus.success) {
        console.log(`✅ Mensagem de texto entregue! Status final: ${textStatus.status}`);
      } else {
        console.log(`❌ Mensagem de texto não foi entregue: ${textStatus.error}`);
      }
    }

    // 3. Testar envio de PDF
    console.log('\n' + '='.repeat(50));
    const pdfResult = await testPDFDelivery(testPhone);
    
    if (pdfResult.success && pdfResult.statusUrl) {
      console.log('\n🔍 MONITORANDO ENTREGA DO PDF...');
      const pdfStatus = await checkMessageStatus(
        pdfResult.statusUrl,
        process.env.EXTERNAL_API_AUTH_TOKEN,
        10 // 10 tentativas = ~2.5 minutos de monitoramento
      );
      
      console.log('\n📋 RESULTADO DO TESTE DE PDF:');
      if (pdfStatus.success) {
        console.log(`✅ PDF entregue! Status final: ${pdfStatus.status}`);
      } else {
        console.log(`❌ PDF não foi entregue: ${pdfStatus.error}`);
      }
    }

    // 4. Resumo final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DO DIAGNÓSTICO:');
    console.log('=' .repeat(50));
    
    console.log(`📱 Número testado: ${testPhone}`);
    console.log(`✉️  Mensagem de texto: ${textResult.success ? 'Enviada' : 'Falhou'}`);
    console.log(`📄 PDF: ${pdfResult.success ? 'Enviado' : 'Falhou'}`);
    
    if (!textResult.success || !pdfResult.success) {
      console.log('\n🔧 POSSÍVEIS PROBLEMAS:');
      console.log('1. Token de autenticação inválido ou expirado');
      console.log('2. Número de telefone de origem não configurado corretamente');
      console.log('3. Número de destino inválido ou bloqueado');
      console.log('4. Problemas na API do WTS');
      console.log('5. URL do PDF inacessível (apenas para PDFs)');
    } else {
      console.log('\n✅ API está funcionando! Verifique se as mensagens chegaram no WhatsApp.');
      console.log('💡 Se não chegaram, pode ser um problema de entrega do lado da WTS.');
    }

    console.log(`\n🕐 Finalizado em: ${new Date().toLocaleString('pt-BR')}`);

  } catch (error) {
    console.log('\n❌ ERRO FATAL:', error.message);
    console.log('\n🔧 VERIFICAÇÕES:');
    console.log('1. Todas as variáveis de ambiente estão configuradas?');
    console.log('2. A aplicação está rodando?');
    console.log('3. O token da API WTS está válido?');
    
    process.exit(1);
  }
}

// Verificar se todas as variáveis estão definidas antes de iniciar
if (!process.env.EXTERNAL_API_URL || !process.env.WTS_FROM_PHONE || !process.env.WTS_TO_PHONE) {
  console.log('❌ CONFIGURAÇÃO INCOMPLETA!');
  console.log('\nAntes de executar, configure no .env:');
  console.log('EXTERNAL_API_URL=https://api.wts.chat/chat/v1/message/send');
  console.log('EXTERNAL_API_AUTH_TOKEN=seu_token');
  console.log('WTS_FROM_PHONE=(11) 97199-7520');
  console.log('WTS_TO_PHONE=(11) 97997-9161');
  process.exit(1);
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { main, sendTestMessage, checkMessageStatus }; 