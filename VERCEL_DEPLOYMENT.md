# Vercel Deployment Guide

## 🚀 Setting Environment Variables on Vercel

Your app is freezing in production because Supabase credentials are missing. Here's how to fix it on Vercel:

### Step 1: Access Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your **splitsave** project
3. Click on **"Settings"** tab
4. Click on **"Environment Variables"** in the left sidebar

### Step 2: Add Environment Variables

Add these **5 environment variables**:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://xxxxx.supabase.co` (from Supabase Dashboard)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGc...` (long string from Supabase)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGc...` (service role key from Supabase)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 4: NEXTAUTH_SECRET
- **Key:** `NEXTAUTH_SECRET`
- **Value:** Generate with: `openssl rand -base64 32`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 5: NEXTAUTH_URL
- **Key:** `NEXTAUTH_URL`
- **Value:** `https://your-app.vercel.app`
- **Environments:** ✅ Production only

---

## 📋 Quick Reference: Where to Get Values

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → **anon/public key** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → **service_role key** (⚠️ keep secret!) |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` in terminal |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g., `https://splitsave.vercel.app`) |

---

## ⚡ Step-by-Step in Vercel Dashboard

### Using the Vercel UI:

1. **Go to:** https://vercel.com/dashboard/~/settings/environment-variables
2. **For each variable:**
   - Click **"Add New"**
   - Enter the **Key** (exact name from table above)
   - Enter the **Value** (from Supabase or generated)
   - Select **environments** (check all three: Production, Preview, Development)
   - Click **"Save"**

3. **After adding all 5 variables:**
   - Go to **"Deployments"** tab
   - Click **"Redeploy"** on your latest deployment
   - Select **"Use existing Build Cache"** → **NO** (rebuild with new env vars)
   - Click **"Redeploy"**

---

## 🖥️ Using Vercel CLI (Alternative Method)

If you prefer command line:

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste your value when prompted, press Enter

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste your value when prompted

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste your value when prompted

# Generate and add NEXTAUTH_SECRET
openssl rand -base64 32 | vercel env add NEXTAUTH_SECRET production

vercel env add NEXTAUTH_URL production
# Enter your Vercel URL (e.g., https://splitsave.vercel.app)

# Redeploy
vercel --prod
```

---

## 🔍 Verify Environment Variables Are Set

### Check in Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. You should see all 5 variables listed
3. Click "eye" icon to reveal values (verify they're not "undefined")

### Check in Deployment Logs:
1. Go to **Deployments** tab
2. Click on latest deployment
3. Check **"Build Logs"** for any environment variable errors
4. Look for: "✓ Compiled successfully" (no errors)

---

## 🎯 Expected Behavior After Setup

Once environment variables are configured and deployed:

- ✅ **App loads in 8-15 seconds** (no more infinite freeze)
- ✅ **Auth works properly** (users can sign in)
- ✅ **Data loads in parallel** (6 API calls at once)
- ✅ **Mobile performance is smooth**
- ✅ **No console errors** about missing Supabase config

---

## ⚠️ Important Security Notes

### Public vs Private Variables:

**Public (visible in browser):**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - OK to be public
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - OK to be public (anon key is safe)

**Private (server-only):**
- 🔒 `SUPABASE_SERVICE_ROLE_KEY` - **NEVER expose to frontend!**
- 🔒 `NEXTAUTH_SECRET` - **Keep secret!**

Vercel automatically ensures:
- Variables with `NEXT_PUBLIC_` prefix → Available in browser
- Variables without prefix → Only available on server

---

## 🆘 Troubleshooting

### Problem: App still freezing after adding variables

**Solution:**
1. Clear build cache and redeploy:
   - Deployments → Redeploy → Uncheck "Use existing Build Cache"
2. Check variables are in ALL environments (Production, Preview, Development)
3. Verify no typos in variable names (case-sensitive!)

### Problem: "Supabase not configured" warning

**Solution:**
- Make sure `NEXT_PUBLIC_SUPABASE_URL` is NOT `https://mock.supabase.co`
- Check Supabase project is active (not paused on free tier)
- Verify keys match your Supabase project

### Problem: 401 Unauthorized errors

**Solution:**
- Regenerate keys in Supabase Dashboard → Settings → API
- Update environment variables in Vercel
- Redeploy

### Problem: App works locally but not in production

**Solution:**
- Environment variables are **separate** for local vs production
- Local: `.env.local` file
- Production: Vercel dashboard settings
- Both need the same values!

---

## 📊 Check Your Deployment

After deploying, test your production app:

```bash
# Test if app is accessible
curl -I https://your-app.vercel.app

# Check if environment variables are working
# (Open browser console on production site)
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
# Should show your actual Supabase URL, not "undefined" or "mock"
```

---

## ✅ Checklist

- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` to Vercel
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to Vercel
- [ ] Added `NEXTAUTH_SECRET` to Vercel
- [ ] Added `NEXTAUTH_URL` to Vercel
- [ ] Verified all variables in Settings → Environment Variables
- [ ] Redeployed with **cleared build cache**
- [ ] Tested production site loads properly
- [ ] Verified no console errors
- [ ] Mobile app loads without freezing

---

## 🚀 Quick Deploy Script

Create this script to automate Vercel deployment with env check:

```bash
#!/bin/bash
echo "🔍 Checking environment variables..."
vercel env ls

echo ""
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "🌐 Test your app: https://your-app.vercel.app"
```

Save as `deploy-vercel.sh`, make executable: `chmod +x deploy-vercel.sh`

---

Need help? Check Vercel docs: https://vercel.com/docs/concepts/projects/environment-variables
