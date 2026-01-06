# 🚀 Render Deployment - Quick Reference Card

## Copy-Paste Values for Render Form

---

### 📝 Basic Configuration

| Field | Value |
|-------|-------|
| **Name** | `LaunchPact-AI` |
| **Language** | `Node` |
| **Branch** | `main` |
| **Region** | `Oregon (US West)` |
| **Root Directory** | *(Leave empty)* |

---

### 🔨 Build & Start Commands

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

---

### 🔐 Environment Variables (Add These)

Click "Add Environment Variable" for each:

1. **OPENROUTER_API_KEY** = `your_openrouter_api_key_here`
2. **RESEND_API_KEY** = `your_resend_api_key_here`
3. **SENDER_EMAIL** = `noreply@cavexa.online`
4. **VITE_SUPABASE_URL** = `https://your-project.supabase.co`
5. **SUPABASE_SERVICE_ROLE_KEY** = `your_service_role_key_here`
6. **VITE_APP_URL** = `https://launchpact-ai.onrender.com` *(update after deployment)*

---

### 💰 Instance Type

- **Free** ($0/month) - For testing
- **Starter** ($7/month) - Recommended for production

---

### ✅ After Deployment

1. Copy your Render URL (e.g., `https://launchpact-ai.onrender.com`)
2. Update `VITE_APP_URL` environment variable with this URL
3. Redeploy to apply changes
4. Test: `https://your-url.onrender.com/api/status`

---

**📖 Full guide: See `RENDER_DEPLOYMENT_GUIDE.md`**

