import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateRoast } from '@/lib/gemini';
import { v4 as uuidv4 } from 'uuid';
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

// Rate limiting map (in-memory for MVP)
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 3;

function checkRateLimit(ip) {
  const now = Date.now();
  const userLimit = rateLimits.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > userLimit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS) {
    return false;
  }

  rateLimits.set(ip, { count: userLimit.count + 1, resetTime: userLimit.resetTime });
  return true;
}

// POST /api/roast - Submit idea and get roast
async function handleRoastPost(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return handleCORS(NextResponse.json(
        { error: "Easy tiger! You've submitted 3 ideas already. Come back in an hour." },
        { status: 429 }
      ));
    }

    const body = await request.json();
    const { idea } = body;

    // Validation
    if (!idea || typeof idea !== 'string') {
      return handleCORS(NextResponse.json(
        { error: "Hold up - you gotta give us an idea to roast!" },
        { status: 400 }
      ));
    }

    const trimmedIdea = idea.trim();

    if (trimmedIdea.length < 50) {
      return handleCORS(NextResponse.json(
        { error: "That's not an idea, that's a tweet. Give us more details!" },
        { status: 400 }
      ));
    }

    if (trimmedIdea.length > 2000) {
      return handleCORS(NextResponse.json(
        { error: "Whoa there - keep it under 2000 characters. We're roasting, not reading a novel." },
        { status: 400 }
      ));
    }

    // Generate roast using Gemini
    let roastData;
    try {
      roastData = await generateRoast(trimmedIdea);
    } catch (error) {
      console.error('Gemini API error:', error);
      return handleCORS(NextResponse.json(
        { error: "Oops! Our AI is taking a break. Try again in a moment." },
        { status: 500 }
      ));
    }

    // Save to database
    const db = await getDb();
    const ideasCollection = db.collection('ideas');

    const ideaDoc = {
      id: uuidv4(),
      idea_text: trimmedIdea,
      roast_text: roastData.roast,
      problems: roastData.problems,
      created_at: new Date(),
      is_mock: false,
      view_count: 0,
      share_count: 0,
    };

    await ideasCollection.insertOne(ideaDoc);

    return handleCORS(NextResponse.json({
      id: ideaDoc.id,
      idea: ideaDoc.idea_text,
      roast: ideaDoc.roast_text,
      problems: ideaDoc.problems,
      createdAt: ideaDoc.created_at,
    }));
  } catch (error) {
    console.error('Error in handleRoastPost:', error);
    return handleCORS(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}

// GET /api/ideas - Get ideas for wall
async function handleGetIdeas(request) {
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
    console.error('Error in handleGetIdeas:', error);
    return handleCORS(NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    ));
  }
}

// GET /api/roast/:id - Get specific roast by ID
async function handleGetRoastById(request, id) {
  try {
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
    console.error('Error in handleGetRoastById:', error);
    return handleCORS(NextResponse.json(
      { error: 'Failed to fetch roast' },
      { status: 500 }
    ));
  }
}

// Main GET handler
async function handleGET(request, { params }) {
  const { path = [] } = params;
  const route = `/${path.join('/')}`;
  
  if (route === '/' || route === '/ideas') {
    return handleGetIdeas(request);
  }
  
  if (path[0] === 'roast' && path[1]) {
    return handleGetRoastById(request, path[1]);
  }

  return handleCORS(NextResponse.json({ error: 'Not found' }, { status: 404 }));
}

// Main POST handler
async function handlePOST(request, { params }) {
  const { path = [] } = params;
  const route = `/${path.join('/')}`;
  
  if (route === '/' || route === '/roast') {
    return handleRoastPost(request);
  }

  return handleCORS(NextResponse.json({ error: 'Not found' }, { status: 404 }));
}

// Export all HTTP methods
export const GET = handleGET;
export const POST = handlePOST;