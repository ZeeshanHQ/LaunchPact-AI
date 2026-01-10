# 🚨 Deployment Troubleshooting Guide - LaunchPact AI

## Critical Issues & Solutions

### ❌ Issue 1: "AI Model Not Working" / "API Key Error"

**Symptoms:**
- Hero section chat doesn't respond
- Blueprint generation fails
- Backend logs show "OPENROUTER_API_KEY is missing"
- Frontend shows "Connection error" or "AI service not configured"

**Root Cause:**
The `OPENROUTER_API_KEY` environment variable is not set in Render backend.

**Solution:**
1. Go to Render Dashboard → Your Service → Environment
2. Click "Add Environment Variable"
3. Add:
   - **Key:** `OPENROUTER_API_KEY`
   - **Value:** Your OpenRouter API key (get from https://openrouter.ai/keys)
4. Save and redeploy

**Verify Fix:**
- Check Render logs after redeploy
- Look for: `🔑 OpenRouter API Key: ✓ LOADED`
- Test endpoint: `https://your-backend.onrender.com/api/test-ai`

---

### ❌ Issue 2: "CORS Error" / "Network Request Failed"

**Symptoms:**
- Frontend can't connect to backend
- Browser console shows CORS errors
- Requests to `/api/*` fail with 404 or CORS headers missing

**Root Cause:**
Backend CORS configuration doesn't include your Vercel domain, OR Vercel rewrite not working.

**Solution A: Update Backend CORS (Render)**
1. Edit `server.js` CORS configuration (already done - includes vercel.app domains)
2. Redeploy backend on Render

**Solution B: Check Vercel Rewrite (Vercel)**
1. Verify `vercel.json` has correct rewrite rule:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://launchpact-ai.onrender.com/api/:path*"
    }
  ]
}
```
2. Ensure your Render backend URL is correct in vercel.json
3. Redeploy frontend on Vercel

**Verify Fix:**
- Open browser DevTools → Network tab
- Submit idea in hero section
- Check request goes to `/api/generate-blueprint` and succeeds (200 status)

---

### ❌ Issue 3: "Backend Not Receiving Requests"

**Symptoms:**
- Vercel frontend works, but backend logs show no incoming requests
- Frontend shows "Connection error"

**Root Cause:**
Vercel rewrite rule pointing to wrong URL or Render backend is down.

**Solution:**
1. Check Render backend is running:
   - Visit: `https://launchpact-ai.onrender.com/api/status`
   - Should return: `{"status":"online","apiKeyConfigured":true,...}`

2. Verify Render backend URL in vercel.json matches your actual Render URL

3. Check Render service is not in "sleep" mode (free tier spins down after inactivity)

4. If using free tier, first request may take 30-60 seconds (cold start)

**Verify Fix:**
- Test Render backend directly: `curl https://your-backend.onrender.com/api/status`
- Check Render logs show incoming requests

---

### ❌ Issue 4: "AI Models All Failed"

**Symptoms:**
- Backend logs show: `❌❌❌ ALL MODELS FAILED ❌❌❌`
- All 12+ AI models tried but none worked
- Request eventually returns error or rescue template

**Root Cause:**
- OpenRouter API key is invalid or expired
- OpenRouter service is down
- Network connectivity issues
- API key has no credits/quota left

**Solution:**
1. **Verify API Key:**
   - Go to https://openrouter.ai/keys
   - Ensure key is active and has credits
   - Generate new key if needed

2. **Test API Key Manually:**
   ```bash
   curl https://openrouter.ai/api/v1/chat/completions \
     -H "Authorization: Bearer YOUR_KEY_HERE" \
     -H "Content-Type: application/json" \
     -d '{"model":"openrouter/auto:free","messages":[{"role":"user","content":"Hello"}]}'
   ```

3. **Check OpenRouter Status:**
   - Visit: https://openrouter.ai/status
   - Ensure service is operational

4. **Update Render Environment Variable:**
   - Render Dashboard → Environment → Update `OPENROUTER_API_KEY`
   - Redeploy

**Verify Fix:**
- Check Render logs for successful model response
- Look for: `✅✅✅ SUCCESS! MODEL WORKED`

---

### ❌ Issue 5: "Response Timeout" / "Request Takes Too Long"

