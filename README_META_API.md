# Meta API Testing and Documentation

This document explains how to use the Meta API endpoints, seed the database with test data, and run the API test script.

## API Endpoints

The Meta API provides the following endpoints:

- **GET /api/metas** - Retrieve all metas
- **POST /api/metas** - Create a new meta 
- **GET /api/metas/[id]** - Retrieve a specific meta by ID
- **PUT /api/metas/[id]** - Update a specific meta
- **DELETE /api/metas/[id]** - Delete a specific meta
- **GET /api/metas/search** - Search metas with filters (supports `ano`, `mes`, `unidade`, and `nivel` parameters)

## Database Schema

Each Meta entry contains the following fields:

```javascript
{
  mes: String,        // Month name (Janeiro, Fevereiro, etc.)
  ano: Number,        // Year (2023, 2024, etc.)
  unidade: String,    // Unit name (Caieiras, Franco da Rocha, etc.)
  faturamento: Number, // Revenue amount
  funcionarios: Number, // Number of employees
  despesa: Number,    // Expense percentage
  inadimplencia: Number, // Default rate percentage
  nivel: String       // Level (I, II, III, IV, V, VI)
}
```

## Setup and Testing

### Prerequisites

1. Node.js and npm installed
2. MongoDB connection string (set as an environment variable)
3. Next.js application running 

### Installation

Install the required dependencies:

```bash
npm install node-fetch@2
```

### Seeding the Database

To populate the database with sample data:

```bash
# Set your MongoDB connection string
export MONGO_URL="your_mongodb_connection_string_here"

# Run the seed script
node lib/seed-metas.js
```

### Testing the API

First, make sure your Next.js application is running:

```bash
npm run dev
```

Then, in a separate terminal, run the test script:

```bash
# Set your MongoDB connection string (if not already set)
export MONGO_URL="your_mongodb_connection_string_here"

# Run the test script
node lib/test-api-metas.js
```

The test script will execute the following steps:

1. Retrieve all metas
2. Search metas with filters
3. Create a new meta
4. Retrieve the created meta by ID
5. Update the meta
6. Retrieve the updated meta
7. Delete the meta
8. Verify the meta was deleted

## Example API Usage

### Get All Metas

```javascript
const response = await fetch('http://localhost:3000/api/metas');
const metas = await response.json();
```

### Search Metas by Criteria

```javascript
const queryParams = new URLSearchParams({
  ano: 2023,
  mes: "Janeiro",
  unidade: "Caieiras"
});

const response = await fetch(`http://localhost:3000/api/metas/search?${queryParams}`);
const filteredMetas = await response.json();
```

### Create a New Meta

```javascript
const newMeta = {
  mes: "Maio",
  ano: 2023,
  unidade: "Caieiras",
  faturamento: 130000,
  funcionarios: 25,
  despesa: 30,
  inadimplencia: 5,
  nivel: "II"
};

const response = await fetch('http://localhost:3000/api/metas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newMeta)
});

const result = await response.json();
const createdId = result.id;
```

### Update a Meta

```javascript
const updatedData = {
  faturamento: 142000,
  despesa: 28
};

const response = await fetch(`http://localhost:3000/api/metas/${metaId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedData)
});

const updatedMeta = await response.json();
```

### Delete a Meta

```javascript
const response = await fetch(`http://localhost:3000/api/metas/${metaId}`, {
  method: 'DELETE'
});

const result = await response.json();
``` 