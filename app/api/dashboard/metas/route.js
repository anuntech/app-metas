import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import Meta from '../../../../lib/models/Meta';

/**
 * GET /api/dashboard/metas
 * 
 * Retrieves all metas for a given month and year, grouped by unit.
 * Each unit will include all available meta levels.
 */
export async function GET(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = parseInt(searchParams.get('year'));
    
    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year parameters are required' },
        { status: 400 }
      );
    }
    
    // Query all metas for the given month and year
    const metas = await Meta.find({
      mes: month,
      ano: year,
    }).sort({ unidade: 1, nivel: 1 });
    
    // Group metas by unit
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
    
    return NextResponse.json(Object.values(groupedMetas));
    
  } catch (error) {
    console.error('Error fetching metas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metas data' },
      { status: 500 }
    );
  }
} 