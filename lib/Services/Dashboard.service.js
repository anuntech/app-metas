import { isValidObjectId } from 'mongoose';
import Meta from '../models/Meta';
import Apontamento from '../models/Apontamento';

/**
 * Get dashboard summary data for the given date range
 */
const getDashboardSummaryService = async (startDate, endDate) => {
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
    
    // Get all apontamentos within the date range
    const apontamentosQuery = {
      dataInicio: { $gte: start },
      dataFim: { $lte: end }
    };
    
    const apontamentos = await Apontamento.find(apontamentosQuery);
    
    // Get the meta data for the same month/year
    const metasQuery = {
      mes: months[month],
      ano: year
    };
    
    const metas = await Meta.find(metasQuery);
    
    // Calculate summary data
    
    // 1. Find the "Total" meta and apontamentos
    const totalMeta = metas.find(meta => meta.unidade === 'Total');
    const totalApontamentos = apontamentos.filter(apt => apt.unidade === 'Total');
    
    // 2. Calculate aggregate values
    let totalFaturamento = 0;
    let totalDespesa = 0;
    let totalRecebimento = 0;
    let totalInadimplencia = 0;
    let totalFuncionarios = 0;
    
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
    
    // Get funcionarios count from meta
    if (totalMeta) {
      totalFuncionarios = totalMeta.funcionarios;
    } else {
      // Try to sum from individual unit metas
      metas.forEach(meta => {
        if (meta.unidade !== 'Total') {
          totalFuncionarios += meta.funcionarios;
        }
      });
    }
    
    // Calculate meta values
    const metaFaturamento = totalMeta ? totalMeta.faturamento : 0;
    const metaDespesaPercent = totalMeta ? totalMeta.despesa : 0;
    const metaInadimplenciaPercent = totalMeta ? totalMeta.inadimplencia : 0;
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
        progresso: Math.round(faturamentoProgress)
      },
      faturamentoPorFuncionario: {
        atual: faturamentoPorFuncionario,
        meta: metaFaturamentoPorFuncionario,
        restante: Math.max(0, metaFaturamentoPorFuncionario - faturamentoPorFuncionario),
        progresso: Math.round(faturamentoPorFuncionarioProgress)
      },
      despesa: {
        atual: Math.round(despesaPercent * 100) / 100, // Round to 2 decimal places
        meta: metaDespesaPercent,
        restante: despesaPercent - metaDespesaPercent,
        progresso: Math.round(despesaProgress),
        valorReais: totalDespesa
      },
      inadimplencia: {
        atual: Math.round(inadimplenciaPercent * 100) / 100, // Round to 2 decimal places
        meta: metaInadimplenciaPercent,
        restante: inadimplenciaPercent - metaInadimplenciaPercent,
        progresso: Math.round(inadimplenciaProgress),
        valorReais: totalInadimplencia
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
const getUnitsDashboardService = async (startDate, endDate) => {
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
    
    // Get all apontamentos within the date range
    const apontamentosQuery = {
      dataInicio: { $gte: start },
      dataFim: { $lte: end },
      unidade: { $ne: 'Total' } // Exclude the "Total" unit
    };
    
    const apontamentos = await Apontamento.find(apontamentosQuery);
    
    // Get the meta data for the same month/year
    const metasQuery = {
      mes: months[month],
      ano: year,
      unidade: { $ne: 'Total' } // Exclude the "Total" unit
    };
    
    const metas = await Meta.find(metasQuery);
    
    // Get unique unit names from both collections
    const unitNames = [...new Set([
      ...apontamentos.map(apt => apt.unidade),
      ...metas.map(meta => meta.unidade)
    ])];
    
    // Build unit data
    const unitData = unitNames.map(unitName => {
      // Get all apontamentos for this unit
      const unitApontamentos = apontamentos.filter(apt => apt.unidade === unitName);
      
      // Get the meta for this unit
      const unitMeta = metas.find(meta => meta.unidade === unitName);
      
      // Calculate aggregate values for this unit
      let unitFaturamento = 0;
      let unitDespesa = 0;
      let unitInadimplencia = 0;
      
      unitApontamentos.forEach(apt => {
        unitFaturamento += apt.faturamento;
        unitDespesa += apt.despesa;
        unitInadimplencia += apt.inadimplenciaValor;
      });
      
      // Meta values
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
    
    return { status: 200, data: unitData };
  } catch (error) {
    console.error("Error getting units dashboard data:", error);
    return { status: 500, message: error.message };
  }
};

export {
  getDashboardSummaryService,
  getUnitsDashboardService
}; 