import { NextResponse } from 'next/server';
import { 
  getMetaByIdController, 
  updateMetaController, 
  deleteMetaController 
} from '@/lib/Controllers/Meta.controller';

export async function GET(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ message: 'Meta ID is required' }, { status: 400 });
    }
    
    const result = await getMetaByIdController(id);
    
    if (result.status === 200) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error(`Error in GET /api/metas/${context.params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ message: 'Meta ID is required' }, { status: 400 });
    }
    
    const updatedData = await request.json();
    const result = await updateMetaController(id, updatedData);
    
    if (result.status === 200) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error(`Error in PUT /api/metas/${context.params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ message: 'Meta ID is required' }, { status: 400 });
    }
    
    const result = await deleteMetaController(id);
    
    if (result.status === 200) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
  } catch (error) {
    console.error(`Error in DELETE /api/metas/${context.params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 