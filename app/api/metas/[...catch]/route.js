import { NextResponse } from 'next/server';

// This is a catch-all route to handle any paths under /api/metas/ that don't match other routes
export async function GET(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // If the user is trying to access a search-like path but with a typo
  if (path.includes('sear') || path.includes('serch') || path.includes('srch')) {
    return NextResponse.json({ 
      message: `Did you mean to use "/api/metas/search" instead of "${path}"?`,
      suggestedUrl: `${url.origin}/api/metas/search${url.search}`
    }, { status: 400 });
  }
  
  // Check if it looks like an attempted ID access
  const pathParts = path.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  
  if (lastPart && lastPart.length > 0) {
    return NextResponse.json({ 
      message: `Invalid route: ${path}. If you're trying to access a meta by ID, make sure the ID is a valid MongoDB ObjectId.`,
      availableRoutes: {
        getAllMetas: '/api/metas',
        getMetaById: '/api/metas/[id]',
        searchMetas: '/api/metas/search?ano=2023&mes=Janeiro&unidade=Caieiras&nivel=II'
      }
    }, { status: 404 });
  }
  
  return NextResponse.json({ 
    message: `Invalid route: ${path}`,
    availableRoutes: {
      getAllMetas: '/api/metas',
      getMetaById: '/api/metas/[id]',
      searchMetas: '/api/metas/search?ano=2023&mes=Janeiro&unidade=Caieiras&nivel=II'
    }
  }, { status: 404 });
}

// Handle other HTTP methods as well
export async function POST(request) {
  return NextResponse.json({ message: 'Method not allowed for this path' }, { status: 405 });
}

export async function PUT(request) {
  return NextResponse.json({ message: 'Method not allowed for this path' }, { status: 405 });
}

export async function DELETE(request) {
  return NextResponse.json({ message: 'Method not allowed for this path' }, { status: 405 });
} 