# ⚠️ IMPORTANT: Which URL to Use?

## 🟢 LOCAL DEVELOPMENT (Working Now!)

Your local server is **running and fully tested**:

**URL:** http://localhost:3000

✅ All features working
✅ API endpoints functional  
✅ Gemini AI integration active
✅ In-memory storage working

**Use this for testing and development!**

---

## 🔴 NETLIFY DEPLOYMENT (Not Updated Yet)

Your Netlify site at `roastmyidea.netlify.app` is showing 404 errors because:

1. ❌ The new code hasn't been deployed yet
2. ❌ Environment variables aren't configured
3. ❌ Old API routes are still active

---

## 🚀 To Fix Netlify Deployment:

### Quick Steps:

1. **Set Environment Variables in Netlify:**
   - Go to: https://app.netlify.com → Your Site → Site settings → Environment variables
   - Add these:
     ```
     GOOGLE_GEMINI_API_KEY = AIzaSyBWNQuItTpZnmK2pqkvg9F7LrBGhTj4ms4
     GEMINI_MODEL = gemini-2.0-flash-exp
     CORS_ORIGINS = *
     ```
   - **Do NOT add MONGO_URL** (leave it blank)

2. **Push Your Code:**
   ```bash
   git add .
   git commit -m "Fix API routes and Gemini integration"
   git push origin main
   ```

3. **Wait for Deploy:**
   - Netlify will auto-deploy (2-3 minutes)
   - Check deploy logs for any errors

4. **Test:**
   - Visit your Netlify URL
   - Try submitting an idea

---

## 📝 Summary

- **For now:** Use http://localhost:3000 (it works!)
- **For production:** Follow the steps above to deploy to Netlify

See `NETLIFY_SETUP.md` for detailed deployment instructions.
