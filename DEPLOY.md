# Deployment Guide for Netlify

## Quick Deploy Steps

1. **Push your code to GitHub** (if not already done)

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

3. **Configure Environment Variables in Netlify:**
   - Go to Site settings → Environment variables
   - Add these variables:
     ```
     GOOGLE_GEMINI_API_KEY=AIzaSyBWNQuItTpZnmK2pqkvg9F7LrBGhTj4ms4
     GEMINI_MODEL=gemini-2.5-flash
     NEXT_PUBLIC_BASE_URL=https://your-site.netlify.app
     CORS_ORIGINS=*
     ```
   - **Important:** Do NOT set `MONGO_URL` - the app will use in-memory storage

4. **Deploy:**
   - Netlify will automatically build and deploy
   - Build command: `npm run build`
   - Publish directory: `.next`

## Important Notes

- **MongoDB is optional** - The app works without it using in-memory storage
- **Data persistence:** Without MongoDB, data resets on each deployment
- **Function timeout:** Netlify free tier has 10s timeout, paid tier has 26s
- **Gemini API:** Make sure your API key is valid and has quota

## Troubleshooting

### 504 Gateway Timeout
- The Gemini API is taking too long
- Check your API key quota
- Consider upgrading Netlify plan for longer timeouts

### API Key Issues
- Verify the key is set in Netlify environment variables
- Check Google Cloud Console for API restrictions
- Ensure Gemini API is enabled

## Manual Deploy

If you prefer manual deployment:

```bash
npm run build
netlify deploy --prod
```
