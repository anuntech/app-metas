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
    
    // For each unit, sort meta levels by the faturamento value
    for (const unit in unitMetas) {
      unitMetas[unit].sort((a, b) => a.faturamento - b.faturamento);
    }
    
    // Create a more flexible date range query - find all apontamentos within the month
    const monthStart = new Date(year, start.getMonth(), 1);
    const monthEnd = new Date(year, start.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Get all apontamentos within the month
    const apontamentosQuery = {
      dataInicio: { $gte: monthStart },
      dataFim: { $lte: monthEnd }
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
    
    // Replace simulated data with actual apontamentos data
    const getActualPerformance = (unit) => {
      // Get the most recent apontamento for this unit
      const apontamento = latestApontamentosByUnit.get(unit);
      
      // If no apontamento found, return default values
      if (!apontamento) {
        return {
          faturamento: { atual: 0, valorReais: 0 },
          despesa: { atual: 0, valorReais: 0 },
          inadimplencia: { atual: 0, valorReais: 0 }
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
          // Calculate valorReais based on percentage if not provided
          valorReais: apontamento.inadimplenciaValor || (apontamento.faturamento * inadimplenciaPercent / 100)
        }
      };
    };
    
    // Prepare the response with progress data for each unit
    const progressData = {
      summary: {},
      units: []
    };
    
    // Calculate progress for Total (summary)
    if (unitMetas['Total']) {
      const totalMetas = unitMetas['Total'];
      const totalActual = getActualPerformance('Total');
      
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
      
      // Add debug logs for Total Faturamento
      console.log('=== FATURAMENTO TOTAL DEBUG INFO ===');
      
      // Log apontamento data
      console.log('APONTAMENTO:', {
        faturamento: totalActual.faturamento.atual.toLocaleString('pt-BR'),
        despesa: totalActual.despesa.atual.toFixed(2) + '%',
        inadimplencia: totalActual.inadimplencia.atual.toFixed(2) + '%'
      });
      
      // Log meta levels
      console.log('META LEVELS:');
      totalMetas.forEach(meta => {
        console.log(`Nivel ${meta.nivel}: Faturamento ${meta.faturamento.toLocaleString('pt-BR')}, Despesa ${meta.despesa}%, Inadimplencia ${meta.inadimplencia}%`);
      });
      
      // Log progress for each metric
      console.log('PROGRESS:');
      console.log('Faturamento:', {
        overallProgress: progressData.summary.faturamento.overallProgress + '%',
        metaLevels: progressData.summary.faturamento.metaLevels.map(m => ({ 
          nivel: m.nivel, 
          valor: m.valor.toLocaleString('pt-BR'), 
          progress: m.progress + '%' 
        }))
      });
      console.log('Despesa:', {
        overallProgress: progressData.summary.despesa.overallProgress + '%',
        metaLevels: progressData.summary.despesa.metaLevels.map(m => ({ 
          nivel: m.nivel, 
          valor: m.valor.toFixed(2) + '%', 
          progress: m.progress + '%' 
        }))
      });
      console.log('Inadimplencia:', {
        overallProgress: progressData.summary.inadimplencia.overallProgress + '%',
        metaLevels: progressData.summary.inadimplencia.metaLevels.map(m => ({ 
          nivel: m.nivel, 
          valor: m.valor.toFixed(2) + '%', 
          progress: m.progress + '%' 
        }))
      });
      console.log('=== END FATURAMENTO TOTAL DEBUG INFO ===');
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
      nivel: meta.nivel // Explicitly copy nivel to ensure it's defined
    };
  });
  
  // Add debug info for faturamentoPorFuncionario metas if Total unit
  if (unitName === 'Total') {
    console.log('=== FATURAMENTO POR FUNCIONARIO META LEVELS ===');
    faturamentoPorFuncionarioMetas.forEach(meta => {
      console.log(`Nivel ${meta.nivel}: Faturamento por funcionário ${meta.faturamentoPorFuncionario.toLocaleString('pt-BR')}`);
    });
    console.log('=== END FATURAMENTO POR FUNCIONARIO META LEVELS ===');
  }
  
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
  
  return {
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
    totalFuncionarios
  };
}

