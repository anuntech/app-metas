const dbConnect = require('./dbConnect');
const { Apontamento } = require('./models');

const sample2025Apontamentos = [
  {
    dataInicio: new Date('2025-01-02'),
    dataFim: new Date('2025-01-15'),
    periodo: "2 a 15 de janeiro",
    mes: "Janeiro",
    ano: 2025,
    unidade: "Caieiras",
    faturamento: 58000,
    recebimento: 55000,
    despesa: 20000,
    inadimplenciaPercentual: 5.2,
    inadimplenciaValor: 3000,
    nivel: "II"
  },
  {
    dataInicio: new Date('2025-01-16'),
    dataFim: new Date('2025-01-31'),
    periodo: "16 a 31 de janeiro",
    mes: "Janeiro",
    ano: 2025,
    unidade: "Caieiras",
    faturamento: 62000,
    recebimento: 59000,
    despesa: 21000,
    inadimplenciaPercentual: 4.8,
    inadimplenciaValor: 3000,
    nivel: "II"
  },
  {
    dataInicio: new Date('2025-01-02'),
    dataFim: new Date('2025-01-15'),
    periodo: "2 a 15 de janeiro",
    mes: "Janeiro",
    ano: 2025,
    unidade: "Franco da Rocha",
    faturamento: 48000,
    recebimento: 45000,
    despesa: 18000,
    inadimplenciaPercentual: 6.3,
    inadimplenciaValor: 3000,
    nivel: "III"
  },
  {
    dataInicio: new Date('2025-01-16'),
    dataFim: new Date('2025-01-31'),
    periodo: "16 a 31 de janeiro",
    mes: "Janeiro",
    ano: 2025,
    unidade: "Franco da Rocha",
    faturamento: 50000,
    recebimento: 46000,
    despesa: 17500,
    inadimplenciaPercentual: 8.0,
    inadimplenciaValor: 4000,
    nivel: "III"
  },
  {
    dataInicio: new Date('2025-02-02'),
    dataFim: new Date('2025-02-15'),
    periodo: "2 a 15 de fevereiro",
    mes: "Fevereiro",
    ano: 2025,
    unidade: "Mairiporã",
    faturamento: 55000,
    recebimento: 51000,
    despesa: 16000,
    inadimplenciaPercentual: 7.3,
    inadimplenciaValor: 4000,
    nivel: "IV"
  },
  {
    dataInicio: new Date('2025-02-16'),
    dataFim: new Date('2025-02-28'),
    periodo: "16 a 28 de fevereiro",
    mes: "Fevereiro",
    ano: 2025,
    unidade: "Mairiporã",
    faturamento: 53000,
    recebimento: 50000,
    despesa: 15500,
    inadimplenciaPercentual: 5.7,
    inadimplenciaValor: 3000,
    nivel: "IV"
  },
  {
    dataInicio: new Date('2025-03-02'),
    dataFim: new Date('2025-03-15'),
    periodo: "2 a 15 de março",
    mes: "Março",
    ano: 2025,
    unidade: "SP - Perus",
    faturamento: 66000,
    recebimento: 62000,
    despesa: 19000,
    inadimplenciaPercentual: 6.1,
    inadimplenciaValor: 4000,
    nivel: "III"
  },
  {
    dataInicio: new Date('2025-03-16'),
    dataFim: new Date('2025-03-31'),
    periodo: "16 a 31 de março",
    mes: "Março",
    ano: 2025,
    unidade: "SP - Perus",
    faturamento: 64000,
    recebimento: 61000,
    despesa: 19500,
    inadimplenciaPercentual: 4.7,
    inadimplenciaValor: 3000,
    nivel: "III"
  },
  {
    dataInicio: new Date('2025-04-02'),
    dataFim: new Date('2025-04-15'),
    periodo: "2 a 15 de abril",
    mes: "Abril",
    ano: 2025,
    unidade: "Francisco Morato",
    faturamento: 42000,
    recebimento: 38000,
    despesa: 14000,
    inadimplenciaPercentual: 9.5,
    inadimplenciaValor: 4000,
    nivel: "II"
  },
  {
    dataInicio: new Date('2025-04-16'),
    dataFim: new Date('2025-04-30'),
    periodo: "16 a 30 de abril",
    mes: "Abril",
    ano: 2025,
    unidade: "Francisco Morato",
    faturamento: 40000,
    recebimento: 37000,
    despesa: 13500,
    inadimplenciaPercentual: 7.5,
    inadimplenciaValor: 3000,
    nivel: "II"
  },
  // Maio
  {
    dataInicio: new Date('2025-05-02'),
    dataFim: new Date('2025-05-15'),
    periodo: "2 a 15 de maio",
    mes: "Maio",
    ano: 2025,
    unidade: "Caieiras",
    faturamento: 63000,
    recebimento: 60000,
    despesa: 22000,
    inadimplenciaPercentual: 4.8,
    inadimplenciaValor: 3000,
    nivel: "II"
  },
  {
    dataInicio: new Date('2025-05-16'),
    dataFim: new Date('2025-05-31'),
    periodo: "16 a 31 de maio",
    mes: "Maio",
    ano: 2025,
    unidade: "Franco da Rocha",
    faturamento: 52000,
    recebimento: 49000,
    despesa: 18000,
    inadimplenciaPercentual: 5.8,
    inadimplenciaValor: 3000,
    nivel: "III"
  }
];

