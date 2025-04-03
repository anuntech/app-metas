const mongoose = require('mongoose');
const { Meta, Apontamento } = require('./models');

// Sample metas with different levels for April 2025
const sampleMetas = [
  // Level I metas for April 2025
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Total",
    faturamento: 490000,
    funcionarios: 91,
    despesa: 41,
    inadimplencia: 8.5,
    nivel: "I",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Caieiras",
    faturamento: 110000,
    funcionarios: 20,
    despesa: 40,
    inadimplencia: 8,
    nivel: "I",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Francisco Morato",
    faturamento: 80000,
    funcionarios: 15,
    despesa: 45,
    inadimplencia: 10,
    nivel: "I",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Mairiporã",
    faturamento: 95000,
    funcionarios: 18,
    despesa: 42,
    inadimplencia: 9,
    nivel: "I",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "SP - Perus",
    faturamento: 120000,
    funcionarios: 22,
    despesa: 38,
    inadimplencia: 7,
    nivel: "I",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Franco da Rocha",
    faturamento: 85000,
    funcionarios: 16,
    despesa: 43,
    inadimplencia: 9.5,
    nivel: "I",
    isComplete: false
  },
  
  // Level II metas for April 2025
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Total",
    faturamento: 575000,
    funcionarios: 103,
    despesa: 36,
    inadimplencia: 6.5,
    nivel: "II",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Caieiras",
    faturamento: 130000,
    funcionarios: 22,
    despesa: 35,
    inadimplencia: 6,
    nivel: "II",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Francisco Morato",
    faturamento: 95000,
    funcionarios: 17,
    despesa: 40,
    inadimplencia: 8,
    nivel: "II",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Mairiporã",
    faturamento: 110000,
    funcionarios: 20,
    despesa: 38,
    inadimplencia: 7,
    nivel: "II",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "SP - Perus",
    faturamento: 140000,
    funcionarios: 25,
    despesa: 33,
    inadimplencia: 5,
    nivel: "II",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Franco da Rocha",
    faturamento: 100000,
    funcionarios: 19,
    despesa: 38,
    inadimplencia: 7.5,
    nivel: "II",
    isComplete: false
  },
  
  // Level III metas for April 2025
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Total",
    faturamento: 670000,
    funcionarios: 118,
    despesa: 31.8,
    inadimplencia: 4.7,
    nivel: "III",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Caieiras",
    faturamento: 150000,
    funcionarios: 25,
    despesa: 30,
    inadimplencia: 4,
    nivel: "III",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Francisco Morato",
    faturamento: 110000,
    funcionarios: 20,
    despesa: 35,
    inadimplencia: 6,
    nivel: "III",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Mairiporã",
    faturamento: 130000,
    funcionarios: 23,
    despesa: 33,
    inadimplencia: 5,
    nivel: "III",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "SP - Perus",
    faturamento: 160000,
    funcionarios: 28,
    despesa: 28,
    inadimplencia: 3,
    nivel: "III",
    isComplete: false
  },
  {
    mes: "Abril",
    ano: 2025,
    unidade: "Franco da Rocha",
    faturamento: 120000,
    funcionarios: 22,
    despesa: 33,
    inadimplencia: 5.5,
    nivel: "III",
    isComplete: false
  }
];

