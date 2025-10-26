#!/bin/bash

echo "🚀 Deploying RoastMyIdea to Netlify"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not initialized"
    echo "Run: git init"
    exit 1
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Fix API routes, add in-memory storage, update Gemini model"

# Push
echo "⬆️  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "⚠️  NEXT STEPS:"
echo "1. Go to Netlify dashboard: https://app.netlify.com"
echo "2. Navigate to: Site settings → Environment variables"
echo "3. Add these variables:"
echo "   - GOOGLE_GEMINI_API_KEY = AIzaSyBWNQuItTpZnmK2pqkvg9F7LrBGhTj4ms4"
echo "   - GEMINI_MODEL = gemini-2.0-flash-exp"
echo "   - CORS_ORIGINS = *"
echo "4. Wait for auto-deploy to complete (2-3 minutes)"
echo "5. Test your site!"
echo ""