async function resetAndSeedApontamentos() {
  try {
    // Connect to database
    const mongoose = await dbConnect();
    console.log('Connected to MongoDB for resetting and seeding apontamentos');

    // Delete all existing apontamentos
    console.log('Deleting all existing apontamentos...');
    const deleteResult = await Apontamento.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} apontamentos`);
    
    // Save each apontamento individually to ensure pre-save hooks run
    console.log('Seeding apontamentos for 2025...');
    const savedApontamentos = [];
    for (const apontamento of sample2025Apontamentos) {
      try {
        const newApontamento = new Apontamento(apontamento);
        const saved = await newApontamento.save();
        savedApontamentos.push(saved);
        console.log(`✓ Saved apontamento for ${saved.unidade}, ${saved.periodo} (${saved.mes}/${saved.ano})`);
      } catch (err) {
        console.error(`Error saving apontamento for ${apontamento.unidade}:`, err.message);
      }
    }

    console.log(`✅ Successfully seeded ${savedApontamentos.length} apontamento entries for 2025.`);
    
    // Display sample of the data
    console.log('\nSample entries:');
    const sampleEntries = await Apontamento.find().limit(3);
    sampleEntries.forEach(entry => {
      console.log(`- ${entry.periodo} - ${entry.unidade}: Faturamento R$ ${entry.faturamento} | Recebimento R$ ${entry.recebimento} | Mês/Ano: ${entry.mes}/${entry.ano}`);
    });

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    
    return { success: true, count: savedApontamentos.length };
  } catch (error) {
    console.error('Error resetting and seeding apontamentos database:', error);
    return { success: false, error: error.message };
  }
}

// Execute if this file is run directly
if (require.main === module) {
  // Check environment variable for database connection
  if (!process.env.MONGO_URL && !process.env.MONGODB_URI) {
    console.error('❌ MONGO_URL or MONGODB_URI environment variable is not set!');
    process.exit(1);
  }
  
  resetAndSeedApontamentos()
    .then(result => {
      if (result.success) {
        console.log(`Database reset and seeded with ${result.count} apontamento entries for 2025.`);
        process.exit(0);
      } else {
        console.error('Failed to reset and seed apontamentos database:', result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error during reset and seeding apontamentos:', err);
      process.exit(1);
    });
}

module.exports = resetAndSeedApontamentos; 