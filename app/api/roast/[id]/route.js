import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { mockIdeas } from '@/lib/mockData';

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

// GET /api/roast/:id - Get specific roast by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const db = await getDb();
    const ideasCollection = db.collection('ideas');

    let idea = await ideasCollection.findOne({ id });

    // If not in database, check mock data
    if (!idea) {
      idea = mockIdeas.find((i) => i.id === id);
    }

    if (!idea) {
      return handleCORS(NextResponse.json(
        { error: 'Roast not found' },
        { status: 404 }
      ));
    }

    // Increment view count
    if (idea && !idea.is_mock) {
      await ideasCollection.updateOne(
        { id },
        { $inc: { view_count: 1 } }
      );
    }

    return handleCORS(NextResponse.json({
      id: idea.id,
      idea: idea.idea_text,
      roast: idea.roast_text,
      problems: idea.problems,
      createdAt: idea.created_at,
    }));
  } catch (error) {
    console.error('Error in GET /api/roast/:id:', error);
    return handleCORS(NextResponse.json(
      { error: 'Failed to fetch roast' },
      { status: 500 }
    ));
  }
}
