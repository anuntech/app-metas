# New Dashboard API Documentation

This document describes the new API endpoints for the redesigned Dashboard system that shows progress across multiple meta levels at once.

## API Endpoints

The new Dashboard API provides the following endpoints:

- **GET /api/dashboard/metas** - Retrieve all metas for a given period, grouped by unit
- **GET /api/dashboard/performance** - Retrieve performance data combined with all meta levels
- **GET /api/dashboard/progress** - Retrieve progress calculations across all meta levels (optimized for progress bar visualization)

## 1. Meta Endpoint

### GET /api/dashboard/metas

This endpoint returns all meta levels for a given month and year, grouped by unit.

#### Query Parameters

- `month` (required) - Month name in Portuguese (e.g., "Janeiro")
- `year` (required) - Year (e.g., 2023)

#### Response Format

```javascript
[
  {
    "unit": "Total",
    "metaLevels": [
      {
        "nivel": "I",
        "faturamento": 400000,
        "funcionarios": 100,
        "despesa": 30,
        "inadimplencia": 10,
        "isComplete": false
      },
      {
        "nivel": "II",
        "faturamento": 500000,
        "funcionarios": 100,
        "despesa": 25,
        "inadimplencia": 8,
        "isComplete": false
      },
      {
        "nivel": "III",
        "faturamento": 600000,
        "funcionarios": 100,
        "despesa": 20,
        "inadimplencia": 6,
        "isComplete": false
      }
    ]
  },
  {
    "unit": "Caieiras",
    "metaLevels": [
      // Meta levels for Caieiras
    ]
  },
  // Other units...
]
```

## 2. Performance Endpoint

### GET /api/dashboard/performance

This endpoint returns actual performance data along with all meta levels for each unit.

#### Query Parameters

- `startDate` (required) - ISO format date string (e.g., "2023-05-01T00:00:00.000Z")
- `endDate` (required) - ISO format date string (e.g., "2023-05-31T23:59:59.999Z")

#### Response Format

```javascript
{
  "summary": {
    "faturamento": {
      "atual": 450000,
      "metaLevels": [
        {
          "nivel": "I",
          "valor": 400000,
          "isComplete": true
        },
        {
          "nivel": "II",
          "valor": 500000,
          "isComplete": false
        },
        {
          "nivel": "III",
          "valor": 600000,
          "isComplete": false
        }
      ]
    },
    "faturamentoPorFuncionario": {
      "atual": 4500,
      "metaLevels": [
        // Similar structure to faturamento
      ]
    },
    "despesa": {
      "atual": 28,
      "valorReais": 126000,
      "metaLevels": [
        // Similar structure to faturamento
      ]
    },
    "inadimplencia": {
      "atual": 9,
      "valorReais": 40500,
      "metaLevels": [
        // Similar structure to faturamento
      ]
    },
    "totalFuncionarios": 100
  },
  "units": [
    {
      "nome": "Caieiras",
      "faturamento": {
        "atual": 110000,
        "metaLevels": [
          // Meta levels for this unit
        ]
      },
      "despesa": {
        "atual": 27,
        "valorReais": 29700,
        "metaLevels": [
          // Meta levels for this unit
        ]
      },
      "inadimplencia": {
        "atual": 8,
        "valorReais": 8800,
        "metaLevels": [
          // Meta levels for this unit
        ]
      },
      "totalFuncionarios": 20
    },
    // Other units...
  ]
}
```

## 3. Progress Endpoint

### GET /api/dashboard/progress

This endpoint is specifically designed for progress visualization across all meta levels. It calculates the progress for each metric and each meta level.

#### Query Parameters

- `startDate` (required) - ISO format date string (e.g., "2023-05-01T00:00:00.000Z")
- `endDate` (required) - ISO format date string (e.g., "2023-05-31T23:59:59.999Z")

#### Response Format

```javascript
{
  "summary": {
    "nome": "Total",
    "faturamento": {
      "atual": 450000,
      "valorReais": 450000,
      "metaLevels": [
        {
          "nivel": "I",
          "valor": 400000,
          "progress": 100 // 100% complete
        },
        {
          "nivel": "II",
          "valor": 500000,
          "progress": 50 // 50% progress toward level II
        },
        {
          "nivel": "III",
          "valor": 600000,
          "progress": 0 // 0% progress toward level III
        }
      ],
      "completedLevels": 1,
      "totalLevels": 3,
      "currentLevelProgress": 50,
      "overallProgress": 50 // Overall progress across all levels
    },
    "faturamentoPorFuncionario": {
      // Similar structure to faturamento
    },
    "despesa": {
      // Similar structure to faturamento, but with reversed progress (lower is better)
    },
    "inadimplencia": {
      // Similar structure to faturamento, but with reversed progress (lower is better)
    },
    "totalFuncionarios": 100
  },
  "units": [
    // Similar structure for each unit
  ]
}
```

## Progress Calculation Logic

### For metrics where higher is better (faturamento, faturamentoPorFuncionario):

1. Progress for level I: `actual / metaValue * 100` (capped at 100%)
2. Progress for levels II and above: 
   - Calculate how far the actual value is beyond the previous level
   - Calculate as a percentage of the range between previous level and current level
   - If level I has value 100 and level II has value 200, and actual is 150:
     - Progress for level I = 100%
     - Progress for level II = 50% (halfway between level I and II)

### For metrics where lower is better (despesa, inadimplencia):

1. Progress logic is reversed, with the first level (highest value) being the starting point
2. Progress increases as the actual value decreases below meta targets

### Overall Progress

- Overall progress is calculated as: (completedLevels + (currentLevelProgress / 100)) / totalLevels * 100
- This normalizes progress across all levels to a 0-100 scale

## Using These Endpoints

The `/api/dashboard/progress` endpoint is specifically designed for visualizing progress across multiple meta levels in a single progress bar. Use this endpoint to render progress bars that show:

1. Multiple segments representing different meta levels
2. The current progress within and across all levels
3. Clear indication of which levels are completed and which are in progress

This new API structure eliminates the need for the "Next Meta" buttons by showing progress across all meta levels at once. 