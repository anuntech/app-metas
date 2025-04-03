import { isValidObjectId } from 'mongoose';
import { Meta, Apontamento } from "../models";

/**
 * Get dashboard summary data for the given date range
 */
const getDashboardSummaryService = async (startDate, endDate, metaLevel) => {
  try {
    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { 
        status: 400, 
        message: 'Invalid date format. Please provide valid ISO date strings.' 
      };
    }
    
    // Get the month and year for meta lookup
    const month = start.getMonth();
    const year = start.getFullYear();
    
    // Month names for database lookup
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    // Create a more flexible date range query - find all apontamentos within the month
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    // Get all apontamentos within the month, not just the specific date range
    const apontamentosQuery = {
      dataInicio: { $gte: monthStart },
      dataFim: { $lte: monthEnd }
    };
    
    // Do not filter apontamentos by nivel - they don't have this field
    const apontamentos = await Apontamento.find(apontamentosQuery);
    
    // Get the meta data for the same month/year
    const metasQuery = {
      mes: months[month],
      ano: year
    };
    
    // Find the "Total" meta with the specified level
    if (metaLevel) {
      metasQuery.nivel = metaLevel;
      metasQuery.unidade = 'Total';
    }
    
    // Get the specific meta data record we need
    const totalMeta = await Meta.findOne(metasQuery);
    
    if (!totalMeta) {
      return {
        status: 404,
        message: `No meta found for Total with level ${metaLevel}`
      };
    }
    
    // Filter apontamentos by unit name only, not by nivel
    const totalApontamentos = apontamentos.filter(apt => apt.unidade === 'Total');
    
    // 2. Calculate aggregate values
    let totalFaturamento = 0;
    let totalDespesa = 0;
    let totalRecebimento = 0;
    let totalInadimplencia = 0;
    let totalFuncionarios = totalMeta.funcionarios || 0;
    
    if (totalApontamentos.length > 0) {
      // If we have Total apontamentos, use their sum
      totalApontamentos.forEach(apt => {
        totalFaturamento += apt.faturamento;
        totalDespesa += apt.despesa;
        totalRecebimento += apt.recebimento;
        totalInadimplencia += apt.inadimplenciaValor;
      });
    } else {
      // Otherwise, aggregate all units
      apontamentos.forEach(apt => {
        if (apt.unidade !== 'Total') {
          totalFaturamento += apt.faturamento;
          totalDespesa += apt.despesa;
          totalRecebimento += apt.recebimento;
          totalInadimplencia += apt.inadimplenciaValor;
        }
      });
    }
    
    // Calculate meta values from the specific meta we found
    const metaFaturamento = totalMeta.faturamento;
    const metaDespesaPercent = totalMeta.despesa;
    const metaInadimplenciaPercent = totalMeta.inadimplencia;
    const metaFaturamentoPorFuncionario = totalFuncionarios > 0 
      ? metaFaturamento / totalFuncionarios 
      : 0;
    
    // Calculate despesa as a percentage of faturamento
    const despesaPercent = totalFaturamento > 0 
      ? (totalDespesa / totalFaturamento) * 100 
      : 0;
    
    // Calculate inadimplencia as a percentage of faturamento
    const inadimplenciaPercent = totalFaturamento > 0 
      ? (totalInadimplencia / totalFaturamento) * 100 
      : 0;
    
    // Calculate faturamento por funcionario
    const faturamentoPorFuncionario = totalFuncionarios > 0 
      ? totalFaturamento / totalFuncionarios 
      : 0;
    
    // Calculate progress percentages
    const faturamentoProgress = metaFaturamento > 0 
      ? Math.min(100, (totalFaturamento / metaFaturamento) * 100) 
      : 0;
    
    const faturamentoPorFuncionarioProgress = metaFaturamentoPorFuncionario > 0 
      ? Math.min(100, (faturamentoPorFuncionario / metaFaturamentoPorFuncionario) * 100) 
      : 0;
    
    // For despesa and inadimplencia, we want to show progress as percentage of target reached
    // If we exceed the target (bad), we cap at 100%
    const despesaProgress = metaDespesaPercent > 0 
      ? Math.min(100, (despesaPercent / metaDespesaPercent) * 100)
      : 0;
    
    const inadimplenciaProgress = metaInadimplenciaPercent > 0 
      ? Math.min(100, (inadimplenciaPercent / metaInadimplenciaPercent) * 100)
      : 0;
    
    // Build summary data
    const summaryData = {
      faturamento: {
        atual: totalFaturamento,
        meta: metaFaturamento,
        restante: Math.max(0, metaFaturamento - totalFaturamento),
        progresso: Math.round(faturamentoProgress),
        nivel: totalMeta.nivel // Include the nivel in the response
      },
      faturamentoPorFuncionario: {
        atual: faturamentoPorFuncionario,
        meta: metaFaturamentoPorFuncionario,
        restante: Math.max(0, metaFaturamentoPorFuncionario - faturamentoPorFuncionario),
        progresso: Math.round(faturamentoPorFuncionarioProgress),
        nivel: totalMeta.nivel // Include the nivel in the response
      },
      despesa: {
        atual: Math.round(despesaPercent * 100) / 100, // Round to 2 decimal places
        meta: metaDespesaPercent,
        restante: despesaPercent - metaDespesaPercent,
        progresso: Math.round(despesaProgress),
        valorReais: totalDespesa,
        nivel: totalMeta.nivel // Include the nivel in the response
      },
      inadimplencia: {
        atual: Math.round(inadimplenciaPercent * 100) / 100, // Round to 2 decimal places
        meta: metaInadimplenciaPercent,
        restante: inadimplenciaPercent - metaInadimplenciaPercent,
        progresso: Math.round(inadimplenciaProgress),
        valorReais: totalInadimplencia,
        nivel: totalMeta.nivel // Include the nivel in the response
      },
      totalFuncionarios: totalFuncionarios
    };
    
    return { status: 200, data: summaryData };
  } catch (error) {
    console.error("Error getting dashboard summary:", error);
    return { status: 500, message: error.message };
  }
};

