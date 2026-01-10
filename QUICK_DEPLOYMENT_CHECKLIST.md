# ⚡ Quick Deployment Checklist

## 🔑 CRITICAL: Set API Key in Render (REQUIRED)

1. Go to **Render Dashboard** → Your Backend Service → **Environment**
2. Click **"Add Environment Variable"**
3. Add:
   - **Key:** `OPENROUTER_API_KEY`
   - **Value:** Your key from https://openrouter.ai/keys
4. Click **Save**
5. **Redeploy** your service

**✅ Verify:** Check Render logs for `🔑 OpenRouter API Key: ✓ LOADED`

---

## 📋 Pre-Deployment Checklist

- [ ] `OPENROUTER_API_KEY` is set in Render environment variables
- [ ] Render backend is deployed and running
- [ ] Vercel frontend is deployed
- [ ] `vercel.json` has correct Render backend URL
- [ ] Backend CORS includes your Vercel domain (already done in code)

---

## 🧪 Quick Test Commands

### Test Backend (Run in terminal):
```bash
# 1. Check if backend is online
curl https://launchpact-ai.onrender.com/api/status

# 2. Test AI connection
curl https://launchpact-ai.onrender.com/api/test-ai
```

**Expected Response:**
```json
{
  "status": "online",
  "apiKeyConfigured": true,
  "primaryModel": "openrouter/auto:free"
}
```

---

## 🌐 Frontend Test

1. Open your Vercel URL: `https://launchpact-ai.vercel.app`
2. Open Browser DevTools (F12) → **Console** tab
3. Type idea in hero section: `"AI task manager"`
4. Click **Forge** button
5. **Check Console:** Should see logs like:
   ```
   🚀 [TIMESTAMP] [FRONTEND-XXXXX] BLUEPRINT GENERATION STARTED
   📤 Sending POST request to backend...
   ✅ Blueprint generated successfully!
   ```

6. **Check Network Tab:** 
   - Request to `/api/generate-blueprint`
   - Status: **200** (success) or **500** (with rescue data)

---

## 🔍 Check Render Logs

1. Go to **Render Dashboard** → Your Service → **Logs**
2. Look for:
   ```
   ✅ [TIMESTAMP] [BLUEPRINT-XXXXX] SUCCESS: BLUEPRINT FORGED
   ✅✅✅ SUCCESS! MODEL WORKED: model-name ✅✅✅
   ```

**If you see:**
- ❌ `OPENROUTER_API_KEY is missing` → Set API key in environment variables
- ❌ `ALL MODELS FAILED` → Check API key is valid at openrouter.ai
- ✅ `SUCCESS! MODEL WORKED` → Everything is working! 🎉

---

## 🚨 If Something's Not Working

### API Key Error?
→ **Fix:** Add `OPENROUTER_API_KEY` in Render Dashboard → Environment

### CORS Error?
→ **Fix:** Already fixed in code. Just redeploy both frontend and backend.

### Backend Not Responding?
→ **Fix:** 
- Check Render service is running (not sleeping)
- Free tier: Wait 30-60 seconds for first request (cold start)
- Upgrade to Starter plan ($7/month) for always-on service

### All Models Failed?
→ **Fix:**
- Verify API key at https://openrouter.ai/keys
- Ensure key has credits/quota
- Test key manually (see DEPLOYMENT_TROUBLESHOOTING.md)

---

## 📞 Quick Links

- **OpenRouter Keys:** https://openrouter.ai/keys
- **OpenRouter Status:** https://openrouter.ai/status  
- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## ✅ Success Indicators

You're good to go when:
- ✅ Backend `/api/status` returns `apiKeyConfigured: true`
- ✅ Hero section accepts input and generates blueprint
- ✅ Render logs show successful AI model responses
- ✅ No CORS errors in browser console
- ✅ Frontend and backend logs have matching request IDs

---

**Need more help?** See `DEPLOYMENT_TROUBLESHOOTING.md` for detailed solutions.
