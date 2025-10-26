# Deployment Guide

## Environment Variables Required

Set these in Netlify Dashboard (Site settings → Environment variables):

1. `GOOGLE_GEMINI_API_KEY` - Your Google Gemini API key
2. `GEMINI_MODEL` - Model name (e.g., gemini-2.0-flash-exp)
3. `CORS_ORIGINS` - Set to `*` for all origins
4. `NEXT_PUBLIC_BASE_URL` - Your Netlify site URL

**Do NOT set:** `MONGO_URL` (app uses in-memory storage)

## Deployment Steps

1. Set environment variables in Netlify dashboard
2. Push code to GitHub
3. Netlify auto-deploys
4. Wait 2-3 minutes for build to complete

## Troubleshooting

- Check build logs in Netlify dashboard
- Verify all environment variables are set correctly
- Clear deploy cache if needed

## Local Development

```bash
npm install
npm run dev:webpack
```

Access at: http://localhost:3000