/**
 * Get unit-specific dashboard data for the given date range
 */
const getUnitsDashboardService = async (startDate, endDate, metaLevel) => {
  try {
    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { 
        status: 400, 
        message: 'Invalid date format. Please provide valid ISO date strings.' 
      };
    }
    
    // Get the month and year for meta lookup
    const month = start.getMonth();
    const year = start.getFullYear();
    
    // Month names for database lookup
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    // Create a more flexible date range query - find all apontamentos within the month
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    // Get all apontamentos within the month, not just the specific date range
    const apontamentosQuery = {
      dataInicio: { $gte: monthStart },
      dataFim: { $lte: monthEnd },
      unidade: { $ne: 'Total' } // Exclude the "Total" unit
    };
    
    // Do not filter apontamentos by nivel - they don't have this field
    const apontamentos = await Apontamento.find(apontamentosQuery);
    
    // Get the meta data for the same month/year
    const metasQuery = {
      mes: months[month],
      ano: year,
      unidade: { $ne: 'Total' } // Exclude the "Total" unit
    };
    
    // Filter metas by nivel if provided
    if (metaLevel) {
      metasQuery.nivel = metaLevel;
    }
    
    const metas = await Meta.find(metasQuery);
    
    // Get unique unit names from both collections
    const unitNames = [...new Set([
      ...apontamentos.map(apt => apt.unidade),
      ...metas.map(meta => meta.unidade)
    ])];
    
    // Build unit data
    const unitData = unitNames.map(unitName => {
      // Get all apontamentos for this unit (no nivel filtering)
      const unitApontamentos = apontamentos.filter(apt => apt.unidade === unitName);
      
      // Get the meta for this unit with the requested level
      const unitMeta = metas.find(meta => meta.unidade === unitName);
      
      // Skip units that don't have a meta for the requested level
      if (!unitMeta) {
        return null;
      }
      
      // Calculate aggregate values for this unit
      let unitFaturamento = 0;
      let unitDespesa = 0;
      let unitInadimplencia = 0;
      
      unitApontamentos.forEach(apt => {
        unitFaturamento += apt.faturamento;
        unitDespesa += apt.despesa;
        unitInadimplencia += apt.inadimplenciaValor;
      });
      
      // Meta values from the current level
      const metaFaturamento = unitMeta ? unitMeta.faturamento : 0;
      const metaDespesaPercent = unitMeta ? unitMeta.despesa : 0;
      const metaInadimplenciaPercent = unitMeta ? unitMeta.inadimplencia : 0;
      
      // Calculate percentages
      const despesaPercent = unitFaturamento > 0 
        ? (unitDespesa / unitFaturamento) * 100 
        : 0;
      
      const inadimplenciaPercent = unitFaturamento > 0 
        ? (unitInadimplencia / unitFaturamento) * 100 
        : 0;
      
      // Calculate progress
      const faturamentoProgress = metaFaturamento > 0 
        ? Math.min(100, (unitFaturamento / metaFaturamento) * 100) 
        : 0;
      
      // For despesa and inadimplencia, we want to show progress as percentage of target reached
      // If we exceed the target (bad), we cap at 100%
      const despesaProgress = metaDespesaPercent > 0 
        ? Math.min(100, (despesaPercent / metaDespesaPercent) * 100)
        : 0;
      
      const inadimplenciaProgress = metaInadimplenciaPercent > 0 
        ? Math.min(100, (inadimplenciaPercent / metaInadimplenciaPercent) * 100)
        : 0;
      
      // Return structured unit data
      return {
        nome: unitName,
        faturamento: {
          atual: unitFaturamento,
          meta: metaFaturamento,
          progresso: Math.round(faturamentoProgress)
        },
        despesa: {
          atual: Math.round(despesaPercent * 100) / 100,
          meta: metaDespesaPercent,
          progresso: Math.round(despesaProgress),
          valorReais: unitDespesa,
          isNegative: despesaPercent > metaDespesaPercent
        },
        inadimplencia: {
          atual: Math.round(inadimplenciaPercent * 100) / 100,
          meta: metaInadimplenciaPercent,
          progresso: Math.round(inadimplenciaProgress),
          valorReais: unitInadimplencia,
          isNegative: inadimplenciaPercent > metaInadimplenciaPercent
        }
      };
    });
    
    // Filter out null entries (units without metas for the current level)
    const filteredUnitData = unitData.filter(item => item !== null);
    
    // Define a specific order for units
    const unitOrder = ["Caieiras", "SP - Perus", "Francisco Morato", "Franco da Rocha", "Mairiporã"];
    
    // Sort units according to the custom order
    filteredUnitData.sort((a, b) => {
      const indexA = unitOrder.indexOf(a.nome);
      const indexB = unitOrder.indexOf(b.nome);
      
      // If both units are in the ordered list, sort by their order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one unit is in the ordered list, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Otherwise sort alphabetically
      return a.nome.localeCompare(b.nome);
    });
    
    return { status: 200, data: filteredUnitData };
  } catch (error) {
    console.error("Error getting units dashboard data:", error);
    return { status: 500, message: error.message };
  }
};