**Symptoms:**
- Hero section shows loading spinner indefinitely
- Request times out after 30+ seconds
- Backend logs show timeout errors

**Root Cause:**
- Render free tier cold start (30-60 seconds)
- AI model taking too long to respond
- Network latency

**Solution:**
1. **Upgrade Render Plan:**
   - Free tier has cold starts (spins down after inactivity)
   - Upgrade to Starter ($7/month) for always-on service

2. **Increase Frontend Timeout:**
   - Already configured: 50 second timeout per model
   - Frontend should wait up to 2 minutes for response

3. **Check Model Response Times:**
   - Some free models are slower
   - System automatically tries faster models first
   - First successful model wins

**Verify Fix:**
- First request after inactivity: 30-60s (normal for free tier)
- Subsequent requests: 5-15s (normal)
- If consistently >60s, check Render service health

---

## 🔍 Debugging Checklist

### Step 1: Check Backend Status
```bash
curl https://launchpact-ai.onrender.com/api/status
```
Expected: `{"status":"online","apiKeyConfigured":true}`

### Step 2: Test AI Endpoint
```bash
curl https://launchpact-ai.onrender.com/api/test-ai
```
Expected: `{"success":true,"message":"AI connection working!"}`

### Step 3: Check Render Logs
1. Go to Render Dashboard → Your Service → Logs
2. Look for:
   - ✅ `🔑 OpenRouter API Key: ✓ LOADED`
   - ✅ `🚀 LAUNCHPACT AI BACKEND SERVER ACTIVE`
   - ❌ `OPENROUTER_API_KEY is missing` → Fix: Add env var

### Step 4: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Functions/Logs
2. Look for API request logs
3. Check if requests are being proxied to Render

### Step 5: Test Full Flow
1. Open your Vercel frontend URL
2. Open Browser DevTools → Network tab
3. Type idea in hero section and submit
4. Check:
   - Request to `/api/generate-blueprint` appears
   - Status is 200 (success) or 500 (with rescue data)
   - Response contains blueprint JSON

---

## 📋 Environment Variables Checklist (Render)

Ensure these are set in Render Dashboard → Environment:

- ✅ `OPENROUTER_API_KEY` = `sk-or-v1-...` (REQUIRED)
- ✅ `RESEND_API_KEY` = `re_...` (Optional, for emails)
- ✅ `SENDER_EMAIL` = `noreply@yourdomain.com` (Optional)
- ✅ `VITE_SUPABASE_URL` = `https://xxx.supabase.co` (Required for auth)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...` (Required for auth)
- ✅ `VITE_APP_URL` = `https://launchpact-ai.vercel.app` (For CORS/links)

---

## 🎯 Quick Fixes

### Fix: "API Key Missing" Error
```bash
# In Render Dashboard → Environment → Add:
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

### Fix: "CORS Error"
- Already fixed in code (includes vercel.app domains)
- Just redeploy both frontend and backend

### Fix: "Backend Not Responding"
- Check Render service is running (not sleeping)
- Free tier: First request after inactivity = 30-60s wait
- Upgrade to Starter plan for always-on service

### Fix: "All Models Failed"
- Check OpenRouter API key is valid
- Test key manually with curl (see Issue 4)
- Ensure key has credits/quota
- Check OpenRouter status page

---

## 📞 Support Resources

- **OpenRouter Keys:** https://openrouter.ai/keys
- **OpenRouter Status:** https://openrouter.ai/status
- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Backend Logs:** Render Dashboard → Service → Logs
- **Frontend Logs:** Vercel Dashboard → Project → Functions/Logs

---

## ✅ Success Indicators

Your deployment is working correctly when:

1. ✅ Render backend status: `https://your-backend.onrender.com/api/status` returns `{"status":"online","apiKeyConfigured":true}`
2. ✅ Render logs show: `🔑 OpenRouter API Key: ✓ LOADED`
3. ✅ Vercel frontend loads without errors
4. ✅ Hero section accepts input and shows loading state
5. ✅ Blueprint generates successfully (or shows rescue template if AI fails)
6. ✅ Backend logs show detailed request/response flow with request IDs
7. ✅ No CORS errors in browser console
8. ✅ Network requests show 200 status (or 500 with rescue data)

---

**Last Updated:** $(date)
**Version:** 1.0
**Maintained By:** LaunchPact AI Team
