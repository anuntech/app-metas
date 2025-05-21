import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import Meta from '../../../../lib/models/Meta';
import { Apontamento } from '../../../../lib/models';

/**
 * GET /api/dashboard/progress
 * 
 * Retrieves the progress data for all metrics, showing how actual performance
 * stacks up against all available meta levels.
 * This endpoint is specifically designed for multi-level progress visualization.
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
    
    // Group metas by unit and sort by level
    const unitMetas = {};
    metas.forEach(meta => {
      if (!unitMetas[meta.unidade]) {
        unitMetas[meta.unidade] = [];
      }
      unitMetas[meta.unidade].push(meta);
    });
    
    // Log meta data availability
    console.log(`Found metas for ${Object.keys(unitMetas).length} units:`, Object.keys(unitMetas));
    
    // Check if we have "Total" metas
    if (unitMetas['Total']) {
      console.log(`Found ${unitMetas['Total'].length} "Total" metas`);
    } else {
      console.log('No "Total" metas found - summary data will be empty');
    }
    
    // For each unit, sort meta levels by the faturamento value
    for (const unit in unitMetas) {
      unitMetas[unit].sort((a, b) => a.faturamento - b.faturamento);
    }
    
    // FIXED: Use the exact date range selected by the user instead of the whole month
    // The query now checks for overlapping date ranges between apontamentos and selected period
    const apontamentosQuery = {
      $or: [
        // Case 1: apontamento completely contains the selected period
        { 
          dataInicio: { $lte: start },
          dataFim: { $gte: end }
        },
        // Case 2: selected period completely contains the apontamento
        {
          dataInicio: { $gte: start, $lte: end },
          dataFim: { $gte: start, $lte: end }
        },
        // Case 3: apontamento starts before but ends during selected period
        {
          dataInicio: { $lt: start },
          dataFim: { $gte: start, $lte: end }
        },
        // Case 4: apontamento starts during but ends after selected period
        {
          dataInicio: { $gte: start, $lte: end },
          dataFim: { $gt: end }
        }
      ]
    };
    
    // Get all apontamentos matching the filter, sorted by updatedAt in descending order
    const allApontamentos = await Apontamento.find(apontamentosQuery).sort({ updatedAt: -1 });
    
    // Create a map to store only the latest apontamento for each unit
    const latestApontamentosByUnit = new Map();
    
    // Process apontamentos to keep only the latest one for each unit
    allApontamentos.forEach(apt => {
      if (!latestApontamentosByUnit.has(apt.unidade)) {
        latestApontamentosByUnit.set(apt.unidade, apt);
      }
    });
    
    // Calculate the "Total" apontamento based on unit apontamentos (if not already present)
    if (!latestApontamentosByUnit.has('Total')) {
      // Filter to only include unit apontamentos (not "Total")
      const unitApontamentos = Array.from(latestApontamentosByUnit.values())
        .filter(apt => apt.unidade !== 'Total');
      
      if (unitApontamentos.length > 0) {
        // Create a sample apontamento from the first unit for reference
        const sampleApontamento = { ...unitApontamentos[0] };
        
        // Calculate sums for numerical values
        const totalFaturamento = unitApontamentos.reduce((sum, apt) => sum + apt.faturamento, 0);
        const totalRecebimento = unitApontamentos.reduce((sum, apt) => sum + apt.recebimento, 0);
        const totalDespesa = unitApontamentos.reduce((sum, apt) => sum + apt.despesa, 0);
        const totalQuantidadeContratos = unitApontamentos.reduce((sum, apt) => sum + (apt.quantidadeContratos || 0), 0);
        
        // Calculate inadimplência percentual (faturamento - recebimento) / faturamento * 100
        const inadimplenciaPercentual = totalFaturamento === 0 
          ? 0 
          : Number(((totalFaturamento - totalRecebimento) / totalFaturamento * 100).toFixed(2));
        
        // Create the calculated total object
        const calculatedTotal = {
          _id: `calculated-total-${sampleApontamento.periodo}`,
          periodo: sampleApontamento.periodo,
          unidade: "Total",
          faturamento: totalFaturamento,
          recebimento: totalRecebimento,
          despesa: totalDespesa,
          inadimplenciaPercentual: inadimplenciaPercentual,
          inadimplenciaValor: totalFaturamento - totalRecebimento,
          quantidadeContratos: totalQuantidadeContratos,
          dataInicio: sampleApontamento.dataInicio,
          dataFim: sampleApontamento.dataFim,
          mes: sampleApontamento.mes,
          ano: sampleApontamento.ano,
          isCalculated: true
        };
        
        // Add the calculated total to the map
        latestApontamentosByUnit.set('Total', calculatedTotal);
      }
    }
    
    // Replace simulated data with actual apontamentos data
    const getActualPerformance = (unit) => {
      // Get the most recent apontamento for this unit
      const apontamento = latestApontamentosByUnit.get(unit);
      
      // If no apontamento found, return default values
      if (!apontamento) {
        return {
          faturamento: { atual: 0, valorReais: 0 },
          despesa: { atual: 0, valorReais: 0 },
          inadimplencia: { atual: 0, valorReais: 0 },
          quantidadeContratos: { atual: 0 }
        };
      }
      
      // Calculate the percentage values for despesa and inadimplencia
      const despesaPercent = apontamento.faturamento > 0 
        ? (apontamento.despesa / apontamento.faturamento) * 100 
        : 0;
      
      // Prioritize the user-entered inadimplenciaPercentual instead of calculating it
      const inadimplenciaPercent = apontamento.inadimplenciaPercentual || 0;
      
      // Return actual data from the apontamento
      return {
        faturamento: {
          atual: apontamento.faturamento,
          valorReais: apontamento.faturamento
        },
        despesa: {
          atual: despesaPercent,
          valorReais: apontamento.despesa
        },
        inadimplencia: {
          atual: inadimplenciaPercent,
          valorReais: apontamento.inadimplenciaValor || (apontamento.faturamento * inadimplenciaPercent / 100)
        },
        quantidadeContratos: {
          atual: apontamento.quantidadeContratos || 0
        }
      };
    };
    
    // Prepare the response with progress data for each unit
    const progressData = {
      summary: {},
      units: [],
      apontamentos: Array.from(latestApontamentosByUnit.values()) // Include apontamentos in the response for debugging
    };
    
    // Log the apontamentos being used for calculations
    console.log(`Dashboard progress: Found ${progressData.apontamentos.length} apontamentos for calculation`);
    
    // Specifically log the Total apontamento if it exists
    const totalApontamento = latestApontamentosByUnit.get('Total');
    if (totalApontamento) {
      console.log('Total apontamento found:', {
        faturamento: totalApontamento.faturamento,
        recebimento: totalApontamento.recebimento,
        despesa: totalApontamento.despesa,
        inadimplenciaPercentual: totalApontamento.inadimplenciaPercentual
      });
      
      // Add a simple summary even if no Total meta exists
      // This ensures the dashboard can show the basic total values even without progress calculations
      if (!unitMetas['Total']) {
        // Calculate despesa percentage
        const despesaPercent = totalApontamento.faturamento > 0 
          ? (totalApontamento.despesa / totalApontamento.faturamento) * 100 
          : 0;
        
        // Calculate ticket médio
        const quantidadeContratos = totalApontamento.quantidadeContratos || 0;
        const ticketMedio = quantidadeContratos > 0 
          ? totalApontamento.faturamento / quantidadeContratos
          : 0;
        
        progressData.summary = {
          nome: 'Total',
          faturamento: {
            atual: totalApontamento.faturamento,
            valorReais: totalApontamento.faturamento,
            metaLevels: [],
            overallProgress: 0
          },
          faturamentoPorFuncionario: {
            atual: 0,
            metaLevels: [],
            overallProgress: 0
          },
          despesa: {
            atual: despesaPercent,
            valorReais: totalApontamento.despesa,
            metaLevels: [],
            overallProgress: 0
          },
          inadimplencia: {
            atual: totalApontamento.inadimplenciaPercentual,
            valorReais: totalApontamento.inadimplenciaValor || 0,
            metaLevels: [],
            overallProgress: 0
          },
          quantidadeContratos: {
            atual: quantidadeContratos,
            metaLevels: [],
            overallProgress: 0
          },
          ticketMedio: {
            atual: ticketMedio,
            metaLevels: [],
            overallProgress: 0
          },
          totalFuncionarios: 0
        };
      }
    } else {
      console.log('No Total apontamento found');
    }
    
    // Calculate progress for Total (summary) if Total metas exist
    if (unitMetas['Total']) {
      const totalMetas = unitMetas['Total'];
      const totalActual = getActualPerformance('Total');
      
      console.log('Using Total performance data:', totalActual);
      
      // Calculate total funcionários
      let totalFuncionarios = 0;
      totalMetas.forEach(meta => {
        totalFuncionarios += meta.funcionarios;
      });
      
      // Process each metric type
      progressData.summary = calculateProgressForUnit(
        'Total', 
        totalMetas, 
        totalActual, 
        totalFuncionarios
      );
      
      console.log('Calculated summary data:', {
        faturamento: progressData.summary.faturamento.atual,
        despesa: progressData.summary.despesa.atual,
        inadimplencia: progressData.summary.inadimplencia.atual
      });
    }
    
    // Calculate progress for each individual unit
    for (const unit in unitMetas) {
      if (unit === 'Total') continue; // Skip Total since it's already handled
      
      const unitMetaList = unitMetas[unit];
      const unitActual = getActualPerformance(unit);
      
      // Calculate total funcionários for this unit
      let unitFuncionarios = 0;
      unitMetaList.forEach(meta => {
        unitFuncionarios += meta.funcionarios;
      });
      
      // Calculate progress for each metric
      const unitProgress = calculateProgressForUnit(
        unit, 
        unitMetaList, 
        unitActual, 
        unitFuncionarios
      );
      
      // Add to the units array
      progressData.units.push(unitProgress);
    }
    
    // Sort units by a predefined order
    const unitOrder = ["Caieiras", "SP - Perus", "Francisco Morato", "Franco da Rocha", "Mairiporã"];
    progressData.units.sort((a, b) => {
      const indexA = unitOrder.indexOf(a.nome);
      const indexB = unitOrder.indexOf(b.nome);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return a.nome.localeCompare(b.nome);
    });
    
    return NextResponse.json(progressData);
    
  } catch (error) {
    console.error('Error calculating progress data:', error);
    return NextResponse.json(
      { error: 'Failed to calculate progress data' },
      { status: 500 }
    );
  }
}

/**
 * Calculate the progress for each metric across all meta levels for a unit
 */
