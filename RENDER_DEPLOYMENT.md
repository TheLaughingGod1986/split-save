# Render Deployment Guide

## 🚀 Setting Environment Variables on Render

Your app is currently freezing in production because the Supabase credentials are missing. Here's how to fix it:

### Step 1: Access Render Dashboard

1. Go to https://dashboard.render.com
2. Select your SplitSave service
3. Click on **"Environment"** in the left sidebar

### Step 2: Add Environment Variables

Add these **exact** environment variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXTAUTH_SECRET
NEXTAUTH_URL
```

### Step 3: Fill in the Values

Get your Supabase credentials from: https://supabase.com/dashboard

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (long string) | Supabase Dashboard → Settings → API → Project API keys → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (long string) | Supabase Dashboard → Settings → API → Project API keys → service_role |
| `NEXTAUTH_SECRET` | Any random 32+ character string | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL | e.g., `https://your-app.onrender.com` |

### Step 4: Deploy

After adding the environment variables:

1. Click **"Save Changes"** in Render dashboard
2. Render will automatically redeploy your app
3. Wait 2-5 minutes for the deployment to complete
4. Test your app - it should now load without freezing!

---

## ⚡ Quick Setup Commands

**Generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Test your production deployment:**
```bash
curl -I https://your-app.onrender.com
```

---

## 🔍 Troubleshooting

### App still freezing after adding variables?

1. **Check Render logs:**
   - Render Dashboard → Logs tab
   - Look for "Supabase not configured" warnings
   - Check for API errors

2. **Verify environment variables are set:**
   - Render Dashboard → Environment
   - Make sure all 5 variables are present
   - No typos in variable names (case-sensitive!)

3. **Force redeploy:**
   - Render Dashboard → Manual Deploy → "Clear build cache & deploy"

4. **Check Supabase credentials:**
   - Go to Supabase Dashboard
   - Verify project is active (not paused)
   - Test credentials locally first

---

## 📝 Important Notes

- ⚠️ **Never commit `.env.local` to git** (it's in .gitignore)
- ✅ Environment variables on Render are **secure and private**
- 🔄 Changes to environment variables **trigger automatic redeployment**
- 🌐 `NEXT_PUBLIC_*` variables are **visible in browser** (use only for public keys)
- 🔒 `SUPABASE_SERVICE_ROLE_KEY` is **private** (never expose to frontend)

---

## 🎯 Expected Behavior After Setup

- ✅ App loads in 8-15 seconds (instead of freezing)
- ✅ User can sign in with email/password
- ✅ Data loads in parallel (6 API calls at once)
- ✅ Mobile experience is smooth and responsive

---

## 🆘 Still Having Issues?

Check the deployment logs for specific errors:
```bash
# If you have Render CLI installed:
render logs -s your-service-name --tail
```

Or view logs in the Render dashboard under the "Logs" tab.
