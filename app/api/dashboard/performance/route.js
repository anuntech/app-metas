import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import Meta from '../../../../lib/models/Meta';

/**
 * GET /api/dashboard/performance
 * 
 * Retrieves performance data for the given period combined with all meta levels
 * for each unit. This endpoint is designed to show progress across all meta levels.
 */
export async function GET(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date parameters are required' },
        { status: 400 }
      );
    }
    
    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get month and year from the start date
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const month = monthNames[start.getMonth()];
    const year = start.getFullYear();
    
    // Get all metas for this period
    const metas = await Meta.find({
      mes: month,
      ano: year
    }).sort({ unidade: 1, nivel: 1 });
    
    // Group metas by unit
    const unitMetas = {};
    metas.forEach(meta => {
      if (!unitMetas[meta.unidade]) {
        unitMetas[meta.unidade] = [];
      }
      unitMetas[meta.unidade].push(meta);
    });
    
    // Here we would typically fetch the actual performance data from your database
    // For now, we'll simulate some actual data
    // In a real implementation, you should replace this with actual database queries
    
    const simulateActualPerformance = (unit, totalFaturamento) => {
      return {
        faturamento: {
          atual: totalFaturamento,
          valorReais: totalFaturamento
        },
        despesa: {
          atual: Math.random() * 50, // Random percentage between 0-50%
          valorReais: totalFaturamento * (Math.random() * 0.5) // Random expense value
        },
        inadimplencia: {
          atual: Math.random() * 20, // Random percentage between 0-20%
          valorReais: totalFaturamento * (Math.random() * 0.2) // Random delinquency value
        }
      };
    };
    
    // Mock total performance - you should replace this with real data
    const mockTotalFaturamento = 500000;
    const mockUnitFaturamento = {
      'Caieiras': 120000,
      'Francisco Morato': 90000,
      'Mairiporã': 110000,
      'SP - Perus': 100000,
      'Franco da Rocha': 80000
    };
    
    // Generate response structure
    const response = {
      summary: {
        faturamento: {},
        faturamentoPorFuncionario: {},
        despesa: {},
        inadimplencia: {},
        totalFuncionarios: 0,
        metaLevels: [],
      },
      units: []
    };
    
    // Process total (summary) data
    if (unitMetas['Total']) {
      const totalMetas = unitMetas['Total'];
      const totalPerformance = simulateActualPerformance('Total', mockTotalFaturamento);
      
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
      if (unitName === 'Total') continue; // Skip total unit as it's already processed in summary
      
      const unitMetaList = unitMetas[unitName];
      const unitFaturamento = mockUnitFaturamento[unitName] || 0;
      const unitPerformance = simulateActualPerformance(unitName, unitFaturamento);
      
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
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
} 