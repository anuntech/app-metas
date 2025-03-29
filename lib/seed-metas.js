const dbConnect = require('./dbConnect');
const { Meta } = require('./models');

const sampleMetas = [
  {
    mes: "Janeiro",
    ano: 2023,
    unidade: "Caieiras",
    faturamento: 120000,
    funcionarios: 25,
    despesa: 35,
    inadimplencia: 5,
    nivel: "II"
  },
  {
    mes: "Fevereiro",
    ano: 2023,
    unidade: "Franco da Rocha",
    faturamento: 95000,
    funcionarios: 18,
    despesa: 32,
    inadimplencia: 7,
    nivel: "III"
  },
  {
    mes: "Março",
    ano: 2023,
    unidade: "Mairiporã",
    faturamento: 110000,
    funcionarios: 22,
    despesa: 30,
    inadimplencia: 4,
    nivel: "IV"
  },
  {
    mes: "Janeiro",
    ano: 2023,
    unidade: "Francisco Morato",
    faturamento: 80000,
    funcionarios: 15,
    despesa: 38,
    inadimplencia: 8,
    nivel: "II"
  },
  {
    mes: "Janeiro",
    ano: 2023,
    unidade: "SP - Perus",
    faturamento: 130000,
    funcionarios: 27,
    despesa: 33,
    inadimplencia: 6,
    nivel: "III"
  },
  {
    mes: "Fevereiro",
    ano: 2023,
    unidade: "Caieiras",
    faturamento: 125000,
    funcionarios: 26,
    despesa: 34,
    inadimplencia: 4.5,
    nivel: "II"
  },
  {
    mes: "Março",
    ano: 2023,
    unidade: "Franco da Rocha",
    faturamento: 100000,
    funcionarios: 19,
    despesa: 31,
    inadimplencia: 6.5,
    nivel: "III"
  },
  {
    mes: "Janeiro",
    ano: 2024,
    unidade: "Caieiras",
    faturamento: 140000,
    funcionarios: 28,
    despesa: 32,
    inadimplencia: 4,
    nivel: "II"
  },
  {
    mes: "Fevereiro",
    ano: 2024,
    unidade: "Caieiras",
    faturamento: 145000,
    funcionarios: 28,
    despesa: 31,
    inadimplencia: 3.5,
    nivel: "II"
  },
  {
    mes: "Janeiro",
    ano: 2024,
    unidade: "Mairiporã",
    faturamento: 120000,
    funcionarios: 23,
    despesa: 29,
    inadimplencia: 3,
    nivel: "III"
  }
];

async function seedDatabase() {
  try {
    // Connect to database
    const mongoose = await dbConnect();
    console.log('Connected to MongoDB for seeding');

    // Check if collection already has data
    const count = await Meta.countDocuments();
    if (count > 0) {
      console.log(`Found ${count} existing meta entries. Clearing collection before seeding.`);
      await Meta.deleteMany({});
      console.log('Collection cleared.');
    }

    // Insert sample data
    const result = await Meta.insertMany(sampleMetas);
    console.log(`✅ Successfully seeded ${result.length} meta entries.`);
    
    // Display sample of the data
    console.log('\nSample entries:');
    const sampleEntries = await Meta.find().limit(3);
    sampleEntries.forEach(entry => {
      console.log(`- ${entry.mes}/${entry.ano} - ${entry.unidade}: R$ ${entry.faturamento} | Nível ${entry.nivel}`);
    });

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    
    return { success: true, count: result.length };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error: error.message };
  }
}

// Execute if this file is run directly
if (require.main === module) {
  // Set environment variable for database connection
  if (!process.env.MONGO_URL && !process.env.MONGODB_URI) {
    console.error('❌ MONGO_URL or MONGODB_URI environment variable is not set!');
    process.exit(1);
  }
  
  seedDatabase()
    .then(result => {
      if (result.success) {
        console.log(`Database seeded with ${result.count} entries.`);
        process.exit(0);
      } else {
        console.error('Failed to seed database:', result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error during seeding:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase; 