function calculateProgressForUnit(unitName, metaList, actualData, totalFuncionarios) {
  // Calculate faturamento progress
  const faturamentoActual = actualData.faturamento.atual;
  const faturamentoProgress = calculateMetricProgress(faturamentoActual, metaList, 'faturamento', false);
  
  // Create meta levels for faturamento por funcionario based on faturamento and funcionarios
  const faturamentoPorFuncionarioMetas = metaList.map(meta => {
    const faturamentoPorFunc = meta.funcionarios > 0 ? meta.faturamento / meta.funcionarios : 0;
    return {
      ...meta,
      faturamentoPorFuncionario: faturamentoPorFunc,
      nivel: meta.nivel
    };
  });
  
  // Calculate faturamento por funcionario progress
  const faturamentoPorFuncionarioActual = totalFuncionarios > 0 ? faturamentoActual / totalFuncionarios : 0;
  const faturamentoPorFuncionarioProgress = calculateMetricProgress(
    faturamentoPorFuncionarioActual,
    faturamentoPorFuncionarioMetas,
    'faturamentoPorFuncionario',
    false
  );
  
  // Calculate despesa progress (lower is better)
  const despesaActual = actualData.despesa.atual;
  const despesaProgress = calculateMetricProgress(despesaActual, metaList, 'despesa', true);
  
  // Calculate inadimplencia progress (lower is better)
  const inadimplenciaActual = actualData.inadimplencia.atual;
  const inadimplenciaProgress = calculateMetricProgress(inadimplenciaActual, metaList, 'inadimplencia', true);

  // Calculate quantidadeContratos progress
  const quantidadeContratosActual = actualData.quantidadeContratos?.atual || 0;
  const quantidadeContratosProgress = calculateMetricProgress(
    quantidadeContratosActual,
    metaList,
    'quantidadeContratos',
    false
  );

  // Calculate ticket médio
  const ticketMedioActual = quantidadeContratosActual > 0 ? faturamentoActual / quantidadeContratosActual : 0;
  
  // Create meta levels for ticket médio based on faturamento and quantidadeContratos metas
  const ticketMedioMetas = metaList.map(meta => {
    const ticketMedio = meta.quantidadeContratos > 0 ? meta.faturamento / meta.quantidadeContratos : 0;
    return {
      ...meta,
      ticketMedio,
      nivel: meta.nivel
    };
  });

  // Calculate ticket médio progress
  const ticketMedioProgress = calculateMetricProgress(
    ticketMedioActual,
    ticketMedioMetas,
    'ticketMedio',
    false
  );
  
  const result = {
    nome: unitName,
    faturamento: {
      atual: faturamentoActual,
      valorReais: faturamentoActual,
      ...faturamentoProgress
    },
    faturamentoPorFuncionario: {
      atual: faturamentoPorFuncionarioActual,
      ...faturamentoPorFuncionarioProgress
    },
    despesa: {
      atual: despesaActual,
      valorReais: actualData.despesa.valorReais,
      ...despesaProgress
    },
    inadimplencia: {
      atual: inadimplenciaActual,
      valorReais: actualData.inadimplencia.valorReais,
      ...inadimplenciaProgress
    },
    quantidadeContratos: {
      atual: quantidadeContratosActual,
      ...quantidadeContratosProgress
    },
    ticketMedio: {
      atual: ticketMedioActual,
      ...ticketMedioProgress
    },
    totalFuncionarios
  };

  return result;
}

