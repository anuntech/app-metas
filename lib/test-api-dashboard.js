const fetch = require('node-fetch');

// Base URL for API requests - change as needed
const BASE_URL = 'http://localhost:3000/api/dashboard';

// Utility to log results in a structured way
const logResult = (test, success, result, error = null) => {
  console.log(`\n${success ? '✅' : '❌'} ${test}`);
  if (result) console.log(JSON.stringify(result, null, 2));
  if (error) console.error('Error:', error.message || error);
};

// Get current date range (first to last day of current month)
const getCurrentMonthDates = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate: firstDay.toISOString(),
    endDate: lastDay.toISOString()
  };
};

// Test functions
async function testDashboardSummary() {
  try {
    const { startDate, endDate } = getCurrentMonthDates();
    const queryParams = new URLSearchParams({ startDate, endDate });
    
    const response = await fetch(`${BASE_URL}/summary?${queryParams}`);
    const data = await response.json();
    
    if (response.ok) {
      logResult('GET Dashboard Summary', true, { 
        status: response.status,
        dateRange: { startDate, endDate },
        data
      });
    } else {
      logResult('GET Dashboard Summary', false, { status: response.status, data });
    }
    return { success: response.ok, data };
  } catch (error) {
    logResult('GET Dashboard Summary', false, null, error);
    return { success: false, error };
  }
}

async function testDashboardUnits() {
  try {
    const { startDate, endDate } = getCurrentMonthDates();
    const queryParams = new URLSearchParams({ startDate, endDate });
    
    const response = await fetch(`${BASE_URL}/units?${queryParams}`);
    const data = await response.json();
    
    if (response.ok) {
      logResult('GET Dashboard Units', true, { 
        status: response.status,
        dateRange: { startDate, endDate },
        unitCount: data.length,
        sample: data.slice(0, 2) // Show only first two units for brevity
      });
    } else {
      logResult('GET Dashboard Units', false, { status: response.status, data });
    }
    return { success: response.ok, data };
  } catch (error) {
    logResult('GET Dashboard Units', false, null, error);
    return { success: false, error };
  }
}

// Test with invalid parameters
async function testInvalidDateParams() {
  try {
    // Missing end date
    const queryParams = new URLSearchParams({ startDate: new Date().toISOString() });
    
    const response = await fetch(`${BASE_URL}/summary?${queryParams}`);
    const data = await response.json();
    
    // We expect this to fail with a 400 Bad Request
    const expectedFailure = response.status === 400;
    
    logResult('Test Invalid Date Parameters', expectedFailure, { 
      status: response.status,
      data,
      expectedStatus: 400
    });
    
    return { success: expectedFailure, data };
  } catch (error) {
    logResult('Test Invalid Date Parameters', false, null, error);
    return { success: false, error };
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Testing Dashboard APIs...');
  
  // Run the tests
  await testDashboardSummary();
  await testDashboardUnits();
  await testInvalidDateParams();
  
  console.log('\n🏁 Dashboard API tests completed!');
}

// Run the tests
runTests(); 