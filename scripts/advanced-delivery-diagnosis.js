#!/usr/bin/env node

/**
 * 🔬 DIAGNÓSTICO AVANÇADO DE ENTREGA EM MASSA
 * 
 * Este script simula exatamente o que acontece às 11h:
 * 1. Envia para múltiplos números (como na produção)
 * 2. Verifica status detalhadamente
 * 3. Identifica problemas específicos (rate limiting, URL, etc.)
 * 4. Propõe soluções
 * 
 * Usage: node scripts/advanced-delivery-diagnosis.js
 */

require('dotenv').config();

async function checkDetailedStatus(statusUrl, authToken, messageId) {
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

async function testBulkSending() {
  console.log('🔬 DIAGNÓSTICO AVANÇADO DE ENTREGA EM MASSA');
  console.log('=' .repeat(60));
  console.log(`🕐 Iniciado em: ${new Date().toLocaleString('pt-BR')}\n`);

  // Configuração
  const wtsConfig = {
    url: process.env.EXTERNAL_API_URL,
    authToken: process.env.EXTERNAL_API_AUTH_TOKEN,
    fromPhone: process.env.WTS_FROM_PHONE,
    messageText: '🧪 TESTE DE DIAGNÓSTICO EM MASSA - Relatório diário'
  };

  // Parse números (limite para alguns números para teste)
  const allPhones = process.env.WTS_TO_PHONE.split(',').map(phone => phone.trim());
  const testPhones = allPhones.slice(0, 5); // Testar apenas 5 números primeiro
  
  console.log(`📱 Testando ${testPhones.length} número(s) de ${allPhones.length} total:`);
  testPhones.forEach((phone, index) => {
    console.log(`   ${index + 1}. ${phone}`);
  });

  // 1. Verificar se URL do PDF é acessível
  console.log('\n🔍 VERIFICANDO URL DO PDF...');
  
  let pdfUrl;
  try {
    const domain = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    if (domain.includes('localhost')) {
      console.log('⚠️  PROBLEMA IDENTIFICADO: URL usando localhost!');
      console.log(`   URL atual: ${domain}`);
      console.log('   ❌ APIs externas não conseguem acessar localhost');
      console.log('\n🔧 SOLUÇÕES:');
      console.log('   1. Configure NEXTAUTH_URL para produção (https://sua-app.vercel.app)');
      console.log('   2. Use ngrok para expor localhost: npx ngrok http 3000');
      console.log('\n🚨 Este é provavelmente o motivo das falhas!');
      
      // Vamos continuar o teste mesmo assim para ver outros possíveis problemas
      pdfUrl = `${domain}/pdfs/daily-reports/test.pdf`;
    } else {
      // Gerar PDF real se temos URL de produção
      console.log(`✅ URL de produção configurada: ${domain}`);
      
      const pdfResponse = await fetch(`${domain}/api/pdf/daily-report`);
      if (!pdfResponse.ok) {
        console.log('❌ Erro ao gerar PDF');
        return;
      }
      
      const pdfResult = await pdfResponse.json();
      if (!pdfResult.success) {
        console.log('❌ Falha na geração do PDF');
        return;
      }
      
      pdfUrl = `${domain}${pdfResult.data.publicUrl}`;
      console.log(`✅ PDF gerado: ${pdfResult.data.filename}`);
      
      // Testar acessibilidade
      const testResponse = await fetch(pdfUrl, { method: 'HEAD' });
      if (testResponse.ok) {
        console.log('✅ PDF é acessível publicamente');
      } else {
        console.log(`❌ PDF não é acessível! Status: ${testResponse.status}`);
        return;
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar PDF: ${error.message}`);
    return;
  }

  console.log(`🔗 URL do PDF: ${pdfUrl}`);

  // 2. Enviar mensagens com delays adequados
  console.log('\n📤 ENVIANDO MENSAGENS COM DELAYS...');
  
  const results = [];
  const sendDelay = 2000; // 2 segundos entre envios (mais conservador)
  
  for (let i = 0; i < testPhones.length; i++) {
    const phone = testPhones[i];
    
    try {
      console.log(`\n📞 Enviando para ${phone} (${i + 1}/${testPhones.length})...`);
      
      const payload = {
        body: {
          text: wtsConfig.messageText,
          fileUrl: pdfUrl
        },
        from: wtsConfig.fromPhone,
        to: phone
      };

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
        console.log(`❌ Erro na API: ${errorText}`);
        
        results.push({
          phone,
          success: false,
          error: `API Error ${response.status}: ${errorText}`
        });
      } else {
        const result = await response.json();
        console.log(`✅ Enviado! Status inicial: ${result.status}`);
        
        results.push({
          phone,
          success: true,
          messageId: result.id,
          statusUrl: result.statusUrl,
          response: result
        });
      }

      // Delay entre envios (exceto no último)
      if (i < testPhones.length - 1) {
        console.log(`⏳ Aguardando ${sendDelay/1000}s antes do próximo envio...`);
        await new Promise(resolve => setTimeout(resolve, sendDelay));
      }

    } catch (error) {
      console.log(`❌ Erro no envio: ${error.message}`);
      results.push({
        phone,
        success: false,
        error: error.message
      });
    }
  }

  // 3. Resumo do envio
  const successful = results.filter(r => r.success);
  const failedSending = results.filter(r => !r.success);
  
  console.log('\n📊 RESUMO DO ENVIO:');
  console.log(`✅ Sucessos: ${successful.length}`);
  console.log(`❌ Falhas: ${failedSending.length}`);
  
  if (failedSending.length > 0) {
    console.log('\n❌ Falhas no envio:');
    failedSending.forEach(f => console.log(`   - ${f.phone}: ${f.error}`));
  }

  if (successful.length === 0) {
    console.log('\n🚨 NENHUMA MENSAGEM ENVIADA COM SUCESSO!');
    console.log('Verifique token de autenticação e configurações da API.');
    return;
  }

  // 4. Aguardar processamento
  console.log('\n⏳ AGUARDANDO PROCESSAMENTO INICIAL...');
  console.log('Aguardando 45 segundos para dar tempo de processar...');
  await new Promise(resolve => setTimeout(resolve, 45000));

  // 5. Verificar status detalhado
  console.log('\n🔍 VERIFICANDO STATUS DETALHADO...');
  
  const statusResults = [];
  
  for (const result of successful) {
    if (result.statusUrl) {
      console.log(`\n📱 Verificando ${result.phone}...`);
      
      const statusCheck = await checkDetailedStatus(
        result.statusUrl, 
        wtsConfig.authToken, 
        result.messageId
      );
      
      statusResults.push({
        phone: result.phone,
        ...statusCheck
      });
      
      if (statusCheck.success) {
        const emoji = statusCheck.status === 'DELIVERED' || statusCheck.status === 'READ' ? '✅' :
                     statusCheck.status === 'FAILED' || statusCheck.status === 'ERROR' ? '❌' : '⏳';
        
        console.log(`   ${emoji} Status: ${statusCheck.status}`);
        
        if (statusCheck.failureReason) {
          console.log(`   💭 Motivo da falha: ${statusCheck.failureReason}`);
        }
      } else {
        console.log(`   ❌ Erro ao verificar: ${statusCheck.error}`);
      }

      // Pequeno delay entre verificações
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 6. Análise final
  console.log('\n' + '='.repeat(60));
  console.log('🔬 ANÁLISE FINAL DOS PROBLEMAS:');
  console.log('=' .repeat(60));

  const delivered = statusResults.filter(r => r.success && (r.status === 'DELIVERED' || r.status === 'READ'));
  const failedDelivery = statusResults.filter(r => r.success && (r.status === 'FAILED' || r.status === 'ERROR'));
  const processing = statusResults.filter(r => r.success && (r.status === 'PROCESSING' || r.status === 'SENT' || r.status === 'QUEUED'));
  const statusErrors = statusResults.filter(r => !r.success);

  console.log(`✅ Entregues: ${delivered.length}`);
  console.log(`❌ Falharam: ${failedDelivery.length}`);
  console.log(`⏳ Ainda processando: ${processing.length}`);
  console.log(`🔧 Erros de verificação: ${statusErrors.length}`);

  // Analisar motivos de falha
  const failureReasons = failedDelivery
    .filter(f => f.failureReason)
    .map(f => f.failureReason);

  if (failureReasons.length > 0) {
    console.log('\n💭 MOTIVOS DAS FALHAS:');
    const reasonCounts = {};
    failureReasons.forEach(reason => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    
    Object.entries(reasonCounts).forEach(([reason, count]) => {
      console.log(`   - ${reason} (${count}x)`);
    });
  }

  // Recomendações
  console.log('\n🔧 RECOMENDAÇÕES:');
  
  if (pdfUrl.includes('localhost')) {
    console.log('1. 🚨 CRÍTICO: Configure URL de produção em NEXTAUTH_URL');
    console.log('   Isso provavelmente resolverá a maioria das falhas');
  }
  
  if (failedDelivery.length > delivered.length) {
    console.log('2. ⏱️  Aumente delays entre envios (atual: 2s, tente 3-5s)');
    console.log('3. 📊 Considere enviar em lotes menores (5-10 por vez)');
  }
  
  if (statusErrors.length > 0) {
    console.log('4. 🔑 Verifique se o token de autenticação está válido');
  }

  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Corrigir a URL de produção');
  console.log('2. Testar novamente com este script');
  console.log('3. Se ainda houver falhas, implementar sistema de retry');
  console.log('4. Considerar monitoramento contínuo de entrega');

  console.log(`\n🕐 Finalizado em: ${new Date().toLocaleString('pt-BR')}`);
}

// Verificar configuração
if (!process.env.EXTERNAL_API_URL || !process.env.WTS_FROM_PHONE || !process.env.WTS_TO_PHONE) {
  console.log('❌ CONFIGURAÇÃO INCOMPLETA!');
  process.exit(1);
}

if (require.main === module) {
  testBulkSending();
}

module.exports = { testBulkSending }; 