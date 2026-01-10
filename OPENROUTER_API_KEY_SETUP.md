# 🔑 OpenRouter API Key Setup Guide - Step by Step

## ✅ How to Set OpenRouter API Key in Render

### Step 1: Get Your OpenRouter API Key

1. Go to **https://openrouter.ai/keys**
2. Sign in or create an account (it's free!)
3. Click **"Create Key"** or copy your existing key
4. The key will look like: `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
5. **Copy this key** - you'll need it in the next step

---

### Step 2: Add API Key to Render Environment Variables

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click on your **Backend Service** (the one running `server.js`)
3. In the left sidebar, click **"Environment"**
4. Scroll down to the **"Environment Variables"** section
5. Click **"Add Environment Variable"** button
6. Fill in:
   - **Key:** `OPENROUTER_API_KEY`
   - **Value:** Paste your OpenRouter API key (starts with `sk-or-v1-...`)
7. Click **"Save Changes"**
8. **IMPORTANT:** Render will automatically redeploy your service after saving

---

### Step 3: Verify the Key is Set Correctly

1. Wait for Render to finish redeploying (usually 1-2 minutes)
2. Go to your service → **"Logs"** tab
3. Look for these lines in the startup logs:

**✅ CORRECT (Key is set):**
```
🔑 OpenRouter API Key: ✓ LOADED (sk-or-v1...xxxx)
   Key Length: 64 characters
```

**❌ WRONG (Key is missing):**
```
⚠️  CRITICAL WARNING: OPENROUTER_API_KEY MISSING!
   → AI features will NOT work
   → Set OPENROUTER_API_KEY in your .env file
```

---

### Step 4: Test the API Key

After redeploy, test if it's working:

1. Go to your service → **"Logs"** tab
2. In another tab, open your Vercel frontend
3. Type an idea in the hero section and submit
4. Go back to Render logs and look for:

**✅ SUCCESS:**
```
🚀 [TIMESTAMP] [BLUEPRINT-XXXXX] GENERATE BLUEPRINT REQUEST RECEIVED
   API Key Status: ✓ CONFIGURED
   API Key Preview: sk-or-v1-xxx...xxxx
📤 Sending request to AI models...
✅✅✅ SUCCESS! MODEL WORKED: model-name ✅✅✅
```

**❌ FAILURE (Key invalid or no credits):**
```
❌❌❌ ALL MODELS FAILED ❌❌❌
   Error: 401 Unauthorized
   OR
   Error: Insufficient credits
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "API Key Missing" Error

**Problem:** You see `OPENROUTER_API_KEY MISSING!` in logs

**Solution:**
- Make sure you added the key as `OPENROUTER_API_KEY` (exact name, all caps)
- Make sure there are NO spaces before/after the key value
- Make sure you clicked "Save Changes" and waited for redeploy
- Check the "Environment" tab again - the key should be listed there

---

### Issue 2: "401 Unauthorized" or "Invalid API Key"

**Problem:** Key is set but you get authentication errors

**Solution:**
- Verify the key is correct (copy it again from openrouter.ai/keys)
- Make sure you copied the ENTIRE key (it's long, ~64 characters)
- Don't include quotes around the key value in Render
- Try creating a new key at openrouter.ai/keys and using that one

---

### Issue 3: "Insufficient Credits" or "Quota Exceeded"

**Problem:** Key is valid but has no credits left

**Solution:**
- Go to https://openrouter.ai/keys
- Check your account balance/credits
- Add credits if needed (they have free tier available)
- Or create a new account with free credits

---

### Issue 4: Key Works in Test but Not in Production

**Problem:** Key works when testing manually but fails in Render

**Solution:**
- Make sure the key is in Render environment variables (NOT in your local .env file)
- Local .env file only works for local development
- Production (Render) needs the key in Render Dashboard → Environment
- After adding to Render, you MUST redeploy (happens automatically when you save)

---

## 📋 Checklist

Before testing, make sure:

- [ ] You have an OpenRouter account at https://openrouter.ai
- [ ] You created an API key at https://openrouter.ai/keys
- [ ] You copied the ENTIRE key (starts with `sk-or-v1-...`)
- [ ] You added it to Render Dashboard → Your Service → Environment
- [ ] The key name is exactly: `OPENROUTER_API_KEY` (all caps, underscores)
- [ ] You clicked "Save Changes" in Render
- [ ] Render finished redeploying (check deployment status)
- [ ] Render logs show: `🔑 OpenRouter API Key: ✓ LOADED`

---

## 🧪 Quick Test Commands

### Test 1: Check Backend Status
```bash
curl https://launchpact-ai.onrender.com/api/status
```

**Expected Response:**
```json
{
  "status": "online",
  "apiKeyConfigured": true,
  "primaryModel": "openrouter/auto:free",
  ...
}
```

If `apiKeyConfigured: false`, the key is not set correctly.

### Test 2: Test AI Endpoint
```bash
curl https://launchpact-ai.onrender.com/api/test-ai
```

**Expected Response:**
```json
{
  "success": true,
  "message": "AI connection working!",
  ...
}
```

If you get an error, the key might be invalid or have no credits.

---

## 💡 Important Notes

1. **Never commit API keys to Git** - Always use environment variables
2. **Render environment variables are separate from local .env** - Set it in Render Dashboard
3. **Key must be named exactly `OPENROUTER_API_KEY`** - Case sensitive
4. **After adding/updating, wait for redeploy** - Usually 1-2 minutes
5. **Free tier has limits** - Check your credits at openrouter.ai/keys

---

## 🎯 What You Should See in Render Logs (When Working)

```
🔥 LAUNCHPACT AI BACKEND IGNITION SEQUENCE
================================================
📊 CONFIGURATION STATUS:
------------------------------------------------
🔑 OpenRouter API Key: ✓ LOADED (sk-or-v1...xxxx)
   Key Length: 64 characters
📧 Resend API Key: ✓ LOADED
🗄️  Supabase URL: ✓ LOADED
🔐 Supabase Service Key: ✓ LOADED

🤖 AI MODELS CONFIGURATION:
   Total Models: 12
   Primary Model: openrouter/auto:free
   Free Fallbacks: 8

✅ All critical services initialized successfully!
================================================
```

---

## 🚀 Once It's Working

After the key is set correctly:
1. Submit an idea in your hero section
2. Check Render logs - you should see successful AI model responses
3. Blueprint should generate successfully
4. All AI features (chat, blueprint, execution plan) will work

---

**Need help?** If you still see errors after following these steps, check `DEPLOYMENT_TROUBLESHOOTING.md` for more detailed solutions.
