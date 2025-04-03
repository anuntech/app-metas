import { Meta } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const unitName = url.searchParams.get('unitName');
    const metaLevel = url.searchParams.get('metaLevel');
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');
    
    // Validate required parameters
    if (!unitName || !metaLevel || !month || !year) {
      return NextResponse.json(
        { error: 'Missing required parameters: unitName, metaLevel, month, year' }, 
        { status: 400 }
      );
    }
    
    // Query the database to check if a meta exists
    const meta = await Meta.findOne({
      unidade: unitName,
      nivel: metaLevel,
      mes: month,
      ano: Number(year)
    });
    
    // Return result
    return NextResponse.json({
      exists: !!meta,
      message: meta ? `Meta for ${unitName} at level ${metaLevel} exists` : `No meta for ${unitName} at level ${metaLevel}`
    });
    
  } catch (error) {
    console.error('Error checking if meta exists:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 