/**
 * Mark a Total meta as complete
 */
const completeTotalMetaService = async (metaLevel, month, year) => {
  try {
    // Find the "Total" meta for the given level, month, and year
    const meta = await Meta.findOne({
      unidade: "Total",
      nivel: metaLevel,
      mes: month,
      ano: Number(year)
    });
    
    if (!meta) {
      return { 
        status: 404, 
        message: `Total meta for level ${metaLevel} not found for ${month}/${year}` 
      };
    }
    
    // Set isComplete to true
    meta.isComplete = true;
    await meta.save();
    
    return { 
      status: 200,
      data: {
        message: `Total meta for level ${metaLevel} marked as complete`,
        nextLevel: getNextLevel(metaLevel)
      }
    };
  } catch (error) {
    console.error("Error completing Total meta:", error);
    return { status: 500, message: error.message };
  }
};

/**
 * Mark a unit meta as complete
 */
const completeUnitMetaService = async (unitName, metaLevel, month, year) => {
  try {
    // Find the unit meta for the given level, month, and year
    const meta = await Meta.findOne({
      unidade: unitName,
      nivel: metaLevel,
      mes: month,
      ano: Number(year)
    });
    
    if (!meta) {
      return { 
        status: 404, 
        message: `Meta for ${unitName} at level ${metaLevel} not found for ${month}/${year}` 
      };
    }
    
    // Set isComplete to true
    meta.isComplete = true;
    await meta.save();
    
    // Find the next meta for this unit
    const nextLevel = getNextLevel(metaLevel);
    const nextMeta = await Meta.findOne({
      unidade: unitName,
      nivel: nextLevel,
      mes: month,
      ano: Number(year)
    });
    
    return { 
      status: 200,
      data: {
        message: `Meta for ${unitName} at level ${metaLevel} marked as complete`,
        nextLevel,
        hasNextMeta: !!nextMeta
      }
    };
  } catch (error) {
    console.error(`Error completing meta for ${unitName}:`, error);
    return { status: 500, message: error.message };
  }
};

/**
 * Helper function to get the next level
 */
const getNextLevel = (currentLevel) => {
  const levels = ["I", "II", "III", "IV", "V", "VI"];
  const currentIndex = levels.indexOf(currentLevel);
  
  if (currentIndex === -1 || currentIndex === levels.length - 1) {
    return levels[0]; // Cycle back to level I if at the end or not found
  }
  
  return levels[currentIndex + 1];
};

/**
 * Get the highest incomplete meta level for each unit for a given month/year
 */
const getActiveMetaLevelsService = async (month, year) => {
  try {
    // Get all metas for the given month/year
    const metas = await Meta.find({ 
      mes: month, 
      ano: Number(year)
    });
    
    // Group by unit name
    const unitMetaMap = new Map();
    
    // Add all units to the map
    metas.forEach(meta => {
      if (!unitMetaMap.has(meta.unidade)) {
        unitMetaMap.set(meta.unidade, []);
      }
      unitMetaMap.get(meta.unidade).push(meta);
    });
    
    // Find the highest incomplete meta level for each unit
    const activeMetaLevels = {};
    const levels = ["I", "II", "III", "IV", "V", "VI"];
    
    unitMetaMap.forEach((unitMetas, unitName) => {
      // Sort metas by level (in order of our levels array)
      unitMetas.sort((a, b) => levels.indexOf(a.nivel) - levels.indexOf(b.nivel));
      
      // Find the first incomplete meta, or if all complete, get the highest level
      const activeMeta = unitMetas.find(meta => !meta.isComplete) || unitMetas[unitMetas.length - 1];
      
      activeMetaLevels[unitName] = activeMeta.nivel;
    });
    
    return { 
      status: 200, 
      data: activeMetaLevels 
    };
  } catch (error) {
    console.error("Error getting active meta levels:", error);
    return { status: 500, message: error.message };
  }
};

export {
  getDashboardSummaryService,
  getUnitsDashboardService,
  completeTotalMetaService,
  completeUnitMetaService,
  getActiveMetaLevelsService
}; 