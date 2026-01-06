# Render Deployment Guide for LaunchPact AI

## 📋 Complete Render Configuration

Use this guide to fill out your Render Web Service deployment form.

---

## 🔧 Basic Settings

### Name
```
LaunchPact-AI
```

### Language
```
Node
```

### Branch
```
main
```

### Region
```
Oregon (US West)
```
*(or your preferred region)*

### Root Directory
```
(Leave empty - root directory is correct)
```

---

## 🛠️ Build & Start Commands

### Build Command
```
npm install
```
*Note: Backend doesn't require a build step, just install dependencies*

### Start Command
```
npm start
```
*This runs `node server.js` which starts your Express server*

---

## 🔐 Environment Variables

Add these environment variables in Render's Environment Variables section:

### Required Variables:

1. **OPENROUTER_API_KEY**
   - **Value**: Your OpenRouter API key
   - **Description**: API key for OpenRouter AI service
   - **Get it from**: https://openrouter.ai

2. **RESEND_API_KEY**
   - **Value**: Your Resend API key
   - **Description**: API key for sending emails via Resend
   - **Get it from**: https://resend.com

3. **SENDER_EMAIL**
   - **Value**: `noreply@cavexa.online` (or your verified domain email)
   - **Description**: Email address for sending notifications
   - **Note**: Must be verified in Resend dashboard

4. **VITE_SUPABASE_URL**
   - **Value**: Your Supabase project URL
   - **Description**: Supabase project URL
   - **Format**: `https://xxxxx.supabase.co`

5. **SUPABASE_SERVICE_ROLE_KEY**
   - **Value**: Your Supabase service role key
   - **Description**: Supabase service role key (admin access)
   - **Get it from**: Supabase Dashboard → Settings → API → service_role key

6. **VITE_APP_URL**
   - **Value**: Your Render service URL (will be like `https://launchpact-ai.onrender.com`)
   - **Description**: Frontend application URL for CORS and email links
   - **Note**: Update this after deployment with your actual Render URL

### Optional Variables:

7. **VITE_OPENROUTER_API_KEY**
   - **Value**: Same as OPENROUTER_API_KEY (if you want to use VITE_ prefix)
   - **Description**: Alternative name for OpenRouter API key

---

## 📝 Step-by-Step Deployment Instructions

### Step 1: Fill Basic Information
1. **Name**: `LaunchPact-AI`
2. **Language**: Select `Node`
3. **Branch**: `main`
4. **Region**: `Oregon (US West)` (or your preferred region)
5. **Root Directory**: Leave empty

### Step 2: Configure Build & Start
1. **Build Command**: `npm install`
2. **Start Command**: `npm start`

### Step 3: Set Instance Type
- **Free**: $0/month (for testing)
- **Starter**: $7/month (recommended for production)
- **Standard**: $25/month (for higher traffic)

### Step 4: Add Environment Variables
Click "Add Environment Variable" and add each variable from the list above.

**Important**: 
- Replace placeholder values with your actual API keys
- Keep `VITE_APP_URL` empty initially, then update it after deployment with your Render URL

### Step 5: Deploy
1. Click "Deploy web service"
2. Wait for build to complete (usually 2-5 minutes)
3. Copy your service URL (e.g., `https://launchpact-ai.onrender.com`)
4. Update `VITE_APP_URL` environment variable with your new URL
5. Redeploy to apply the updated URL

---

## ✅ Post-Deployment Checklist

After deployment:

- [ ] Service is running and accessible
- [ ] Health check endpoint works: `https://your-service.onrender.com/api/status`
- [ ] Test AI endpoint: `https://your-service.onrender.com/api/test-ai`
- [ ] Update `VITE_APP_URL` with your Render URL
- [ ] Update frontend CORS settings if needed
- [ ] Test email sending functionality
- [ ] Verify Supabase connection

---

## 🔍 Testing Your Deployment

### Health Check
```bash
curl https://your-service.onrender.com/api/status
```

Expected response:
```json
{
  "status": "online",
  "provider": "OpenRouter",
  "apiKeyConfigured": true,
  "primaryModel": "google/gemini-flash-1.5",
  "totalModels": 8,
  "fallbackModels": 7,
  "time": "2024-..."
}
```

### Test AI Connection
```bash
curl https://your-service.onrender.com/api/test-ai
```

---

## 🚨 Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility (v18+)

### Service Won't Start
- Check logs in Render dashboard
- Verify PORT environment variable (Render sets this automatically)
- Ensure all required environment variables are set

### CORS Errors
- Update CORS origin in `server.js` to include your frontend URL
- Or set CORS to allow all origins in production: `origin: true`

### API Key Errors
- Verify all API keys are correctly set in Environment Variables
- Check that keys don't have extra spaces or quotes
- Ensure service role key is used (not anon key) for Supabase

### Database Connection Issues
- Verify Supabase URL and service role key
- Check Supabase project is active
- Ensure database tables are created (run SQL scripts)

---

## 📊 Monitoring

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Monitor CPU, memory, and response times
- **Health**: Set up health check endpoint monitoring

---

## 🔄 Updating Your Deployment

1. Push changes to `main` branch
2. Render automatically redeploys
3. Or manually trigger redeploy from dashboard

---

## 💡 Pro Tips

1. **Free Tier Limitations**: Free instances spin down after inactivity. Use a paid tier for production.

2. **Environment Variables**: Never commit API keys to Git. Always use Render's Environment Variables.

3. **Database**: Ensure Supabase tables are created before deployment.

4. **Email Domain**: Verify your sender email domain in Resend before deploying.

5. **CORS**: Update CORS settings in `server.js` if your frontend is on a different domain.

---

## 📞 Support

If you encounter issues:
1. Check Render logs first
2. Verify all environment variables
3. Test endpoints individually
4. Check Supabase and Resend dashboards for service status

---

**Ready to deploy? Follow the steps above and your LaunchPact AI backend will be live on Render! 🚀**

