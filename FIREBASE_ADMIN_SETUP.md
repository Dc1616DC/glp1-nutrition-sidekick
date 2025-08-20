# Firebase Admin SDK Setup Guide for Vercel

## Critical Security Issue
⚠️ **URGENT**: The app currently has authentication bypassed in production. Follow these steps immediately to secure your application.

## Step 1: Generate Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to: **Project Settings** → **Service Accounts** tab
4. Click **"Generate New Private Key"**
5. Save the downloaded JSON file securely (DO NOT commit to git)

## Step 2: Extract Required Values

From your service account JSON file, you need these three values:

```json
{
  "project_id": "your-project-id",        // You need this
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",  // You need this
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"  // You need this
}
```

## Step 3: Add Environment Variables to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to: **Settings** → **Environment Variables**
4. Add these three variables:

### Required Variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `FIREBASE_PROJECT_ID` | Your project ID from JSON | Example: `glp1-nutrition-12345` |
| `FIREBASE_CLIENT_EMAIL` | Service account email from JSON | Example: `firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Full private key from JSON | ⚠️ **IMPORTANT**: Copy the ENTIRE key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` |

### Important Notes for FIREBASE_PRIVATE_KEY:
- Copy the entire private key including the BEGIN and END lines
- The key contains `\n` characters - copy it exactly as it appears
- Vercel will handle the newline characters correctly
- Do NOT wrap in quotes when pasting into Vercel

## Step 4: Deploy to Apply Changes

After adding the environment variables:

1. Trigger a new deployment in Vercel:
   ```bash
   git commit --allow-empty -m "Trigger deployment with Firebase Admin SDK vars"
   git push
   ```
   
   OR
   
2. Go to Vercel Dashboard → Deployments → Click "Redeploy" on the latest deployment

## Step 5: Remove Authentication Bypass

Once the environment variables are configured and deployed:

1. Remove the temporary bypass from both API routes
2. The code will be updated automatically in the next step

## Step 6: Verify Setup

After deployment, test the meal generator:

1. Go to your production app
2. Try generating a meal
3. Check Vercel Functions logs for any authentication errors

## Environment Variable Reference

### For Local Development (.env.local)

```bash
# Option 1: Full service account JSON (easier for local dev)
FIREBASE_ADMIN_SDK='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'

# Option 2: Individual variables (same as production)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### For Production (Vercel)

Use the individual variables as shown in Step 3.

## Troubleshooting

### Common Issues:

1. **"Firebase Admin SDK not initialized"**
   - Ensure all three variables are set in Vercel
   - Check variable names are exactly as specified
   - Redeploy after adding variables

2. **"Invalid private key"**
   - Make sure you copied the ENTIRE private key
   - Include the BEGIN and END lines
   - Don't add extra quotes or escape characters

3. **"Token verification failed"**
   - Ensure the service account has proper permissions
   - Check that project ID matches your Firebase project

## Security Best Practices

1. **Never commit service account keys to Git**
2. **Use environment variables for all sensitive data**
3. **Regularly rotate service account keys**
4. **Monitor Firebase Admin SDK usage in Google Cloud Console**
5. **Remove the authentication bypass immediately after setup**

## Need Help?

If you encounter issues:
1. Check Vercel Function logs: Dashboard → Functions → View logs
2. Verify environment variables are set: Settings → Environment Variables
3. Ensure Firebase project is active and not suspended