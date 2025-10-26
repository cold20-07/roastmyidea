# Netlify Deployment Setup

## Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Fix API routes and add in-memory storage fallback"
git push origin main
```

## Step 2: Configure Environment Variables in Netlify

Go to your Netlify dashboard:
1. Navigate to: **Site settings → Environment variables**
2. Click **Add a variable**
3. Add these variables:

```
GOOGLE_GEMINI_API_KEY = AIzaSyBWNQuItTpZnmK2pqkvg9F7LrBGhTj4ms4
GEMINI_MODEL = gemini-2.0-flash-exp
NEXT_PUBLIC_BASE_URL = https://roastmyidea.netlify.app
CORS_ORIGINS = *
```

**IMPORTANT:** Do NOT add `MONGO_URL` - leave it blank so the app uses in-memory storage.

## Step 3: Trigger Redeploy

After adding environment variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy → Deploy site**
3. Wait 2-3 minutes for build to complete

## Step 4: Test Your Deployment

Once deployed, test at: https://roastmyidea.netlify.app

The app should now work without 404 errors!

## Troubleshooting

### Still getting 404?
- Check that the build completed successfully
- Verify environment variables are set correctly
- Check build logs for errors

### 500 Internal Server Error?
- Check function logs in Netlify dashboard
- Verify GEMINI_MODEL is set to `gemini-2.0-flash-exp`
- Check that GOOGLE_GEMINI_API_KEY is valid

### Build fails?
- Make sure you're using Node.js 18 or higher
- Check that all dependencies are in package.json
