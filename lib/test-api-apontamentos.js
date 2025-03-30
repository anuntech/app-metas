const fetch = require('node-fetch');

// Base URL for API requests - change as needed
const BASE_URL = 'http://localhost:3000/api/apontamentos';

// Storage for IDs and test data
let createdApontamentoId = null;
const testApontamento = {
  dataInicio: "2023-05-01T00:00:00.000Z",
  dataFim: "2023-05-15T00:00:00.000Z",
  periodo: "1 a 15 de maio",
  mes: "Maio",
  ano: 2023,
  unidade: "Caieiras",
  faturamento: 60000,
  recebimento: 58000,
  despesa: 19000,
  inadimplenciaPercentual: 3.3,
  inadimplenciaValor: 2000,
  nivel: "II"
};
const updatedApontamento = {
  faturamento: 65000,
  recebimento: 62000,
  despesa: 20000,
  inadimplenciaPercentual: 4.6,
  inadimplenciaValor: 3000
};

// Utility to log results in a structured way
const logResult = (test, success, result, error = null) => {
  console.log(`\n${success ? '✅' : '❌'} ${test}`);
  if (result) console.log(JSON.stringify(result, null, 2));
  if (error) console.error('Error:', error.message || error);
};

// Test functions
async function testGetAllApontamentos() {
  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    
    if (response.ok) {
      logResult('GET All Apontamentos', true, { 
        status: response.status, 
        count: data.length,
        sample: data.slice(0, 2)
      });
    } else {
      logResult('GET All Apontamentos', false, { status: response.status, data });
    }
    return { success: response.ok, data };
  } catch (error) {
    logResult('GET All Apontamentos', false, null, error);
    return { success: false, error };
  }
}

async function testSearchApontamentos() {
  try {
    // Test filtering by year and month
    const queryParams = new URLSearchParams({
      ano: 2023,
      mes: "Janeiro"
    });
    
    const response = await fetch(`${BASE_URL}/search?${queryParams}`);
    const data = await response.json();
    
    if (response.ok) {
      logResult('Search Apontamentos by Year and Month', true, { 
        status: response.status, 
        count: data.length,
        filters: { ano: 2023, mes: "Janeiro" },
        sample: data.slice(0, 2)
      });
    } else {
      logResult('Search Apontamentos by Year and Month', false, { status: response.status, data });
    }
    return { success: response.ok, data };
  } catch (error) {
    logResult('Search Apontamentos by Year and Month', false, null, error);
    return { success: false, error };
  }
}

async function testCreateApontamento() {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testApontamento)
    });
    
    const data = await response.json();
    
    if (response.status === 201) {
      createdApontamentoId = data.id;
      logResult('Create Apontamento', true, { status: response.status, id: data.id });
    } else {
      logResult('Create Apontamento', false, { status: response.status, data });
    }
    return { success: response.status === 201, data, id: data.id };
  } catch (error) {
    logResult('Create Apontamento', false, null, error);
    return { success: false, error };
  }
}

async function testGetApontamentoById(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    const data = await response.json();
    
    if (response.ok) {
      logResult(`GET Apontamento by ID: ${id}`, true, { status: response.status, data });
    } else {
      logResult(`GET Apontamento by ID: ${id}`, false, { status: response.status, data });
    }
    return { success: response.ok, data };
  } catch (error) {
    logResult(`GET Apontamento by ID: ${id}`, false, null, error);
    return { success: false, error };
  }
}

async function testUpdateApontamento(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedApontamento)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      logResult(`Update Apontamento ID: ${id}`, true, { 
        status: response.status, 
        changed: {
          faturamento: data.faturamento,
          recebimento: data.recebimento,
          despesa: data.despesa,
          inadimplenciaPercentual: data.inadimplenciaPercentual,
          inadimplenciaValor: data.inadimplenciaValor
        }
      });
    } else {
      logResult(`Update Apontamento ID: ${id}`, false, { status: response.status, data });
    }
    return { success: response.ok, data };
  } catch (error) {
    logResult(`Update Apontamento ID: ${id}`, false, null, error);
    return { success: false, error };
  }
}

async function testDeleteApontamento(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      logResult(`Delete Apontamento ID: ${id}`, true, { status: response.status, message: data.message });
    } else {
      logResult(`Delete Apontamento ID: ${id}`, false, { status: response.status, data });
    }
    
    // Verify deletion by trying to fetch it again
    const verifyResponse = await fetch(`${BASE_URL}/${id}`);
    const verifyData = await verifyResponse.json();
    
    if (verifyResponse.status === 404) {
      logResult(`Verified Apontamento ID: ${id} was deleted`, true, { status: verifyResponse.status });
    } else {
      logResult(`Failed to verify deletion of Apontamento ID: ${id}`, false, { 
        status: verifyResponse.status, 
        data: verifyData 
      });
    }
    
    return { success: response.ok, data };
  } catch (error) {
    logResult(`Delete Apontamento ID: ${id}`, false, null, error);
    return { success: false, error };
  }
}

// Run all tests in sequence
async function runTests() {
  console.log('=== STARTING APONTAMENTO API TESTS ===');
  console.log(`BASE URL: ${BASE_URL}`);
  
  console.log('\n--- Testing GET All Apontamentos ---');
  await testGetAllApontamentos();
  
  console.log('\n--- Testing Search Apontamentos ---');
  await testSearchApontamentos();
  
  console.log('\n--- Testing Create Apontamento ---');
  const createResult = await testCreateApontamento();
  if (createResult.success && createResult.id) {
    console.log('\n--- Testing Get Apontamento By ID ---');
    await testGetApontamentoById(createResult.id);
    
    console.log('\n--- Testing Update Apontamento ---');
    await testUpdateApontamento(createResult.id);
    
    console.log('\n--- Testing Get Updated Apontamento ---');
    await testGetApontamentoById(createResult.id);
    
    console.log('\n--- Testing Delete Apontamento ---');
    await testDeleteApontamento(createResult.id);
  } else {
    console.log('❌ Create Apontamento test failed. Skipping ID-based tests.');
  }
  
  console.log('\n=== APONTAMENTO API TESTS COMPLETED ===');
}

// Execute if this file is run directly
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('All tests completed.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error during test execution:', err);
      process.exit(1);
    });
}

module.exports = { runTests }; 