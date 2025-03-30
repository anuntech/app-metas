import { NextResponse } from 'next/server';
import { getUnitsDashboardController } from '@/lib/Controllers/Dashboard.controller';

export async function GET(request) {
  try {
    // Get URL search params
    const { searchParams } = new URL(request.url);
    
    // Get date range parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return NextResponse.json({ 
        message: 'Both startDate and endDate parameters are required' 
      }, { status: 400 });
    }
    
    const result = await getUnitsDashboardController(startDate, endDate);
    
    if (result.status === 200) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error('Error in GET /api/dashboard/units:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 