import { NextResponse } from 'next/server';
import { completeTotalMetaController } from '@/lib/Controllers/Dashboard.controller';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { metaLevel, month, year } = body;
    
    // Validate required parameters
    if (!metaLevel || !month || !year) {
      return NextResponse.json({ 
        message: 'metaLevel, month, and year are required parameters'
      }, { status: 400 });
    }
    
    // Call controller to mark meta as complete
    const result = await completeTotalMetaController(metaLevel, month, year);
    
    if (result.status === 200) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error('Error in POST /api/dashboard/meta/complete-total:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 