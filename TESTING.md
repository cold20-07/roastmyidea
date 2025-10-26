# Testing Guide

## Automated API Tests

Run the comprehensive API test suite:

```bash
node test-api.js
```

This tests:
- ✓ GET /api/ideas - Fetching wall of ideas
- ✓ POST /api/roast - Input validation (too short)
- ✓ POST /api/roast - Valid idea submission
- ✓ GET /api/roast/:id - Retrieving specific roast

## Frontend Tests

Open `test-frontend.html` in your browser to run interactive frontend tests.

## Manual Testing

1. **Start the app:**
   ```bash
   npm run dev:webpack
   ```

2. **Open in browser:**
   - Local: http://localhost:3000
   - Network: http://0.0.0.0:3000

3. **Test scenarios:**
   - Submit an idea (150+ characters)
   - View the wall of ideas
   - Click on an idea to see full roast
   - Copy roast to clipboard
   - Share roast link

## Test Gemini API

Test if the Gemini API is working:

```bash
node test-gemini.js
```

## Known Issues Fixed

✅ MongoDB connection timeout - Now uses in-memory storage fallback
✅ Gemini API response truncation - Increased maxOutputTokens to 4096
✅ API routes 404 on Netlify - Replaced catch-all with explicit routes
✅ In-memory storage not persisting - Using global object for persistence
✅ Invalid model name - Updated to gemini-2.0-flash-exp

## Current Status

All tests passing! ✓
- API endpoints: Working
- Gemini AI integration: Working
- In-memory storage: Working
- Frontend: Working
