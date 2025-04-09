/**
 * Script to test the Dashboard API endpoints
 * 
 * This script tests the new API endpoints for the dashboard,
 * focusing on the meta and performance data retrieval.
 * 
 * Usage:
 *   node scripts/test-dashboard-api.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Meta = require('../lib/models/Meta');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Connect to MongoDB
async function connectToDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Generate sample meta data for testing
async function generateSampleData() {
  try {
    // Define current month and year
    const now = new Date();
    const currentMonth = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ][now.getMonth()];
    const currentYear = now.getFullYear();
    
    // Units to create metas for
    const units = ['Total', 'Caieiras', 'Francisco Morato', 'Mairiporã', 'SP - Perus', 'Franco da Rocha'];
    
    // Sample meta data for each unit and level
    const samples = [];
    
    units.forEach(unit => {
      // Base values that scale with level
      const baseFaturamento = unit === 'Total' ? 400000 : 80000;
      const baseFuncionarios = unit === 'Total' ? 100 : 20;
      const baseDespesa = 30; // percentage
      const baseInadimplencia = 10; // percentage
      
      // Create metas for levels I, II, and III
      ['I', 'II', 'III'].forEach((nivel, index) => {
        // Increase targets with each level
        const multiplier = 1 + (index * 0.25); // Levels increase by 25%
        
        samples.push({
          mes: currentMonth,
          ano: currentYear,
          unidade: unit,
          faturamento: Math.round(baseFaturamento * multiplier),
          funcionarios: Math.round(baseFuncionarios),
          despesa: Math.max(baseDespesa - (index * 5), 5), // Lower is better for expenses
          inadimplencia: Math.max(baseInadimplencia - (index * 2), 2), // Lower is better for delinquency
          nivel,
          isComplete: false
        });
      });
    });
    
    // Clear existing data first (optional, depending on your needs)
    await Meta.deleteMany({ 
      mes: currentMonth, 
      ano: currentYear 
    });
    
    // Insert the sample data
    await Meta.insertMany(samples);
    console.log(`Generated ${samples.length} sample meta records`);
    
  } catch (error) {
    console.error('Error generating sample data:', error);
  }
}

// Test the metas API endpoint
async function testMetasEndpoint() {
  try {
    // Get current month and year
    const now = new Date();
    const currentMonth = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ][now.getMonth()];
    const currentYear = now.getFullYear();
    
    // Query all metas directly from the database
    console.log(`\n----- TESTING METAS ENDPOINT -----`);
    console.log(`Fetching metas for ${currentMonth} ${currentYear}`);
    
    const metas = await Meta.find({
      mes: currentMonth,
      ano: currentYear
    }).sort({ unidade: 1, nivel: 1 });
    
    console.log(`Found ${metas.length} meta records`);
    
    // Group by unit to simulate the API endpoint
    const groupedMetas = {};
    
    metas.forEach(meta => {
      const unitName = meta.unidade;
      
      if (!groupedMetas[unitName]) {
        groupedMetas[unitName] = {
          unit: unitName,
          metaLevels: []
        };
      }
      
      groupedMetas[unitName].metaLevels.push({
        nivel: meta.nivel,
        faturamento: meta.faturamento,
        funcionarios: meta.funcionarios,
        despesa: meta.despesa,
        inadimplencia: meta.inadimplencia,
        isComplete: meta.isComplete
      });
    });
    
    // Display results
    console.log('\nGrouped Metas by Unit:');
    Object.keys(groupedMetas).forEach(unitName => {
      console.log(`\n${unitName}:`);
      const unit = groupedMetas[unitName];
      
      unit.metaLevels.forEach(meta => {
        console.log(`  - Level ${meta.nivel}: Faturamento R$ ${meta.faturamento.toLocaleString('pt-BR')}, Funcionários: ${meta.funcionarios}, Despesa: ${meta.despesa}%, Inadimplência: ${meta.inadimplencia}%`);
      });
    });
    
  } catch (error) {
    console.error('Error testing metas endpoint:', error);
  }
}

// Test the performance API endpoint
async function testPerformanceEndpoint() {
  try {
    // Get current month and year
    const now = new Date();
    const currentMonth = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ][now.getMonth()];
    const currentYear = now.getFullYear();
    
    console.log(`\n----- TESTING PERFORMANCE ENDPOINT -----`);
    console.log(`Simulating performance data for ${currentMonth} ${currentYear}`);
    
    // Query all metas directly from the database
    const metas = await Meta.find({
      mes: currentMonth,
      ano: currentYear
    }).sort({ unidade: 1, nivel: 1 });
    
    // Group metas by unit
    const unitMetas = {};
    metas.forEach(meta => {
      if (!unitMetas[meta.unidade]) {
        unitMetas[meta.unidade] = [];
      }
      unitMetas[meta.unidade].push(meta);
    });
    
    // Simulate some performance data
    // In a real scenario, this would come from your actual data
    const simulateActualPerformance = (unit) => {
      // Get all meta levels for this unit
      const unitMetaLevels = unitMetas[unit] || [];
      
      // If no metas found, return default values
      if (unitMetaLevels.length === 0) {
        return {
          faturamento: { atual: 0 },
          despesa: { atual: 0, valorReais: 0 },
          inadimplencia: { atual: 0, valorReais: 0 }
        };
      }
      
      // Calculate a random actual value between level I and level III
      const minFaturamento = unitMetaLevels[0]?.faturamento || 0;
      const maxFaturamento = unitMetaLevels[unitMetaLevels.length - 1]?.faturamento || 0;
      
      // Make atual a random value between min and max
      const faturamentoAtual = minFaturamento + (Math.random() * (maxFaturamento - minFaturamento));
      
      return {
        faturamento: {
          atual: faturamentoAtual,
          valorReais: faturamentoAtual
        },
        despesa: {
          atual: 25 + (Math.random() * 10), // Random percentage around 25-35%
          valorReais: faturamentoAtual * 0.3 // About 30% of revenue
        },
        inadimplencia: {
          atual: 5 + (Math.random() * 10), // Random percentage around 5-15%
          valorReais: faturamentoAtual * 0.1 // About 10% of revenue
        }
      };
    };
    
    // Generate response structure
    const response = {
      summary: {
        faturamento: {},
        faturamentoPorFuncionario: {},
        despesa: {},
        inadimplencia: {},
        totalFuncionarios: 0
      },
      units: []
    };
    
    // Process total (summary) data
    if (unitMetas['Total']) {
      const totalMetas = unitMetas['Total'];
      const totalPerformance = simulateActualPerformance('Total');
      
      // Calculate total funcionários
      let totalFuncionarios = 0;
      totalMetas.forEach(meta => {
        totalFuncionarios += meta.funcionarios;
      });
      
      // Set summary data
      response.summary = {
        faturamento: {
          atual: totalPerformance.faturamento.atual,
          metaLevels: totalMetas.map(meta => ({
            nivel: meta.nivel,
            valor: meta.faturamento,
            isComplete: meta.isComplete
          }))
        },
        faturamentoPorFuncionario: {
          atual: totalPerformance.faturamento.atual / totalFuncionarios,
          metaLevels: totalMetas.map(meta => ({
            nivel: meta.nivel,
            valor: meta.faturamento / meta.funcionarios,
            isComplete: meta.isComplete
          }))
        },
        despesa: {
          atual: totalPerformance.despesa.atual,
          valorReais: totalPerformance.despesa.valorReais,
          metaLevels: totalMetas.map(meta => ({
            nivel: meta.nivel,
            valor: meta.despesa,
            isComplete: meta.isComplete
          }))
        },
        inadimplencia: {
          atual: totalPerformance.inadimplencia.atual,
          valorReais: totalPerformance.inadimplencia.valorReais,
          metaLevels: totalMetas.map(meta => ({
            nivel: meta.nivel,
            valor: meta.inadimplencia,
            isComplete: meta.isComplete
          }))
        },
        totalFuncionarios
      };
    }
    
    // Process individual units
    for (const unitName in unitMetas) {
      if (unitName === 'Total') continue; // Skip total as it's already processed
      
      const unitMetaList = unitMetas[unitName];
      const unitPerformance = simulateActualPerformance(unitName);
      
      // Calculate unit funcionários
      let unitFuncionarios = 0;
      unitMetaList.forEach(meta => {
        unitFuncionarios += meta.funcionarios;
      });
      
      response.units.push({
        nome: unitName,
        faturamento: {
          atual: unitPerformance.faturamento.atual,
          metaLevels: unitMetaList.map(meta => ({
            nivel: meta.nivel,
            valor: meta.faturamento,
            isComplete: meta.isComplete
          }))
        },
        despesa: {
          atual: unitPerformance.despesa.atual,
          valorReais: unitPerformance.despesa.valorReais,
          metaLevels: unitMetaList.map(meta => ({
            nivel: meta.nivel,
            valor: meta.despesa,
            isComplete: meta.isComplete
          }))
        },
        inadimplencia: {
          atual: unitPerformance.inadimplencia.atual,
          valorReais: unitPerformance.inadimplencia.valorReais,
          metaLevels: unitMetaList.map(meta => ({
            nivel: meta.nivel,
            valor: meta.inadimplencia,
            isComplete: meta.isComplete
          }))
        },
        totalFuncionarios: unitFuncionarios
      });
    }
    
    // Sort units by a predefined order
    const unitOrder = ["Caieiras", "SP - Perus", "Francisco Morato", "Franco da Rocha", "Mairiporã"];
    response.units.sort((a, b) => {
      const indexA = unitOrder.indexOf(a.nome);
      const indexB = unitOrder.indexOf(b.nome);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return a.nome.localeCompare(b.nome);
    });
    
    // Display summary data
    console.log('\nSummary Data:');
    const summaryFaturamento = response.summary.faturamento;
    console.log(`Faturamento atual: R$ ${summaryFaturamento.atual.toLocaleString('pt-BR')}`);
    console.log('Meta Levels:');
    
    summaryFaturamento.metaLevels.forEach(meta => {
      const progress = (summaryFaturamento.atual / meta.valor) * 100;
      console.log(`  - Level ${meta.nivel}: R$ ${meta.valor.toLocaleString('pt-BR')} (${progress.toFixed(2)}% complete)`);
    });
    
    // Display first unit as example
    if (response.units.length > 0) {
      const firstUnit = response.units[0];
      console.log(`\nExample Unit: ${firstUnit.nome}`);
      
      const unitFaturamento = firstUnit.faturamento;
      console.log(`Faturamento atual: R$ ${unitFaturamento.atual.toLocaleString('pt-BR')}`);
      console.log('Meta Levels:');
      
      unitFaturamento.metaLevels.forEach(meta => {
        const progress = (unitFaturamento.atual / meta.valor) * 100;
        console.log(`  - Level ${meta.nivel}: R$ ${meta.valor.toLocaleString('pt-BR')} (${progress.toFixed(2)}% complete)`);
      });
      
      // Display how this would look in a progress bar
      console.log('\nProgress visualization:');
      
      // Get the highest meta value for scale
      const highestMetaValue = Math.max(...unitFaturamento.metaLevels.map(m => m.valor));
      const totalWidth = 50; // characters wide for our ASCII progress bar
      
      let progressBar = '[';
      let currentPosition = 0;
      
      // Sort meta levels by value (ascending)
      const sortedLevels = [...unitFaturamento.metaLevels].sort((a, b) => a.valor - b.valor);
      
      // Add each meta level segment
      sortedLevels.forEach((meta, index) => {
        const metaPosition = Math.round((meta.valor / highestMetaValue) * totalWidth);
        
        // Fill with spaces until this meta's position
        while (currentPosition < metaPosition) {
          progressBar += ' ';
          currentPosition++;
        }
        
        // Add the level indicator
        progressBar += meta.nivel;
        currentPosition++;
      });
      
      // Fill the rest of the bar
      while (currentPosition < totalWidth) {
        progressBar += ' ';
        currentPosition++;
      }
      
      progressBar += ']';
      
      // Add the current value indicator
      const actualPosition = Math.min(
        Math.round((unitFaturamento.atual / highestMetaValue) * totalWidth),
        totalWidth
      );
      
      let actualIndicator = ' '.repeat(actualPosition) + '▲';
      
      console.log(progressBar);
      console.log(actualIndicator);
    }
    
    console.log(`\nTotal units: ${response.units.length}`);
    
  } catch (error) {
    console.error('Error testing performance endpoint:', error);
  }
}

// Main function to run all tests
async function main() {
  await connectToDB();
  
  const args = process.argv.slice(2);
  const shouldGenerateData = args.includes('--generate');
  
  if (shouldGenerateData) {
    await generateSampleData();
  }
  
  await testMetasEndpoint();
  await testPerformanceEndpoint();
  
  // Disconnect from MongoDB
  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB');
}

// Run the main function
main().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
}); 