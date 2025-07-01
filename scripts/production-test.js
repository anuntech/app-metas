#!/usr/bin/env node

/**
 * 🚀 SCRIPT DE TESTE FINAL - AUTOMAÇÃO COMPLETA
 * 
 * Este script testa a automação completa em produção:
 * 1. Gera PDF através da API de produção
 * 2. Envia para todos os números configurados via WTS
 * 
 * Usage: node scripts/production-test.js
 * 
 * IMPORTANTE: Execute este script APENAS após fazer deploy em produção!
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const PRODUCTION_URL = process.env.PRODUCTION_URL || process.env.NEXTAUTH_URL || 'https://your-production-domain.com';

console.log('🚀 TESTE DE AUTOMAÇÃO COMPLETA EM PRODUÇÃO');
console.log('==========================================\n');

async function checkConfiguration() {
  console.log('🔍 1. VERIFICANDO CONFIGURAÇÃO...\n');

  const requiredVars = {
    'PRODUCTION_URL': PRODUCTION_URL,
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
    console.log('\nVariáveis necessárias:');
    console.log('PRODUCTION_URL=https://seu-dominio-de-producao.com');
    console.log('EXTERNAL_API_URL=https://api.wts.chat/chat/v1/message/send');
    console.log('EXTERNAL_API_AUTH_TOKEN=pn_vJbb3rm1pPlJL0yiIW8ravlkQewNt3jL4rKk0qUPg');
    console.log('WTS_FROM_PHONE=(11) 97199-7520');
    console.log('WTS_TO_PHONE=(11) 97997-9161,(11) 99999-9999');
    process.exit(1);
  }

  // Parse phone numbers
  const phoneList = process.env.WTS_TO_PHONE.split(',').map(phone => phone.trim());
  console.log(`\n📱 Números configurados: ${phoneList.length}`);
  phoneList.forEach((phone, index) => {
    console.log(`   ${index + 1}. ${phone}`);
  });

  console.log(`\n🌍 URL de produção: ${PRODUCTION_URL}`);
  console.log('\n✅ Configuração OK!\n');

  return { phoneList };
}

async function generatePDF() {
  console.log('📄 2. GERANDO PDF EM PRODUÇÃO...\n');

  try {
    const apiUrl = `${PRODUCTION_URL}/api/pdf/daily-report`;
    console.log(`🔗 Fazendo requisição para: ${apiUrl}`);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Falha na API: ${data.message || 'Erro desconhecido'}`);
    }

    const pdfInfo = data.data;
    const fullPdfUrl = `${PRODUCTION_URL}${pdfInfo.publicUrl}`;

    console.log('✅ PDF gerado com sucesso!');
    console.log(`📁 Arquivo: ${pdfInfo.filename}`);
    console.log(`🔗 URL completa: ${fullPdfUrl}\n`);

    return {
      filename: pdfInfo.filename,
      publicUrl: pdfInfo.publicUrl,
      fullUrl: fullPdfUrl
    };

  } catch (error) {
    console.log('❌ Erro ao gerar PDF:', error.message);
    throw error;
  }
}

async function sendToWTS(pdfInfo, phoneList) {
  console.log('📱 3. ENVIANDO VIA WTS PARA TODOS OS NÚMEROS...\n');

  const wtsConfig = {
    url: process.env.EXTERNAL_API_URL,
    authToken: process.env.EXTERNAL_API_AUTH_TOKEN,
    fromPhone: process.env.WTS_FROM_PHONE,
    messageText: process.env.WTS_MESSAGE_TEXT || 'Relatório diário do painel de resultados - Teste de Produção'
  };

  console.log(`📤 Enviando "${pdfInfo.filename}" para ${phoneList.length} número(s):\n`);

  const results = [];
  const errors = [];

  for (let i = 0; i < phoneList.length; i++) {
    const toPhone = phoneList[i];
    
    try {
      console.log(`📞 Enviando para ${toPhone} (${i + 1}/${phoneList.length})...`);

      const payload = {
        body: {
          text: wtsConfig.messageText,
          fileUrl: pdfInfo.fullUrl
        },
        from: wtsConfig.fromPhone,
        to: toPhone
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
        throw new Error(`WTS API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ Sucesso para ${toPhone}`);
      
      results.push({
        phone: toPhone,
        success: true,
        response: result
      });

      // Delay entre envios
      if (i < phoneList.length - 1) {
        console.log('   ⏳ Aguardando 1 segundo...\n');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ Erro para ${toPhone}: ${errorMessage}\n`);
      
      errors.push({
        phone: toPhone,
        error: errorMessage
      });
    }
  }

  // Resumo
  console.log('📊 RESUMO DO ENVIO WTS:');
  console.log(`✅ Sucessos: ${results.length}`);
  console.log(`❌ Erros: ${errors.length}\n`);

  if (results.length > 0) {
    console.log('✅ Números que receberam o PDF:');
    results.forEach(res => console.log(`   - ${res.phone}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('❌ Números com erro:');
    errors.forEach(err => console.log(`   - ${err.phone}: ${err.error}`));
    console.log('');
  }

  return {
    totalSent: results.length,
    totalErrors: errors.length,
    results,
    errors
  };
}

async function testAutomationFlow() {
  console.log('🧪 4. TESTANDO FLUXO COMPLETO DA AUTOMAÇÃO...\n');

  try {
    const schedulerUrl = `${PRODUCTION_URL}/api/schedule/daily-pdf`;
    console.log(`🔗 Fazendo requisição para: ${schedulerUrl}`);

    const response = await fetch(schedulerUrl, {
      method: 'POST'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Falha no agendador: ${data.message || 'Erro desconhecido'}`);
    }

    console.log('✅ Fluxo da automação executado com sucesso!');
    console.log(`📁 Arquivo gerado: ${data.data.filename}`);
    console.log(`📱 Números enviados: ${data.data.totalSent || 'N/A'}`);
    console.log(`❌ Erros: ${data.data.totalErrors || 'N/A'}\n`);

    return data.data;

  } catch (error) {
    console.log('❌ Erro no teste do fluxo:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log(`🕐 Iniciado em: ${new Date().toLocaleString('pt-BR')}\n`);

    // 1. Check configuration
    const { phoneList } = await checkConfiguration();

    // 2. Generate PDF
    const pdfInfo = await generatePDF();

    // 3. Send to WTS
    const wtsResults = await sendToWTS(pdfInfo, phoneList);

    // 4. Test complete automation flow
    console.log('🔄 TESTANDO AUTOMAÇÃO COMPLETA (como será às 11h)...\n');
    await testAutomationFlow();

    // Final summary
    console.log('==========================================');
    console.log('🎉 TESTE COMPLETO FINALIZADO!');
    console.log('==========================================\n');

    console.log('📋 RESUMO FINAL:');
    console.log(`✅ PDF gerado: ${pdfInfo.filename}`);
    console.log(`🔗 URL acessível: ${pdfInfo.fullUrl}`);
    console.log(`📱 WhatsApps enviados: ${wtsResults.totalSent}/${phoneList.length}`);
    console.log(`⏰ Automação às 11h: Funcionando`);

    if (wtsResults.totalSent === phoneList.length) {
      console.log('\n🎉 SUCESSO TOTAL! Sistema pronto para produção!');
      console.log('✅ Todos os números receberam o PDF');
      console.log('✅ Automação funcionando perfeitamente');
      console.log('\n🕐 A partir de agora, o sistema enviará automaticamente às 11h da manhã');
    } else {
      console.log('\n⚠️ SUCESSO PARCIAL');
      console.log(`✅ ${wtsResults.totalSent} de ${phoneList.length} números receberam o PDF`);
      console.log('📞 Verifique os números com erro acima');
    }

    console.log(`\n🕐 Finalizado em: ${new Date().toLocaleString('pt-BR')}`);

  } catch (error) {
    console.log('\n❌ ERRO FATAL:', error.message);
    console.log('\n🔧 VERIFICAÇÕES:');
    console.log('1. Aplicação está rodando em produção?');
    console.log('2. URL de produção está correta?');
    console.log('3. API da WTS está funcionando?');
    console.log('4. Números de telefone estão corretos?');
    
    process.exit(1);
  }
}

// Verificar se todas as variáveis estão definidas antes de iniciar
if (!process.env.EXTERNAL_API_URL || !process.env.WTS_FROM_PHONE || !process.env.WTS_TO_PHONE) {
  console.log('❌ CONFIGURAÇÃO INCOMPLETA!');
  console.log('\nAntes de executar, configure:');
  console.log('PRODUCTION_URL=https://seu-dominio.vercel.app');
  console.log('EXTERNAL_API_URL=https://api.wts.chat/chat/v1/message/send');
  console.log('EXTERNAL_API_AUTH_TOKEN=seu_token');
  console.log('WTS_FROM_PHONE=(11) 97199-7520');
  console.log('WTS_TO_PHONE=(11) 97997-9161,(11) 99999-9999');
  process.exit(1);
}

// Execute if run directly
if (require.main === module) {
  main();
} 