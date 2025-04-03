import { NextResponse } from 'next/server';
import { completeUnitMetaController } from '@/lib/Controllers/Dashboard.controller';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { unitName, metaLevel, month, year } = body;
    
    // Validate required parameters
    if (!unitName || !metaLevel || !month || !year) {
      return NextResponse.json({ 
        message: 'unitName, metaLevel, month, and year are required parameters'
      }, { status: 400 });
    }
    
    // Call controller to mark unit meta as complete
    const result = await completeUnitMetaController(unitName, metaLevel, month, year);
    
    if (result.status === 200) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error('Error in POST /api/dashboard/meta/complete-unit:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 