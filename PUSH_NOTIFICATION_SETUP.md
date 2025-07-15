# Push Notification Setup Guide

This document walks you through **end-to-end setup, configuration, and testing** of Web Push notifications for the **GLP-1 Nutrition Companion** (Next.js + Firebase).

---

## 1. Prerequisites

| Requirement | Why |
|-------------|-----|
| Firebase project + Web App | Provides Cloud Messaging (FCM), Firestore & Auth |
| HTTPS origin (or `localhost`) | Service-workers & Push require secure origin |
| Node 18+, npm 9 | local development |
| Icons in `public/icons/` (192 px & 512 px) | shown in notifications / PWA |

---

## 2. Generate VAPID Keys

FCM uses **VAPID** to authenticate your web-push requests.

1. Install `web-push` globally **or** use the online tool.  
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Copy the **Public Key** (starts with `B...`).  
   Keep the **Private Key** secret (needed only for server-side sends).

---

## 3. Add Environment Variables

Create `.env.local` (or update it) at the project root:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=***
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=***
NEXT_PUBLIC_FIREBASE_PROJECT_ID=***
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=***
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=***
NEXT_PUBLIC_FIREBASE_APP_ID=***

# Push-notifications
NEXT_PUBLIC_FIREBASE_VAPID_KEY=<YOUR_PUBLIC_VAPID_KEY>
```

Commit **`.env.local.example`** (already in repo) but **never** commit the real `.env.local`.

---

## 4. Enable Cloud Messaging in Firebase

1. Firebase Console → **Project Settings → Cloud Messaging**  
2. Under **Web configuration** copy your **Sender ID** (already used).  
3. Ensure the **Cloud Messaging API (Legacy)** is **enabled** in Google Cloud Console.

---

## 5. Service Worker (`public/firebase-messaging-sw.js`)

Key points:

* Uses CDN scripts `firebase-app-compat.js` + `firebase-messaging-compat.js`.
* **No secrets** are hard-coded.  
  The app sends the config at runtime:

```ts
// example from /src/services/notificationService.ts
registration.active?.postMessage({
  type: 'INIT_FIREBASE',
  payload: firebaseApp.options      // safe, public values only
});
```

* Handles:
  * `onBackgroundMessage` → shows notification.
  * `notificationclick` → focuses / opens the app.

> File has already been added to `public/`.  
> **Do not rename** – FCM expects exactly `firebase-messaging-sw.js`.

---

## 6. Next.js PWA Setup

`next.config.js` integrates **next-pwa**:

```js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});
module.exports = withPWA({ reactStrictMode: true });
```

This automatically registers the service-worker in production builds.

---

## 7. Client-Side Helper (`notificationService.ts`)

Responsibilities:

1. **Register / reuse** the service-worker and post Firebase config.
2. Request **Notification permission**.
3. Retrieve **FCM token** with VAPID key.
4. Persist token in **`users/{uid}.fcmTokens[]`** via Firestore.

The Reminders page calls:

```ts
await requestNotificationPermission(user.uid);
```

After permission = **granted** you can see tokens in Firestore.

---

## 8. Testing Push Notifications

### 8.1 Local manual test (UI)

1. Visit **/reminders** → click **Enable Notifications**.  
2. Status should switch to **granted**.
3. Click **Send Test Notification** (TestNotification component).  
   A toast-style push should appear even if tab is in background.

### 8.2 Firebase Console Test 

1. Firebase Console → **Cloud Messaging → Send your first message**.  
2. Choose *Web* → **FCM registration token** (copy from Firestore or browser console `localStorage.getItem('_fcmToken')`).  
3. Send.  
4. Observe background notification (tab closed).

### 8.3 Production smoke test

Deploy to Netlify / Vercel:

```bash
npm run build && npm run start
```

Open the site on HTTPS origin, enable notifications, close the tab, trigger message via console → phone/desktop should receive it.

---

## 9. Common Issues & Fixes

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `messaging.getToken` returns `null` | Wrong VAPID key or SW not found | Verify `.env.local` & correct path `/firebase-messaging-sw.js` |
| `messaging.onBackgroundMessage` never fires | SW didn’t initialize Firebase | Ensure app posts `INIT_FIREBASE` message (check console) |
| Permission prompt never shows | Site already **blocked** | Browser Settings → Notifications → Allow |
| Works on localhost, not production | Deployed SW outdated | Clear cache or bump `skipWaiting` |

---

## 10. Next Steps (optional)

* **Cloud Functions**: schedule cron to send daily reminders via FCM (store meal times in Firestore -> cloud scheduler).
* **Analytics**: log notification opens (`notificationclick`) for engagement metrics.

Happy shipping! 🎉
