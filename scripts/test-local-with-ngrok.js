const axios = require('axios');
const fs = require('fs');

// Configurações
const LOCAL_URL = 'http://localhost:3000';
let NGROK_URL = ''; // Será definido dinamicamente

async function waitForServer(url, maxAttempts = 30) {
  console.log(`⏳ Aguardando servidor em ${url}...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(`${url}/api/health`, { timeout: 2000 });
      console.log('✅ Servidor local está rodando');
      return true;
    } catch (error) {
      console.log(`Tentativa ${i + 1}/${maxAttempts} - servidor ainda não está pronto...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('Servidor local não respondeu após 30 tentativas');
}

async function findNgrokUrl() {
  try {
    console.log('🔍 Procurando URL do ngrok...');
    
    // Tentar acessar a API do ngrok local
    const response = await axios.get('http://localhost:4040/api/tunnels', { timeout: 5000 });
    const tunnels = response.data.tunnels;
    
    if (tunnels && tunnels.length > 0) {
      const httpTunnel = tunnels.find(t => t.proto === 'https') || tunnels[0];
      NGROK_URL = httpTunnel.public_url;
      console.log(`✅ URL do ngrok encontrada: ${NGROK_URL}`);
      return NGROK_URL;
    } else {
      throw new Error('Nenhum túnel ngrok encontrado');
    }
  } catch (error) {
    console.error('❌ Erro ao buscar URL do ngrok:', error.message);
    console.log('💡 Certifique-se de que o ngrok está rodando com: ngrok http 3000');
    throw error;
  }
}

async function testPDFGeneration(baseUrl, label) {
  console.log(`\n📄 Testando geração de PDF - ${label}`);
  console.log(`URL base: ${baseUrl}`);
  
  try {
    // 1. Gerar PDF
    console.log('1. Gerando PDF...');
    const generateResponse = await axios.get(`${baseUrl}/api/pdf/daily-report`, {
      timeout: 30000
    });
    
    console.log('✅ PDF gerado:', generateResponse.data.data.filename);
    console.log(`📏 Tamanho: ${generateResponse.data.data.fileSize} bytes`);
    console.log(`💾 Existe: ${generateResponse.data.data.fileExists}`);
    
    const filename = generateResponse.data.data.filename;
    const pdfUrl = `${baseUrl}${generateResponse.data.data.publicUrl}`;
    
    // 2. Testar acesso ao PDF
    console.log('2. Testando acesso ao PDF...');
    const pdfResponse = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      timeout: 15000
    });
    
    const pdfBuffer = Buffer.from(pdfResponse.data);
    console.log(`✅ PDF acessível - Tamanho: ${pdfBuffer.length} bytes`);
    console.log(`📋 Content-Type: ${pdfResponse.headers['content-type']}`);
    console.log(`🏷️ PDF Source: ${pdfResponse.headers['x-pdf-source'] || 'não informado'}`);
    
    // 3. Salvar PDF para verificação
    const testFilename = `test-${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    fs.writeFileSync(testFilename, pdfBuffer);
    console.log(`💾 PDF salvo como: ${testFilename}`);
    
    return {
      success: true,
      filename,
      pdfUrl,
      size: pdfBuffer.length,
      testFile: testFilename
    };
    
  } catch (error) {
    console.error(`❌ Erro no teste ${label}:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
    return {
      success: false,
      error: error.message
    };
  }
}

async function testConsistency(baseUrl) {
  console.log(`\n🔄 Testando consistência - fazendo 3 requisições do mesmo PDF`);
  
  try {
    // Primeiro gerar o PDF
    const generateResponse = await axios.get(`${baseUrl}/api/pdf/daily-report`);
    const filename = generateResponse.data.data.filename;
    const pdfUrl = `${baseUrl}${generateResponse.data.data.publicUrl}`;
    
    console.log(`📄 PDF a ser testado: ${filename}`);
    
    const results = [];
    
    // Fazer 3 requisições do mesmo PDF
    for (let i = 1; i <= 3; i++) {
      console.log(`\nRequisição ${i}:`);
      
      const pdfResponse = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        timeout: 15000
      });
      
      const pdfBuffer = Buffer.from(pdfResponse.data);
      const size = pdfBuffer.length;
      const source = pdfResponse.headers['x-pdf-source'];
      
      console.log(`- Tamanho: ${size} bytes`);
      console.log(`- Fonte: ${source || 'não informado'}`);
      
      results.push({ size, source });
      
      // Salvar para comparação
      const testFilename = `consistency-test-${i}-${Date.now()}.pdf`;
      fs.writeFileSync(testFilename, pdfBuffer);
      console.log(`- Salvo como: ${testFilename}`);
      
      // Esperar um pouco entre requisições
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Verificar consistência
    const sizes = results.map(r => r.size);
    const allSame = sizes.every(size => size === sizes[0]);
    
    console.log('\n📊 Resultados:');
    results.forEach((result, index) => {
      console.log(`Req ${index + 1}: ${result.size} bytes (fonte: ${result.source})`);
    });
    
    console.log(`\n${allSame ? '✅' : '❌'} Consistência: ${allSame ? 'TODOS IGUAIS' : 'DIFERENTES!'}`);
    
    return { consistent: allSame, results };
    
  } catch (error) {
    console.error('❌ Erro no teste de consistência:', error.message);
    return { consistent: false, error: error.message };
  }
}

