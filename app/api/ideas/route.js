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

// GET /api/ideas - Get ideas for wall
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const db = await getDb();
    const ideasCollection = db.collection('ideas');

    // Check if we have any ideas in database
    const count = await ideasCollection.countDocuments();
    
    let ideas;
    if (count === 0) {
      // Use mock data if no real ideas yet
      ideas = mockIdeas.slice(offset, offset + limit);
    } else {
      // Get real ideas from database
      const docs = await ideasCollection
        .find({})
        .sort({ created_at: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      ideas = docs;
    }

    const formattedIdeas = ideas.map((idea) => ({
      id: idea.id,
      ideaSnippet: idea.idea_text.substring(0, 150) + (idea.idea_text.length > 150 ? '...' : ''),
      roastSnippet: idea.roast_text.substring(0, 80) + (idea.roast_text.length > 80 ? '...' : ''),
      createdAt: idea.created_at,
    }));

    return handleCORS(NextResponse.json({
      ideas: formattedIdeas,
      hasMore: ideas.length === limit,
    }));
  } catch (error) {
    console.error('Error in GET /api/ideas:', error);
    return handleCORS(NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    ));
  }
}
