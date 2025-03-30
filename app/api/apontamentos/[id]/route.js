import { NextResponse } from 'next/server';
import { 
  getApontamentoByIdController, 
  updateApontamentoController, 
  deleteApontamentoController 
} from '@/lib/Controllers/Apontamento.controller';

export async function GET(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ message: 'Apontamento ID is required' }, { status: 400 });
    }
    
    const result = await getApontamentoByIdController(id);
    
    if (result.status === 200) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error(`Error in GET /api/apontamentos/${context.params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ message: 'Apontamento ID is required' }, { status: 400 });
    }
    
    const updatedData = await request.json();
    const result = await updateApontamentoController(id, updatedData);
    
    if (result.status === 200) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error(`Error in PUT /api/apontamentos/${context.params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ message: 'Apontamento ID is required' }, { status: 400 });
    }
    
    const result = await deleteApontamentoController(id);
    
    if (result.status === 200) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error(`Error in DELETE /api/apontamentos/${context.params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 