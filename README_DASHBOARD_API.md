# Dashboard API Documentation

This document explains how to use the Dashboard API endpoints to power the Painel de Resultados (Results Dashboard) component.

## API Endpoints

The Dashboard API provides the following endpoints:

- **GET /api/dashboard/summary** - Retrieve summary data for the dashboard
- **GET /api/dashboard/units** - Retrieve unit-specific data for the dashboard

Both endpoints require date range parameters to filter the data.

## Request Parameters

### Query Parameters

Both endpoints require the following query parameters:

- `startDate` (required) - ISO format date string (e.g., "2023-05-01T00:00:00.000Z")
- `endDate` (required) - ISO format date string (e.g., "2023-05-31T23:59:59.999Z")

## Response Data Structure

### Summary Endpoint (/api/dashboard/summary)

The summary endpoint returns an object with the following structure:

```javascript
{
  "faturamento": {
    "atual": 850000,        // Current revenue value
    "meta": 1000000,        // Target/goal revenue value
    "restante": 150000,     // Remaining amount to reach the goal
    "progresso": 85         // Progress percentage (0-100)
  },
  "faturamentoPorFuncionario": {
    "atual": 42500,         // Current revenue per employee
    "meta": 50000,          // Target revenue per employee
    "restante": 7500,       // Remaining amount to reach the goal
    "progresso": 85         // Progress percentage (0-100)
  },
  "despesa": {
    "atual": 32,            // Current expense percentage
    "meta": 30,             // Target expense percentage
    "restante": -2,         // Difference from target (negative is over budget)
    "progresso": 94,        // Progress percentage (0-100)
    "valorReais": 272000    // Expense amount in currency (BRL)
  },
  "inadimplencia": {
    "atual": 8,             // Current default rate percentage
    "meta": 5,              // Target default rate percentage
    "restante": -3,         // Difference from target (negative is over target)
    "progresso": 63,        // Progress percentage (0-100)
    "valorReais": 68000     // Default amount in currency (BRL)
  },
  "totalFuncionarios": 20   // Total number of employees
}
```

### Units Endpoint (/api/dashboard/units)

The units endpoint returns an array of objects, each representing a business unit:

```javascript
[
  {
    "nome": "Caieiras",      // Unit name
    "faturamento": {
      "atual": 220000,       // Current revenue
      "meta": 250000,        // Target revenue
      "progresso": 88        // Progress percentage (0-100)
    },
    "despesa": {
      "atual": 28,           // Current expense percentage
      "meta": 30,            // Target expense percentage
      "progresso": 93,       // Progress percentage (0-100)
      "valorReais": 61600,   // Expense amount in currency (BRL)
      "isNegative": false    // Whether the value exceeds the target
    },
    "inadimplencia": {
      "atual": 6,            // Current default rate percentage
      "meta": 5,             // Target default rate percentage
      "progresso": 83,       // Progress percentage (0-100)
      "valorReais": 13200,   // Default amount in currency (BRL)
      "isNegative": true     // Whether the value exceeds the target
    }
  },
  // More units...
]
```

## How It Works

The Dashboard API combines data from two sources:

1. **Metas (Goals)** - Defined targets for each metric (faturamento, despesa, inadimplencia, etc.)
2. **Apontamentos (Results)** - Actual results recorded for each period

The API calculates:
- Progress percentages based on the relationship between actual results and targets
- Remaining amounts to reach targets
- Per-employee metrics (revenue per employee)
- Unit-specific summaries

For metrics where lower is better (despesa, inadimplencia), the progress calculation is inverted.

## Example Usage

### Get Summary Data for Current Month

```javascript
// Get first and last day of current month
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

// Format as ISO strings
const startDate = firstDay.toISOString();
const endDate = lastDay.toISOString();

// Build the query params
const queryParams = new URLSearchParams({ startDate, endDate });

// Make the API call
const response = await fetch(`/api/dashboard/summary?${queryParams}`);
const summaryData = await response.json();

// Use the data to update your dashboard
updateDashboard(summaryData);
```

### Get Unit Data for a Custom Date Range

```javascript
// Custom date range (e.g., Q1 2023)
const startDate = new Date(2023, 0, 1).toISOString(); // Jan 1, 2023
const endDate = new Date(2023, 2, 31).toISOString();  // Mar 31, 2023

// Build the query params
const queryParams = new URLSearchParams({ startDate, endDate });

// Make the API call
const response = await fetch(`/api/dashboard/units?${queryParams}`);
const unitsData = await response.json();

// Use the data to update your units display
updateUnitsDisplay(unitsData);
```

## Testing the API

To test the API endpoints, you can use the provided test script:

```bash
# Make sure node-fetch is installed
npm install node-fetch@2

# Run the test script
node lib/test-api-dashboard.js
```

The test script will:
1. Test the summary endpoint with the current month's date range
2. Test the units endpoint with the current month's date range
3. Test error handling with invalid parameters

Make sure your Next.js application is running when you execute the test script. 