/**
 * Calculate progress for a specific metric across all meta levels
 * For metrics like despesa and inadimplencia, lower values are better (isReversed=true)
 */
function calculateMetricProgress(actualValue, metaList, metricName, isReversed) {
  // Debug info for Total (rather than Caieiras)
  const isDebugging = metricName && metaList.some(meta => meta.unidade === 'Total');
  
  if (isDebugging) {
    console.log(`\nCALCULATING PROGRESS FOR: ${metricName} (${isReversed ? 'reversed' : 'normal'})`);
    console.log(`Actual value: ${actualValue}`);
  }

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
  
  if (isDebugging) {
    console.log('Sorted meta levels:');
    sortedMetas.forEach(meta => {
      console.log(`  Level ${meta.nivel}: ${getMetricValue(meta)}`);
    });
  }
  
  // Get meta values in the right order
  const metaValues = sortedMetas.map(meta => getMetricValue(meta));
  
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
      
      if (isDebugging) {
        console.log(`\nLevel ${sortedMetas[i].nivel}:`);
        console.log(`  Target: ${targetValue}`);
        console.log(`  Completed: ${isCompleted}`);
      }
      
      // Calculate progress within this level
      let progress = 0;
      if (isCompleted) {
        progress = 100; // Level completed
        completedLevels++;
        
        if (isDebugging) {
          console.log(`  Progress: 100% (completed)`);
        }
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
          
          if (isDebugging) {
            console.log(`  First level calculation: using reference value ${referenceValue}`);
            console.log(`  Progress: Math.max(0, 100 - ((${actualValue} - ${targetValue}) / (${referenceValue} - ${targetValue})) * 100)`);
            console.log(`  Progress: ${progress.toFixed(2)}%`);
          }
        } else {
          // For higher levels, use previous level as reference
          const prevTarget = getMetricValue(sortedMetas[i - 1]);
          
          if (isDebugging) {
            console.log(`  Previous level target: ${prevTarget}`);
          }
          
          // Calculate progress from previous level to current
          if (actualValue < prevTarget) {
            // We're better than previous level
            const range = prevTarget - targetValue;
            if (range > 0) {
              progress = Math.max(0, 100 * (prevTarget - actualValue) / range);
              
              if (isDebugging) {
                console.log(`  Between levels calculation: 100 * (${prevTarget} - ${actualValue}) / ${range}`);
                console.log(`  Progress: ${progress.toFixed(2)}%`);
              }
            }
          } else {
            // We're worse than or equal to previous level
            // Calculate based on how close we are to previous level
            progress = Math.max(0, 100 - ((actualValue - prevTarget) / (prevTarget * 0.2)) * 100);
            progress = Math.min(progress, 20); // Cap at 20% if we're at or worse than previous level
            
            if (isDebugging) {
              console.log(`  Worse than previous: Math.max(0, 100 - ((${actualValue} - ${prevTarget}) / (${prevTarget * 0.2})) * 100)`);
              console.log(`  Progress: ${progress.toFixed(2)}% (capped at 20%)`);
            }
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
      
      if (isDebugging) {
        console.log(`\nLevel ${sortedMetas[i].nivel}:`);
        console.log(`  Target: ${targetValue}`);
        console.log(`  Completed: ${isCompleted}`);
      }
      
      // Calculate progress within this level
      let progress = 0;
      if (isCompleted) {
        progress = 100; // Level completed
        completedLevels++;
        
        if (isDebugging) {
          console.log(`  Progress: 100% (completed)`);
        }
      } else {
        // For uncompleted levels, calculate progress based on how close we are
        if (i === 0) {
          // First level - calculate progress from 0 to target
          progress = Math.min(99, Math.max(0, (actualValue / targetValue) * 100));
          
          if (isDebugging) {
            console.log(`  First level calculation: Math.min(99, Math.max(0, (${actualValue} / ${targetValue}) * 100))`);
            console.log(`  Progress: ${progress.toFixed(2)}%`);
          }
        } else {
          // Higher levels - calculate progress from previous level
          const prevTarget = getMetricValue(sortedMetas[i-1]);
          
          if (isDebugging) {
            console.log(`  Previous level target: ${prevTarget}`);
          }
          
          // Calculate progress only if we've met the previous level's target
          if (actualValue >= prevTarget) {
            // If we're between previous and current target
            const range = targetValue - prevTarget;
            if (range > 0) {
              progress = Math.min(99, Math.max(0, 100 * (actualValue - prevTarget) / range));
              
              if (isDebugging) {
                console.log(`  Between levels calculation: Math.min(99, Math.max(0, 100 * (${actualValue} - ${prevTarget}) / ${range}))`);
                console.log(`  Progress: ${progress.toFixed(2)}%`);
              }
            }
          } else {
            // For Levels we haven't reached yet, still show some progress based on 
            // overall achievement toward the previous level target (up to 10%)
            const percentOfPrevious = (actualValue / prevTarget) * 100;
            progress = Math.min(10, Math.max(0, percentOfPrevious / 10));
            
            if (isDebugging) {
              console.log(`  Progress toward previous level: ${percentOfPrevious.toFixed(2)}%`);
              console.log(`  Scaled progress: ${progress.toFixed(2)}% (capped at 10%)`);
            }
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
      
      if (isDebugging) {
        console.log(`\nNew overall progress calculation (first incomplete level):`);
        console.log(`  Total levels: ${totalLevels}`);
        console.log(`  First incomplete level index: ${firstIncompleteLevelIndex} (${sortedMetas[firstIncompleteLevelIndex].nivel})`);
        console.log(`  Level segment size: ${levelSegmentSize.toFixed(2)}%`);
        console.log(`  Completed segments: ${completedSegments}`);
        console.log(`  Completed progress: ${completedProgress.toFixed(2)}%`);
        console.log(`  Current level progress: ${currentLevelProgress}%`);
        console.log(`  Current segment progress: ${currentSegmentProgress.toFixed(2)}%`);
        console.log(`  New overall progress: ${overallProgress.toFixed(2)}%`);
      }
    }
  }
  
  // For regular metrics (like faturamento), if Level I is close to completion (>80%),
  // make sure the overall progress reflects that better
  if (!isReversed && totalLevels > 0 && completedLevels === 0 && metaProgresses[0].progress > 80) {
    // If the first level is more than 80% complete, boost the overall progress
    // to reflect how close we are to the first milestone
    const newOverallProgress = Math.min(24, metaProgresses[0].progress / 4);
    
    if (isDebugging && newOverallProgress > overallProgress) {
      console.log(`\nNormal metric boost for high Level I progress:`);
      console.log(`  Level I progress: ${metaProgresses[0].progress}%`);
      console.log(`  Boosting overall from ${overallProgress.toFixed(2)}% to ${newOverallProgress.toFixed(2)}%`);
    }
    
    overallProgress = Math.max(overallProgress, newOverallProgress);
  }
  
  // For reversed metrics (like despesa/inadimplencia), if we're close to Level I (>80%),
  // boost the progress to at least 20%
  if (isReversed && totalLevels > 0 && metaProgresses[0].progress > 80 && overallProgress < 20) {
    const newOverallProgress = 20;
    
    if (isDebugging) {
      console.log(`\nReversed metric boost for high Level I progress:`);
      console.log(`  Level I progress: ${metaProgresses[0].progress}%`);
      console.log(`  Boosting overall from ${overallProgress.toFixed(2)}% to ${newOverallProgress}%`);
    }
    
    overallProgress = newOverallProgress;
  }
  
  if (isDebugging) {
    console.log('\nFinal progress results:');
    metaProgresses.forEach(meta => {
      console.log(`  Level ${meta.nivel}: ${meta.progress}%`);
    });
    console.log(`  Overall progress: ${Math.round(overallProgress)}%`);
  }
  
  return {
    metaLevels: metaProgresses,
    overallProgress: Math.round(overallProgress)
  };
} 