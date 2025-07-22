#!/usr/bin/env node

/**
 * 🧪 TESTE DO ENDPOINT DE SERVIR PDF
 * 
 * Este script testa o novo endpoint /api/pdf/serve/[filename]
 * que serve PDFs dinamicamente sem depender de arquivos estáticos.
 * 
 * Usage: node scripts/test-pdf-serve-endpoint.js
 */

require('dotenv').config();

async function testPDFServeEndpoint() {
  console.log('🧪 TESTE DO ENDPOINT DE SERVIR PDF');
  console.log('=' .repeat(50));
  console.log(`🕐 Iniciado em: ${new Date().toLocaleString('pt-BR')}\n`);

  const baseUrl = 'http://localhost:3000';

  try {
    // 1. Primeiro, gerar um PDF via daily-report
    console.log('📄 1. GERANDO PDF VIA DAILY-REPORT...');
    
    const generateResponse = await fetch(`${baseUrl}/api/pdf/daily-report`);
    
    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.log(`❌ Erro ao gerar PDF: ${generateResponse.status} - ${errorText}`);
      return;
    }

    const generateResult = await generateResponse.json();
    
    if (!generateResult.success) {
      console.log(`❌ Falha na geração: ${generateResult.error}`);
      return;
    }

    console.log(`✅ PDF gerado: ${generateResult.data.filename}`);
    console.log(`🔗 URL retornada: ${generateResult.data.publicUrl}`);

    // 2. Testar o novo endpoint diretamente
    const filename = generateResult.data.filename;
    const serveUrl = `${baseUrl}/api/pdf/serve/${filename}`;
    
    console.log(`\n📋 2. TESTANDO ENDPOINT DE SERVIR PDF...`);
    console.log(`🔗 URL do endpoint: ${serveUrl}`);

    const serveResponse = await fetch(serveUrl, { method: 'HEAD' });
    
    console.log(`📊 Status da resposta: ${serveResponse.status}`);
    console.log(`📋 Headers da resposta:`);
    
    serveResponse.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
    });

    if (serveResponse.ok) {
      console.log('✅ ENDPOINT FUNCIONANDO! PDF é acessível');
      
      // 3. Testar download real
      console.log(`\n📥 3. TESTANDO DOWNLOAD COMPLETO...`);
      
      const fullResponse = await fetch(serveUrl);
      
      if (fullResponse.ok) {
        const buffer = await fullResponse.arrayBuffer();
        console.log(`✅ PDF baixado com sucesso! Tamanho: ${buffer.byteLength} bytes`);
        
        // Verificar se é realmente um PDF
        const uint8Array = new Uint8Array(buffer);
        const pdfHeader = uint8Array.slice(0, 4);
        const headerString = String.fromCharCode(...pdfHeader);
        
        if (headerString === '%PDF') {
          console.log('✅ Arquivo é um PDF válido!');
        } else {
          console.log(`❌ Arquivo não parece ser um PDF. Header: ${headerString}`);
        }
      } else {
        console.log(`❌ Erro no download completo: ${fullResponse.status}`);
      }

    } else {
      const errorText = await serveResponse.text();
      console.log(`❌ ENDPOINT NÃO ESTÁ FUNCIONANDO: ${serveResponse.status} - ${errorText}`);
    }

    // 4. Testar com filename diferente
    console.log(`\n🔧 4. TESTANDO COM FILENAME GENÉRICO...`);
    
    const genericUrl = `${baseUrl}/api/pdf/serve/painel-resultados-2025-07-ate-2025-07-15.pdf`;
    console.log(`🔗 URL genérica: ${genericUrl}`);
    
    const genericResponse = await fetch(genericUrl, { method: 'HEAD' });
    
    if (genericResponse.ok) {
      console.log('✅ Endpoint funciona com filename genérico também!');
    } else {
      console.log(`⚠️  Endpoint não funciona com filename genérico: ${genericResponse.status}`);
    }

    // 5. Resumo
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DO TESTE:');
    console.log('=' .repeat(50));
    
    if (serveResponse.ok) {
      console.log('✅ Endpoint /api/pdf/serve/[filename] está funcionando!');
      console.log('✅ PDF pode ser acessado dinamicamente');
      console.log('🚀 Pronto para usar em produção!');
      
      console.log('\n🔗 URL completa para produção seria:');
      console.log(`   https://app-metas-production.up.railway.app/api/pdf/serve/${filename}`);
      
    } else {
      console.log('❌ Endpoint não está funcionando corretamente');
      console.log('🔧 Verifique se o servidor está rodando');
      console.log('🔧 Verifique se não há erros no console do Next.js');
    }

  } catch (error) {
    console.log(`❌ Erro no teste: ${error.message}`);
    console.log('\n🔧 VERIFICAÇÕES:');
    console.log('1. O servidor Next.js está rodando? (npm run dev)');
    console.log('2. A porta 3000 está livre?');
    console.log('3. Não há erros de compilação?');
  }

  console.log(`\n🕐 Finalizado em: ${new Date().toLocaleString('pt-BR')}`);
}

if (require.main === module) {
  testPDFServeEndpoint();
}

module.exports = { testPDFServeEndpoint }; 