/**
 * Calculate progress for a specific metric across all meta levels
 * For metrics like despesa and inadimplencia, lower values are better (isReversed=true)
 */
function calculateMetricProgress(actualValue, metaList, metricName, isReversed) {
  // Special handling for faturamentoPorFuncionario which isn't directly in the meta model
  const getMetricValue = (meta) => {
    if (metricName === 'faturamentoPorFuncionario') {
      return meta.faturamentoPorFuncionario;
    }
    return meta[metricName];
  };
  
  // Helper function to convert Roman numeral to integer
  const romanToInt = (roman) => {
    const romanValues = {
      'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
      'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10
    };
    return romanValues[roman] || 0;
  };
  
  // Sort meta levels by Roman numeral order
  const sortedMetas = [...metaList].sort((a, b) => {
    return romanToInt(a.nivel) - romanToInt(b.nivel);
  });
  
  // Calculate the progress for each meta level
  const metaProgresses = [];
  
  // Track how many metas are completed
  let completedLevels = 0;
  
  // For metrics where lower is better (despesa, inadimplencia)
  if (isReversed) {
    // For reversed metrics, we need to check if actual value is below each meta level
    for (let i = 0; i < sortedMetas.length; i++) {
      const targetValue = getMetricValue(sortedMetas[i]);
      // For reversed metrics, we meet the goal if actual value is LOWER than target
      const isCompleted = actualValue <= targetValue;
      
      // Calculate progress within this level
      let progress = 0;
      if (isCompleted) {
        progress = 100; // Level completed
        completedLevels++;
      } else {
        // Not completed - calculate partial progress based on how close we are to target
        // For reversed metrics (like despesa/inadimplencia), lower values are better
        
        // For all levels, calculate how close we are to target
        // If actual is 32% and target is 30%, we want to show some progress
        // More challenging levels (lower targets) get stricter calculations
        
        // Determine reference value for percentage calculation
        // For Level I, use 1.5x the target as the "zero progress" point
        // For other levels, use the previous level's target as reference
        let referenceValue;
        
        if (i === 0) {
          // For first level, use a value 50% higher than target as reference for 0% progress
          referenceValue = targetValue * 1.5;
          // Calculate progress (as percentage of distance from reference to target)
          progress = Math.max(0, 100 - ((actualValue - targetValue) / (referenceValue - targetValue)) * 100);
        } else {
          // For higher levels, use previous level as reference
          const prevTarget = getMetricValue(sortedMetas[i - 1]);
          
          // Calculate progress from previous level to current
          if (actualValue < prevTarget) {
            // We're better than previous level
            const range = prevTarget - targetValue;
            if (range > 0) {
              progress = Math.max(0, 100 * (prevTarget - actualValue) / range);
            }
          } else {
            // We're worse than or equal to previous level
            // Calculate based on how close we are to previous level
            progress = Math.max(0, 100 - ((actualValue - prevTarget) / (prevTarget * 0.2)) * 100);
            progress = Math.min(progress, 20); // Cap at 20% if we're at or worse than previous level
          }
        }
        
        // Cap progress at 99% for incomplete levels
        progress = Math.min(progress, 99);
      }
      
      metaProgresses.push({
        nivel: sortedMetas[i].nivel || `${i + 1}`,
        valor: targetValue,
        progress: Math.round(progress)
      });
    }
  } else {
    // For regular metrics where higher is better (like faturamento)
    for (let i = 0; i < sortedMetas.length; i++) {
      const targetValue = getMetricValue(sortedMetas[i]);
      // For regular metrics, we meet the goal if actual value is HIGHER than target
      const isCompleted = actualValue >= targetValue;
      
      // Calculate progress within this level
      let progress = 0;
      if (isCompleted) {
        progress = 100; // Level completed
        completedLevels++;
      } else {
        // For uncompleted levels, calculate progress based on how close we are
        if (i === 0) {
          // First level - calculate progress from 0 to target
          progress = Math.min(99, Math.max(0, (actualValue / targetValue) * 100));
        } else {
          // Higher levels - calculate progress from previous level
          const prevTarget = getMetricValue(sortedMetas[i-1]);
          
          // Calculate progress only if we've met the previous level's target
          if (actualValue >= prevTarget) {
            // If we're between previous and current target
            const range = targetValue - prevTarget;
            if (range > 0) {
              progress = Math.min(99, Math.max(0, 100 * (actualValue - prevTarget) / range));
            }
          } else {
            // For Levels we haven't reached yet, still show some progress based on 
            // overall achievement toward the previous level target (up to 10%)
            const percentOfPrevious = (actualValue / prevTarget) * 100;
            progress = Math.min(10, Math.max(0, percentOfPrevious / 10));
          }
        }
      }
      
      metaProgresses.push({
        nivel: sortedMetas[i].nivel || `${i + 1}`,
        valor: targetValue,
        progress: Math.round(progress)
      });
    }
  }
  
  // Calculate overall progress based on completed levels and current progress
  let overallProgress = 0;
  const totalLevels = sortedMetas.length;
  
  if (totalLevels === 0) {
    overallProgress = 0;
  } else if (completedLevels === totalLevels) {
    overallProgress = 100; // All levels completed
  } else {
    // For the new approach, we'll find the first incomplete level
    const firstIncompleteLevelIndex = metaProgresses.findIndex(m => m.progress < 100);
    
    if (firstIncompleteLevelIndex === -1) {
      // All levels completed (shouldn't happen as we checked earlier)
      overallProgress = 100;
    } else {
      // We've completed all levels before this one
      const levelSegmentSize = 100 / totalLevels;
      
      // Calculate progress within the current segment
      const completedSegments = firstIncompleteLevelIndex;
      const completedProgress = completedSegments * levelSegmentSize;
      
      // Calculate progress within the current segment
      const currentLevelProgress = metaProgresses[firstIncompleteLevelIndex].progress;
      
      // Scale current level progress to stay within its segment
      // This ensures we don't cross the next level line unless the progress is 100%
      const currentSegmentProgress = (currentLevelProgress / 100) * levelSegmentSize;
      
      // Overall progress is the sum of completed segments plus current segment's contribution
      overallProgress = completedProgress + currentSegmentProgress;
    }
  }
  
  // For regular metrics (like faturamento), if Level I is close to completion (>80%),
  // make sure the overall progress reflects that better
  if (!isReversed && totalLevels > 0 && completedLevels === 0 && metaProgresses[0].progress > 80) {
    // If the first level is more than 80% complete, boost the overall progress
    // to reflect how close we are to the first milestone
    const newOverallProgress = Math.min(24, metaProgresses[0].progress / 4);
    overallProgress = Math.max(overallProgress, newOverallProgress);
  }
  
  // For reversed metrics (like despesa/inadimplencia), if we're close to Level I (>80%),
  // boost the progress to at least 20%
  if (isReversed && totalLevels > 0 && metaProgresses[0].progress > 80 && overallProgress < 20) {
    overallProgress = 20;
  }
  
  return {
    metaLevels: metaProgresses,
    overallProgress: Math.round(overallProgress)
  };
} 