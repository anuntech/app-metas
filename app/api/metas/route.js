import { NextResponse } from 'next/server';
import { getAllMetasController, addNewMetaController } from '@/lib/Controllers/Meta.controller';

export async function GET() {
  try {
    const result = await getAllMetasController();
    
    if (result.status === 200) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error('Error in GET /api/metas:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await addNewMetaController(body);
    
    if (result.status === 201) {
      return NextResponse.json({ id: result.message }, { status: 201 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error('Error in POST /api/metas:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 