async function simulateWTSRequest(ngrokUrl) {
  console.log('\n🤖 Simulando requisição da API WTS...');
  
  try {
    // Gerar PDF primeiro
    const generateResponse = await axios.get(`${ngrokUrl}/api/pdf/daily-report`);
    const filename = generateResponse.data.data.filename;
    const pdfUrl = `${ngrokUrl}${generateResponse.data.data.publicUrl}`;
    
    console.log(`📄 PDF gerado: ${filename}`);
    console.log(`🔗 URL: ${pdfUrl}`);
    
    // Simular requisição como se fosse a WTS
    const wtsResponse = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'WTS-Chat-API/1.0',
        'Accept': 'application/pdf,*/*',
        'Cache-Control': 'no-cache'
      },
      timeout: 30000
    });
    
    const pdfBuffer = Buffer.from(wtsResponse.data);
    const wtsFilename = `wts-simulation-${Date.now()}.pdf`;
    fs.writeFileSync(wtsFilename, pdfBuffer);
    
    console.log(`✅ Simulação WTS bem-sucedida`);
    console.log(`📏 Tamanho: ${pdfBuffer.length} bytes`);
    console.log(`💾 Salvo como: ${wtsFilename}`);
    console.log(`🏷️ PDF Source: ${wtsResponse.headers['x-pdf-source'] || 'não informado'}`);
    
    return {
      success: true,
      size: pdfBuffer.length,
      filename: wtsFilename
    };
    
  } catch (error) {
    console.error('❌ Erro na simulação WTS:', error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Iniciando testes locais com ngrok\n');
  
  try {
    // 1. Verificar se servidor local está rodando
    await waitForServer(LOCAL_URL);
    
    // 2. Encontrar URL do ngrok
    const ngrokUrl = await findNgrokUrl();
    
    // 3. Testar geração local
    const localTest = await testPDFGeneration(LOCAL_URL, 'LOCAL');
    
    // 4. Testar geração via ngrok
    const ngrokTest = await testPDFGeneration(ngrokUrl, 'NGROK');
    
    // 5. Testar consistência
    const consistencyTest = await testConsistency(ngrokUrl);
    
    // 6. Simular requisição WTS
    const wtsTest = await simulateWTSRequest(ngrokUrl);
    
    // 7. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMO DOS TESTES');
    console.log('='.repeat(60));
    
    console.log(`🏠 Teste Local: ${localTest.success ? '✅ OK' : '❌ FALHOU'}`);
    if (localTest.success) {
      console.log(`   Tamanho: ${localTest.size} bytes`);
    }
    
    console.log(`🌐 Teste Ngrok: ${ngrokTest.success ? '✅ OK' : '❌ FALHOU'}`);
    if (ngrokTest.success) {
      console.log(`   Tamanho: ${ngrokTest.size} bytes`);
    }
    
    console.log(`🔄 Consistência: ${consistencyTest.consistent ? '✅ OK' : '❌ FALHOU'}`);
    
    console.log(`🤖 Simulação WTS: ${wtsTest.success ? '✅ OK' : '❌ FALHOU'}`);
    if (wtsTest.success) {
      console.log(`   Tamanho: ${wtsTest.size} bytes`);
    }
    
    if (localTest.success && ngrokTest.success && consistencyTest.consistent && wtsTest.success) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema pronto para deploy.');
    } else {
      console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
    }
    
  } catch (error) {
    console.error('\n❌ Erro geral nos testes:', error.message);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { testPDFGeneration, testConsistency, simulateWTSRequest }; 