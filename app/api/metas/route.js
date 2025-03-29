import { NextResponse } from 'next/server';
import { getAllMetasController, addNewMetaController } from '@/lib/Controllers/Meta.controller';

// Handle requests to the base endpoint
export async function GET(request) {
  try {
    // Check if the user might be trying to use search with a typo in the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const lastPathPart = pathParts[pathParts.length - 1];
    
    // If the path looks like a mistyped "search"
    if (lastPathPart.includes('sear') || lastPathPart.includes('serch') || lastPathPart.includes('srch')) {
      return NextResponse.json({ 
        message: `Did you mean to use "/api/metas/search" instead of "${url.pathname}"?`,
        suggestedUrl: `${url.origin}/api/metas/search${url.search}`
      }, { status: 400 });
    }
    
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