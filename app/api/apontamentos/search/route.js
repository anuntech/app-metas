import { NextResponse } from 'next/server';
import { getApontamentosWithFiltersController } from '@/lib/Controllers/Apontamento.controller';

export async function GET(request) {
  try {
    // Get URL search params
    const { searchParams } = new URL(request.url);
    
    // Build filters object from search params
    const filters = {};
    
    if (searchParams.has('ano')) {
      const anoParam = searchParams.get('ano');
      filters.ano = parseInt(anoParam);
    }
    
    if (searchParams.has('mes')) {
      filters.mes = searchParams.get('mes');
    }
    
    if (searchParams.has('unidade')) {
      filters.unidade = searchParams.get('unidade');
    }
    
    if (searchParams.has('nivel')) {
      filters.nivel = searchParams.get('nivel');
    }
    
    if (searchParams.has('periodo')) {
      filters.periodo = searchParams.get('periodo');
    }
    
    if (searchParams.has('metaId')) {
      filters.metaId = searchParams.get('metaId');
    }
    
    const result = await getApontamentosWithFiltersController(filters);
    
    if (result.status === 200) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error('Error in GET /api/apontamentos/search:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 