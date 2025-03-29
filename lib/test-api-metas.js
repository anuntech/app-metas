const fetch = require('node-fetch');

// Base URL for API requests - change as needed
const BASE_URL = 'http://localhost:3000/api/metas';

// Storage for IDs and test data
let createdMetaId = null;
const testMeta = {
  mes: "Abril",
  ano: 2023,
  unidade: "Caieiras",
  faturamento: 135000,
  funcionarios: 27,
  despesa: 33,
  inadimplencia: 4.8,
  nivel: "II"
};
const updatedMeta = {
  faturamento: 142000,
  despesa: 31,
  inadimplencia: 4.2
};

// Utility to log results in a structured way
const logResult = (test, success, result, error = null) => {
  console.log(`\n${success ? '✅' : '❌'} ${test}`);
  if (result) console.log(JSON.stringify(result, null, 2));
  if (error) console.error('Error:', error.message || error);
};

// Test functions
async function testGetAllMetas() {
  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    
    if (response.ok) {
      logResult('GET All Metas', true, { 
        status: response.status, 
        count: data.length,
        sample: data.slice(0, 2)
      });
    } else {
      logResult('GET All Metas', false, { status: response.status, data });
    }
    return { success: response.ok, data };
  } catch (error) {
    logResult('GET All Metas', false, null, error);
    return { success: false, error };
  }
}

async function testSearchMetas() {
  try {
    // Test filtering by year and month
    const queryParams = new URLSearchParams({
      ano: 2023,
      mes: "Janeiro"
    });
    
    const response = await fetch(`${BASE_URL}/search?${queryParams}`);
    const data = await response.json();
    
    if (response.ok) {
      logResult('Search Metas by Year and Month', true, { 
        status: response.status, 
        count: data.length,
        filters: { ano: 2023, mes: "Janeiro" },
        sample: data.slice(0, 2)
      });
    } else {
      logResult('Search Metas by Year and Month', false, { status: response.status, data });
    }
    return { success: response.ok, data };
  } catch (error) {
    logResult('Search Metas by Year and Month', false, null, error);
    return { success: false, error };
  }
}

async function testCreateMeta() {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMeta)
    });
    
    const data = await response.json();
    
    if (response.status === 201) {
      createdMetaId = data.id;
      logResult('Create Meta', true, { status: response.status, id: data.id });
    } else {
      logResult('Create Meta', false, { status: response.status, data });
    }
    return { success: response.status === 201, data, id: data.id };
  } catch (error) {
    logResult('Create Meta', false, null, error);
    return { success: false, error };
  }
}

async function testGetMetaById(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    const data = await response.json();
    
    if (response.ok) {
      logResult(`GET Meta by ID: ${id}`, true, { status: response.status, data });
    } else {
      logResult(`GET Meta by ID: ${id}`, false, { status: response.status, data });
    }
    return { success: response.ok, data };
  } catch (error) {
    logResult(`GET Meta by ID: ${id}`, false, null, error);
    return { success: false, error };
  }
}

async function testUpdateMeta(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMeta)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      logResult(`Update Meta ID: ${id}`, true, { 
        status: response.status, 
        changed: {
          faturamento: data.faturamento,
          despesa: data.despesa,
          inadimplencia: data.inadimplencia
        }
      });
    } else {
      logResult(`Update Meta ID: ${id}`, false, { status: response.status, data });
    }
    return { success: response.ok, data };
  } catch (error) {
    logResult(`Update Meta ID: ${id}`, false, null, error);
    return { success: false, error };
  }
}

async function testDeleteMeta(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      logResult(`Delete Meta ID: ${id}`, true, { status: response.status, message: data.message });
    } else {
      logResult(`Delete Meta ID: ${id}`, false, { status: response.status, data });
    }
    
    // Verify deletion by trying to fetch it again
    const verifyResponse = await fetch(`${BASE_URL}/${id}`);
    const verifyData = await verifyResponse.json();
    
    if (verifyResponse.status === 404) {
      logResult(`Verified Meta ID: ${id} was deleted`, true, { status: verifyResponse.status });
    } else {
      logResult(`Failed to verify deletion of Meta ID: ${id}`, false, { 
        status: verifyResponse.status, 
        data: verifyData 
      });
    }
    
    return { success: response.ok, data };
  } catch (error) {
    logResult(`Delete Meta ID: ${id}`, false, null, error);
    return { success: false, error };
  }
}

// Run all tests in sequence
async function runTests() {
  console.log('=== STARTING META API TESTS ===');
  console.log(`BASE URL: ${BASE_URL}`);
  
  console.log('\n--- Testing GET All Metas ---');
  await testGetAllMetas();
  
  console.log('\n--- Testing Search Metas ---');
  await testSearchMetas();
  
  console.log('\n--- Testing Create Meta ---');
  const createResult = await testCreateMeta();
  if (createResult.success && createResult.id) {
    console.log('\n--- Testing Get Meta By ID ---');
    await testGetMetaById(createResult.id);
    
    console.log('\n--- Testing Update Meta ---');
    await testUpdateMeta(createResult.id);
    
    console.log('\n--- Testing Get Updated Meta ---');
    await testGetMetaById(createResult.id);
    
    console.log('\n--- Testing Delete Meta ---');
    await testDeleteMeta(createResult.id);
  } else {
    console.log('❌ Skipping remaining tests because Meta creation failed');
  }
  
  console.log('\n=== META API TESTS COMPLETED ===');
}

// Execute if this file is run directly
if (require.main === module) {
  // Check if Node Fetch is installed
  if (!fetch) {
    console.error('❌ node-fetch package is required. Please install it with: npm install node-fetch@2');
    process.exit(1);
  }
  
  // Run the tests
  runTests()
    .then(() => {
      console.log('\nAll tests completed.');
    })
    .catch(error => {
      console.error('Error running tests:', error);
      process.exit(1);
    });
}

module.exports = {
  testGetAllMetas,
  testSearchMetas,
  testCreateMeta,
  testGetMetaById,
  testUpdateMeta,
  testDeleteMeta,
  runTests
}; 