// Sample apontamentos for April 2025
const sampleApontamentos = [
  // First half of April - Total
  {
    dataInicio: new Date('2025-04-01T12:00:00Z'),
    dataFim: new Date('2025-04-15T12:00:00Z'),
    unidade: "Total",
    faturamento: 298000,
    recebimento: 279000,
    despesa: 104000,
    inadimplenciaPercentual: 6.4,
    inadimplenciaValor: 19000
  },
  {
    dataInicio: new Date('2025-04-01T12:00:00Z'),
    dataFim: new Date('2025-04-15T12:00:00Z'),
    unidade: "Caieiras",
    faturamento: 70000,
    recebimento: 65000,
    despesa: 22000,
    inadimplenciaPercentual: 7.1,
    inadimplenciaValor: 5000
  },
  {
    dataInicio: new Date('2025-04-01T12:00:00Z'),
    dataFim: new Date('2025-04-15T12:00:00Z'),
    unidade: "Francisco Morato",
    faturamento: 48000,
    recebimento: 44000,
    despesa: 19000,
    inadimplenciaPercentual: 8.3,
    inadimplenciaValor: 4000
  },
  {
    dataInicio: new Date('2025-04-01T12:00:00Z'),
    dataFim: new Date('2025-04-15T12:00:00Z'),
    unidade: "Mairiporã",
    faturamento: 55000,
    recebimento: 52000,
    despesa: 20000,
    inadimplenciaPercentual: 5.5,
    inadimplenciaValor: 3000
  },
  {
    dataInicio: new Date('2025-04-01T12:00:00Z'),
    dataFim: new Date('2025-04-15T12:00:00Z'),
    unidade: "SP - Perus",
    faturamento: 75000,
    recebimento: 71000,
    despesa: 24000,
    inadimplenciaPercentual: 5.3,
    inadimplenciaValor: 4000
  },
  {
    dataInicio: new Date('2025-04-01T12:00:00Z'),
    dataFim: new Date('2025-04-15T12:00:00Z'),
    unidade: "Franco da Rocha",
    faturamento: 50000,
    recebimento: 47000,
    despesa: 18000,
    inadimplenciaPercentual: 6.0,
    inadimplenciaValor: 3000
  },
  
  // Second half of April - Total
  {
    dataInicio: new Date('2025-04-16T12:00:00Z'),
    dataFim: new Date('2025-04-30T12:00:00Z'),
    unidade: "Total",
    faturamento: 320000,
    recebimento: 301000,
    despesa: 109000,
    inadimplenciaPercentual: 5.9,
    inadimplenciaValor: 19000
  },
  {
    dataInicio: new Date('2025-04-16T12:00:00Z'),
    dataFim: new Date('2025-04-30T12:00:00Z'),
    unidade: "Caieiras",
    faturamento: 75000,
    recebimento: 70000,
    despesa: 24000,
    inadimplenciaPercentual: 6.7,
    inadimplenciaValor: 5000
  },
  {
    dataInicio: new Date('2025-04-16T12:00:00Z'),
    dataFim: new Date('2025-04-30T12:00:00Z'),
    unidade: "Francisco Morato",
    faturamento: 50000,
    recebimento: 47000,
    despesa: 20000,
    inadimplenciaPercentual: 6.0,
    inadimplenciaValor: 3000
  },
  {
    dataInicio: new Date('2025-04-16T12:00:00Z'),
    dataFim: new Date('2025-04-30T12:00:00Z'),
    unidade: "Mairiporã",
    faturamento: 60000,
    recebimento: 56000,
    despesa: 21000,
    inadimplenciaPercentual: 6.7,
    inadimplenciaValor: 4000
  },
  {
    dataInicio: new Date('2025-04-16T12:00:00Z'),
    dataFim: new Date('2025-04-30T12:00:00Z'),
    unidade: "SP - Perus",
    faturamento: 80000,
    recebimento: 76000,
    despesa: 25000,
    inadimplenciaPercentual: 5.0,
    inadimplenciaValor: 4000
  },
  {
    dataInicio: new Date('2025-04-16T12:00:00Z'),
    dataFim: new Date('2025-04-30T12:00:00Z'),
    unidade: "Franco da Rocha",
    faturamento: 55000,
    recebimento: 52000,
    despesa: 19000,
    inadimplenciaPercentual: 5.5,
    inadimplenciaValor: 3000
  }
];

async function connectToMongoDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB');
    return mongoose;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

