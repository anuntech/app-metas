#!/usr/bin/env node

/**
 * 🧪 TESTE COM URL DE PRODUÇÃO
 * 
 * Este script testa o envio de PDF usando a URL de produção
 * para que a API do WTS consiga acessar o arquivo.
 * 
 * Usage: node scripts/test-with-production-url.js
 */

require('dotenv').config();

async function testWithProductionURL() {
  console.log('🧪 TESTE DE PDF COM URL DE PRODUÇÃO');
  console.log('=' .repeat(50));
  console.log(`🕐 Iniciado em: ${new Date().toLocaleString('pt-BR')}\n`);

  // Verificar se temos URL de produção
  const productionUrl = process.env.NEXTAUTH_URL;
  
  if (!productionUrl || productionUrl.includes('localhost')) {
    console.log('❌ NEXTAUTH_URL não está configurada para produção!');
    console.log('\n🔧 Para corrigir:');
    console.log('1. Configure NEXTAUTH_URL=https://sua-app.vercel.app (ou outro domínio)');
    console.log('2. Ou use ngrok para expor localhost publicamente');
    console.log('\n💡 Exemplo com ngrok:');
    console.log('   npx ngrok http 3000');
    console.log('   Depois configure NEXTAUTH_URL=https://abc123.ngrok.io');
    return;
  }

  console.log(`🌍 URL de produção: ${productionUrl}`);

  // Pegar apenas o primeiro número da lista
  const phoneList = process.env.WTS_TO_PHONE.split(',').map(phone => phone.trim());
  const testPhone = phoneList[0];

  try {
    // 1. Gerar PDF usando a API de produção
    console.log('\n📄 Gerando PDF via API...');
    const pdfResponse = await fetch(`${productionUrl}/api/pdf/daily-report`);
    
    if (!pdfResponse.ok) {
      console.log('❌ Erro ao gerar PDF');
      return;
    }

    const pdfResult = await pdfResponse.json();
    
    if (!pdfResult.success) {
      console.log('❌ Falha na geração do PDF');
      return;
    }

    const fullPdfUrl = `${productionUrl}/api/pdf/serve/${pdfResult.data.filename}`;
    console.log(`✅ PDF gerado: ${pdfResult.data.filename}`);
    console.log(`🔗 URL pública (endpoint dinâmico): ${fullPdfUrl}`);

    // 2. Verificar se a URL é acessível
    console.log('\n🔍 Verificando se o PDF é acessível...');
    const testResponse = await fetch(fullPdfUrl, { method: 'HEAD' });
    
    if (!testResponse.ok) {
      console.log(`❌ PDF não é acessível publicamente! Status: ${testResponse.status}`);
      return;
    }
    
    console.log('✅ PDF é acessível publicamente!');

    // 3. Enviar via WhatsApp
    console.log('\n📱 Enviando PDF via WhatsApp...');
    
    const wtsConfig = {
      url: process.env.EXTERNAL_API_URL,
      authToken: process.env.EXTERNAL_API_AUTH_TOKEN,
      fromPhone: process.env.WTS_FROM_PHONE,
      messageText: '🧪 TESTE DE PDF COM URL PÚBLICA - Relatório diário'
    };

    const payload = {
      body: {
        text: wtsConfig.messageText,
        fileUrl: fullPdfUrl
      },
      from: wtsConfig.fromPhone,
      to: testPhone
    };

    console.log('📋 Payload:');
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
      console.log(`❌ Erro na API WTS: ${errorText}`);
      return;
    }

    const result = await response.json();
    console.log('\n✅ PDF enviado para WTS!');
    console.log('Resposta:', JSON.stringify(result, null, 2));

    // 4. Monitorar status
    if (result.statusUrl) {
      const fullStatusUrl = result.statusUrl.startsWith('http') 
        ? result.statusUrl 
        : `https://api.wts.chat${result.statusUrl}`;

      console.log('\n🔍 Monitorando entrega...');
      
      for (let i = 0; i < 6; i++) { // 6 tentativas = ~1.5 minutos
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15 segundos
        
        try {
          const statusResponse = await fetch(fullStatusUrl, {
            method: 'GET',
            headers: {
              'Authorization': wtsConfig.authToken,
              'accept': 'application/json'
            }
          });

          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log(`📊 Tentativa ${i + 1}: ${statusData.status}`);
            
            if (statusData.status === 'DELIVERED' || statusData.status === 'READ') {
              console.log('🎉 PDF ENTREGUE COM SUCESSO!');
              break;
            } else if (statusData.status === 'FAILED' || statusData.status === 'ERROR') {
              console.log('❌ PDF falhou na entrega:');
              console.log(JSON.stringify(statusData, null, 2));
              break;
            }
          }
        } catch (error) {
          console.log(`❌ Erro ao verificar status: ${error.message}`);
        }
      }
    }

    console.log('\n🎯 CONCLUSÃO:');
    console.log('✅ Sistema está funcionando quando usa URL pública!');
    console.log('💡 Certifique-se de que NEXTAUTH_URL está configurada para produção.');

  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
}

// Verificar configuração antes de executar
if (!process.env.EXTERNAL_API_URL || !process.env.WTS_FROM_PHONE || !process.env.WTS_TO_PHONE) {
  console.log('❌ CONFIGURAÇÃO INCOMPLETA!');
  process.exit(1);
}

if (require.main === module) {
  testWithProductionURL();
}

module.exports = { testWithProductionURL }; 