const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://app-metas-production.up.railway.app';

async function testPDFConsistency() {
  console.log('🔍 Testando consistência de PDFs...\n');

  try {
    // 1. Testar endpoint de daily-report (que gera e salva)
    console.log('1. Testando /api/pdf/daily-report...');
    const dailyResponse = await axios.get(`${BASE_URL}/api/pdf/daily-report`);
    console.log('Daily-report response:', dailyResponse.data);
    
    // 2. Extrair filename do response
    const filename = dailyResponse.data.data.filename;
    console.log('Filename gerado:', filename);
    
    // 3. Testar endpoint de serve múltiplas vezes para verificar consistência
    console.log('\n2. Testando consistência do /api/pdf/serve...');
    
    const results = [];
    for (let i = 0; i < 3; i++) {
      console.log(`\nTeste ${i + 1}:`);
      
      const serveResponse = await axios.get(`${BASE_URL}/api/pdf/serve/${filename}`, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      const pdfBuffer = Buffer.from(serveResponse.data);
      const size = pdfBuffer.length;
      
      console.log(`- Tamanho do PDF: ${size} bytes`);
      console.log(`- Headers: ${JSON.stringify(serveResponse.headers)}`);
      
      // Salvar PDF para análise
      const testFilename = `test-pdf-${i + 1}-${Date.now()}.pdf`;
      fs.writeFileSync(testFilename, pdfBuffer);
      console.log(`- PDF salvo como: ${testFilename}`);
      
      results.push({
        test: i + 1,
        size,
        filename: testFilename,
        headers: serveResponse.headers
      });
      
      // Esperar um pouco entre requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // 4. Comparar resultados
    console.log('\n3. Comparando resultados:');
    const sizes = results.map(r => r.size);
    const allSame = sizes.every(size => size === sizes[0]);
    
    console.log('Tamanhos dos PDFs:', sizes);
    console.log('Todos os PDFs têm o mesmo tamanho?', allSame ? '✅ SIM' : '❌ NÃO');
    
    if (!allSame) {
      console.log('⚠️ INCONSISTÊNCIA DETECTADA!');
      results.forEach(result => {
        console.log(`Teste ${result.test}: ${result.size} bytes (${result.filename})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Teste com simulação de requisição da API do WTS
async function simulateWTSRequest() {
  console.log('\n🤖 Simulando requisição da API do WTS...\n');
  
  try {
    // Primeiro gerar um novo PDF
    const dailyResponse = await axios.get(`${BASE_URL}/api/pdf/daily-report`);
    const filename = dailyResponse.data.data.filename;
    
    console.log('PDF gerado:', filename);
    
    // Simular request da API do WTS (com headers similares ao que uma API externa usaria)
    const wtsLikeResponse = await axios.get(`${BASE_URL}/api/pdf/serve/${filename}`, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'WTS-Chat-API/1.0',
        'Accept': 'application/pdf',
        'Cache-Control': 'no-cache'
      }
    });
    
    const pdfBuffer = Buffer.from(wtsLikeResponse.data);
    const wtsFilename = `wts-simulated-${Date.now()}.pdf`;
    fs.writeFileSync(wtsFilename, pdfBuffer);
    
    console.log(`PDF simulado da WTS salvo: ${wtsFilename}`);
    console.log(`Tamanho: ${pdfBuffer.length} bytes`);
    
  } catch (error) {
    console.error('❌ Erro na simulação WTS:', error.message);
  }
}

async function main() {
  await testPDFConsistency();
  await simulateWTSRequest();
}

main(); 