async function seedMultipleMetas(mongoUri) {
  let connection;
  try {
    // Connect to MongoDB
    connection = await connectToMongoDB(mongoUri);
    
    // Clear existing metas for April 2025
    console.log('Clearing existing metas for April 2025...');
    const deletedMetasCount = await Meta.deleteMany({ mes: "Abril", ano: 2025 });
    console.log(`Deleted ${deletedMetasCount.deletedCount} existing metas for April 2025`);
    
    // Insert new metas
    console.log('Seeding multiple metas for April 2025...');
    const insertedMetas = await Meta.insertMany(sampleMetas);
    console.log(`✅ Successfully seeded ${insertedMetas.length} metas for April 2025`);
    
    // Store meta IDs by level and unit for connecting apontamentos
    const metaIdsByUnitAndLevel = {};
    for (const meta of insertedMetas) {
      if (!metaIdsByUnitAndLevel[meta.unidade]) {
        metaIdsByUnitAndLevel[meta.unidade] = {};
      }
      metaIdsByUnitAndLevel[meta.unidade][meta.nivel] = meta._id;
    }
    
    // Clear existing apontamentos for April 2025 with adjusted date query
    console.log('Clearing existing apontamentos for April 2025...');
    const deletedApontamentosCount = await Apontamento.deleteMany({ 
      $or: [
        { mes: "Abril", ano: 2025 },
        { dataInicio: { $gte: new Date('2025-03-31T00:00:00Z'), $lt: new Date('2025-05-01T00:00:00Z') } }
      ]
    });
    console.log(`Deleted ${deletedApontamentosCount.deletedCount} existing apontamentos for April 2025`);
    
    // Insert new apontamentos and connect them to metas
    console.log('Seeding apontamentos for April 2025...');
    const savedApontamentos = [];
    
    // We'll explicitly set all required fields and force the month to be April
    for (const apontamentoData of sampleApontamentos) {
      try {
        // Set metaId reference
        if (metaIdsByUnitAndLevel[apontamentoData.unidade] && 
            metaIdsByUnitAndLevel[apontamentoData.unidade][apontamentoData.nivel]) {
          apontamentoData.metaId = metaIdsByUnitAndLevel[apontamentoData.unidade][apontamentoData.nivel];
        }
        
        // Force the dates to be in April
        const startDate = new Date(apontamentoData.dataInicio);
        const endDate = new Date(apontamentoData.dataFim);
        
        // Ensure the correct month is set (April = 3 in JS zero-indexed months)
        startDate.setUTCMonth(3);
        endDate.setUTCMonth(3);
        
        const startDay = startDate.getUTCDate();
        const endDay = endDate.getUTCDate();
        
        // Create periodo string using UTC dates to avoid timezone issues
        const periodo = `${startDay} a ${endDay} de abril`;
        
        // Force mes to be Abril and ano to be 2025
        const mes = "Abril";
        const ano = 2025;
        
        // Create a new model instance with all required fields explicitly set
        const newApontamento = new Apontamento({
          dataInicio: startDate,
          dataFim: endDate,
          unidade: apontamentoData.unidade,
          faturamento: apontamentoData.faturamento,
          recebimento: apontamentoData.recebimento,
          despesa: apontamentoData.despesa,
          inadimplenciaPercentual: apontamentoData.inadimplenciaPercentual,
          inadimplenciaValor: apontamentoData.inadimplenciaValor,
          nivel: apontamentoData.nivel,
          metaId: apontamentoData.metaId,
          periodo: periodo,
          mes: mes,
          ano: ano
        });
        
        // Save the apontamento with explicit values
        const saved = await newApontamento.save();
        savedApontamentos.push(saved);
        console.log(`✓ Saved apontamento for ${saved.unidade}, ${saved.periodo} (${saved.mes}/${saved.ano})`);
      } catch (err) {
        console.error(`Error saving apontamento for ${apontamentoData.unidade}:`, err.message);
      }
    }
    
    console.log(`✅ Successfully seeded ${savedApontamentos.length} apontamentos for April 2025`);
    
    // Display sample of the seeded apontamentos
    if (savedApontamentos.length > 0) {
      console.log('\nSample apontamento entries:');
      const sampleApontamentoEntries = await Apontamento.find({
        dataInicio: { $gte: new Date('2025-04-01') },
        dataFim: { $lte: new Date('2025-04-30') }
      }).limit(3);
      
      sampleApontamentoEntries.forEach(apontamento => {
        console.log(`- ${apontamento.periodo} - ${apontamento.unidade}: Faturamento R$ ${apontamento.faturamento} | Nível ${apontamento.nivel}`);
      });
    }
    
    // Display sample of the seeded metas
    console.log('\nSample meta entries:');
    const sampleMetaEntries = await Meta.find({ mes: "Abril", ano: 2025 }).limit(5);
    sampleMetaEntries.forEach(meta => {
      console.log(`- Abril/2025 - ${meta.unidade}: Nível ${meta.nivel} | Faturamento: R$ ${meta.faturamento} | Despesa: ${meta.despesa}% | ${meta.isComplete ? 'Completa' : 'Em andamento'}`);
    });
    
    // Display total count of metas by level and completion status
    const countByLevelAndStatus = await Meta.aggregate([
      { $match: { mes: "Abril", ano: 2025 } },
      { $group: { 
          _id: { nivel: "$nivel", isComplete: "$isComplete" },
          count: { $sum: 1 } 
        } 
      },
      { $sort: { "_id.nivel": 1, "_id.isComplete": 1 } }
    ]);
    
    console.log('\nMetas count by level and completion status:');
    countByLevelAndStatus.forEach(item => {
      console.log(`- Nível ${item._id.nivel} (${item._id.isComplete ? 'Completa' : 'Em andamento'}): ${item.count} metas`);
    });
    
    console.log('\nSeeding completed successfully!');
    
    return { success: true };
  } catch (error) {
    console.error('Error during seeding:', error);
    return { success: false, error: error.message };
  } finally {
    // Close the connection
    if (connection) {
      await connection.connection.close();
      console.log('Database connection closed.');
    }
  }
}

// Execute if this script is run directly from command line
if (require.main === module) {
  const mongoUri = process.argv[2];
  
  if (!mongoUri) {
    console.error('❌ Please provide MongoDB URI as a command line argument.');
    console.error('Usage: node seed-multiple-metas.js <mongodb-uri>');
    process.exit(1);
  }
  
  seedMultipleMetas(mongoUri)
    .then(result => {
      if (result.success) {
        console.log('Seeding multiple metas completed successfully!');
        process.exit(0);
      } else {
        console.error('Failed to seed multiple metas:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error during seeding:', error);
      process.exit(1);
    });
}

module.exports = seedMultipleMetas; 