# ⚡ QUICK FIX: OpenRouter API Key Error

## 🎯 The Problem
Render logs showing: **"Check your OpenRouter API key"** or **"OPENROUTER_API_KEY MISSING"**

## ✅ The Solution (3 Steps)

### Step 1: Get Your Key
1. Visit: **https://openrouter.ai/keys**
2. Sign in (or create free account)
3. Click **"Create Key"** 
4. Copy the key (looks like: `sk-or-v1-...`)

### Step 2: Add to Render
1. Go to: **Render Dashboard** → Your Backend Service
2. Click **"Environment"** (left sidebar)
3. Scroll to **"Environment Variables"**
4. Click **"Add Environment Variable"**
5. Enter:
   ```
   Key:   OPENROUTER_API_KEY
   Value: sk-or-v1-paste-your-key-here
   ```
6. Click **"Save Changes"**
7. **Wait 1-2 minutes** for redeploy

### Step 3: Verify
Check Render Logs - You should see:
```
✅ 🔑 OpenRouter API Key: ✓ LOADED
```

---

## 📸 Visual Guide

**Where to Add the Key in Render:**

```
Render Dashboard
  └─ Your Backend Service
      └─ Environment (left sidebar)
          └─ Environment Variables
              └─ Add Environment Variable
                  ├─ Key: OPENROUTER_API_KEY
                  └─ Value: sk-or-v1-xxxxxxxxxxxx...
```

---

## ❌ Common Mistakes

### ❌ Mistake 1: Adding to Local .env File
- **Wrong:** Adding key to `.env` file in your project
- **Right:** Add to Render Dashboard → Environment Variables
- **Why:** Local .env only works on your computer, not on Render servers

### ❌ Mistake 2: Wrong Name
- **Wrong:** `OpenRouter_API_Key` or `OPENROUTER-API-KEY` or `api_key`
- **Right:** `OPENROUTER_API_KEY` (exact, all caps, underscores)
- **Why:** Code looks for exact name: `OPENROUTER_API_KEY`

### ❌ Mistake 3: Adding Quotes
- **Wrong:** Value = `"sk-or-v1-xxx"`
- **Right:** Value = `sk-or-v1-xxx` (no quotes)
- **Why:** Render adds quotes automatically if needed

### ❌ Mistake 4: Not Waiting for Redeploy
- **Wrong:** Adding key and immediately testing
- **Right:** Wait 1-2 minutes after saving, check deployment status
- **Why:** Render needs to restart with new environment variables

---

## 🔍 How to Check If It's Working

### Method 1: Check Render Logs
After redeploy, look for:
```
🔑 OpenRouter API Key: ✓ LOADED (sk-or-v1...xxxx)
```

### Method 2: Test Endpoint
Run in terminal:
```bash
curl https://launchpact-ai.onrender.com/api/status
```

Look for:
```json
{
  "apiKeyConfigured": true,  ← Should be "true"
  "status": "online"
}
```

### Method 3: Test Hero Section
1. Open your Vercel frontend
2. Type idea in hero section
3. Submit
4. Check Render logs - should see:
```
✅✅✅ SUCCESS! MODEL WORKED: model-name ✅✅✅
```

---

## 🚨 If Still Not Working

### Check 1: Is the Key Valid?
- Go to https://openrouter.ai/keys
- Verify key is active (not deleted/expired)
- Check if account has credits

### Check 2: Is It Set Correctly in Render?
- Go to Render Dashboard → Environment
- Look for `OPENROUTER_API_KEY` in the list
- Click on it - does the value match your key?
- Make sure there are no extra spaces

### Check 3: Did You Redeploy?
- After adding/updating environment variable, Render auto-redeploys
- Check "Events" or "Logs" tab - should show recent deployment
- Wait until deployment is complete (status: "Live")

### Check 4: Are You Testing the Right Service?
- Make sure you added the key to your **BACKEND** service (the one running `server.js`)
- NOT the frontend service (if you have one)

---

## ✅ Success Checklist

Your API key is working when:

- [ ] Key is added in Render Dashboard → Environment → Environment Variables
- [ ] Key name is exactly: `OPENROUTER_API_KEY`
- [ ] Key value starts with: `sk-or-v1-`
- [ ] Render shows "Live" status after redeploy
- [ ] Render logs show: `🔑 OpenRouter API Key: ✓ LOADED`
- [ ] `/api/status` endpoint returns: `"apiKeyConfigured": true`
- [ ] Hero section generates blueprints successfully

---

## 🆘 Still Having Issues?

If you've tried everything and still getting errors:

1. **Check the exact error message** in Render logs
2. **Verify your OpenRouter account** has credits at https://openrouter.ai/keys
3. **Try creating a NEW key** and using that one
4. **Check Render service is running** (not sleeping/stopped)
5. **Review full troubleshooting guide:** `DEPLOYMENT_TROUBLESHOOTING.md`

---

## 💡 Pro Tips

1. **Free Tier:** OpenRouter has a free tier - you don't need to pay immediately
2. **Key Security:** Never share your API key or commit it to Git
3. **Multiple Keys:** You can create multiple keys for different services
4. **Key Rotation:** If a key is compromised, delete it and create a new one

---

**Quick Summary:** Add `OPENROUTER_API_KEY` as environment variable in Render Dashboard (NOT in local .env), wait for redeploy, then test!
