# Firebase Admin SDK Setup Guide

This guide will help you properly configure Firebase Admin SDK for production-ready authentication.

## Prerequisites

1. A Firebase project ([Create one here](https://console.firebase.google.com))
2. Firebase Authentication enabled in your project
3. Firestore Database created

## Step 1: Get Your Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Navigate to the "Service accounts" tab
6. Click "Generate new private key"
7. Click "Generate key" in the confirmation dialog
8. A JSON file will download - **keep this secure!**

## Step 2: Configure Environment Variables

You have three options for configuring the Firebase Admin SDK:

### Option A: Local Development (Recommended for testing)

1. Copy `.env.local.example` to `.env.local`
2. Open the downloaded service account JSON
3. Copy the entire JSON content
4. Convert it to a single line (remove line breaks)
5. Set it as `FIREBASE_ADMIN_SDK` in `.env.local`:

```bash
FIREBASE_ADMIN_SDK={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

### Option B: Vercel/Production Deployment (Recommended for production)

1. Extract these three values from your service account JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`  
   - `private_key` → `FIREBASE_PRIVATE_KEY`

2. In Vercel dashboard (or your hosting platform):
   - Go to Project Settings → Environment Variables
   - Add each variable separately:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqh...\n-----END PRIVATE KEY-----\n"
```

**Important for FIREBASE_PRIVATE_KEY:**
- Keep the quotes around the value
- Keep the `\n` characters (they're part of the key)
- In Vercel, paste the key exactly as it appears in the JSON

### Option C: Google Cloud Platform

If deploying to Google Cloud (App Engine, Cloud Run, etc.):
1. Use Application Default Credentials
2. Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of your service account JSON

## Step 3: Test Your Configuration

1. Restart your development server:
```bash
npm run dev
```

2. Check the console for any Firebase Admin initialization errors

3. Try generating a meal - authentication should now work properly

## Step 4: Security Best Practices

### ⚠️ IMPORTANT Security Notes:

1. **Never commit service account keys to Git**
   - Add `.env.local` to `.gitignore` (already done)
   - Never commit the JSON file

2. **Restrict Service Account Permissions**
   - In Firebase Console → IAM
   - Give minimum required permissions
   - For this app: "Firebase Authentication Admin" and "Cloud Firestore User"

3. **Rotate Keys Regularly**
   - Generate new keys every 90 days
   - Delete old keys after updating

4. **Use Environment-Specific Keys**
   - Different keys for development/staging/production
   - Never use production keys in development

## Troubleshooting

### Error: "Service account object must contain a string 'project_id' property"
- Your `FIREBASE_ADMIN_SDK` environment variable is not set or malformed
- Check that the JSON is on a single line
- Verify all quotes are properly escaped

### Error: "Firebase ID token has incorrect 'aud' (audience) claim"
- The client SDK and admin SDK are from different projects
- Ensure both use the same Firebase project

### Error: "auth/argument-error"
- The token being sent from the client is malformed
- Check that `user.getIdToken()` is being awaited properly

### Development Fallback
If Firebase Admin SDK is not configured, the app will:
1. Show a warning in the console
2. Use a development-only fallback (accepts UID as token)
3. This is NOT secure and should never be used in production

## Verification Checklist

- [ ] Service account JSON downloaded from Firebase Console
- [ ] Environment variables configured (.env.local or hosting platform)
- [ ] Development server restarted after configuration
- [ ] No Firebase Admin errors in console
- [ ] Meal generation works with authentication
- [ ] Service account key is NOT in version control

## Next Steps

1. Deploy to production with proper environment variables
2. Monitor Firebase Console for authentication metrics
3. Set up error logging for failed authentications
4. Consider implementing rate limiting for API endpoints

## Support

If you encounter issues:
1. Check Firebase Console → Authentication for user status
2. Verify Firestore security rules are deployed
3. Check browser console for detailed error messages
4. Ensure all environment variables are properly set

Remember: The Firebase Admin SDK is crucial for production security. Never bypass token verification in production environments.