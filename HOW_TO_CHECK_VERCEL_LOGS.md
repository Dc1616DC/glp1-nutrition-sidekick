# How to Check Vercel Logs for Debugging

## If You Get Errors, Check Logs:

### 1. Access Vercel Dashboard
- Go to: https://vercel.com/dans-projects-9331cd36/glp1-nutrition-sidekick

### 2. Navigate to Logs
- Click on **Deployments** tab
- Click on the most recent deployment (top of the list)
- Click **Functions** or **Logs** tab

### 3. Look for These Key Messages

#### ✅ GOOD - Environment Variables Loaded:
```
Firebase Admin SDK initialized successfully
Environment variables loaded: 13
```

#### ❌ BAD - Missing Environment Variables:
```
Firebase Admin SDK not initialized
Environment check: hasProjectId: false
```

#### ❌ BAD - Authentication Errors:
```
Firebase token verification failed
Authentication required
```

### 4. Common Error Messages & Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `401 Authentication required` | Firebase Admin SDK not initialized | Add Firebase env vars to Vercel |
| `Firebase Admin SDK not initialized` | Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY | Add all three Firebase Admin variables |
| `Token verification failed` | Invalid Firebase auth token | Check NEXT_PUBLIC_FIREBASE_* variables are set |
| `403 Premium subscription required` | Premium access bypass not working | Should be bypassed in dev mode (line 282 subscriptionService.ts) |
| `500 Failed to generate meals` | OpenAI or Grok API key issue | Add OPENAI_API_KEY and GROK_API_KEY |

### 5. Verify Environment Variables Are Set

Go to: Vercel Dashboard → Settings → Environment Variables

You should see these variables (for Production, Preview, and Development):

**Firebase Admin (Server-side):**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

**Firebase Client (Browser):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**AI Services:**
- `OPENAI_API_KEY`
- `GROK_API_KEY`
- `SPOONACULAR_API_KEY` (optional)

### 6. After Adding Variables

**IMPORTANT:** Vercel will auto-redeploy when you add environment variables, but if it doesn't:
1. Go to Deployments
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for rebuild
5. Test again!

### 7. Force a Fresh Deploy

If variables are set but still not working:
```bash
# From your local machine
git commit --allow-empty -m "Force Vercel rebuild"
git push origin claude/business-idea-generator-011CUoWEjJ5stE3YDMKQTkaP
```

This will trigger a fresh deployment with all environment variables.
