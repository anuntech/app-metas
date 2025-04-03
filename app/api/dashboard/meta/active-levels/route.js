import { NextResponse } from 'next/server';
import { getActiveMetaLevelsController } from '@/lib/Controllers/Dashboard.controller';

export async function GET(request) {
  try {
    // Get URL search params
    const { searchParams } = new URL(request.url);
    
    // Get month and year parameters
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    // Validate parameters
    if (!month || !year) {
      return NextResponse.json({ 
        message: 'Both month and year parameters are required' 
      }, { status: 400 });
    }
    
    const result = await getActiveMetaLevelsController(month, year);
    
    if (result.status === 200) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error('Error in GET /api/dashboard/meta/active-levels:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 