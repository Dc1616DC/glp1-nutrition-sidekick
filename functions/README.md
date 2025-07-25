# Firebase Functions – Meal Reminders System  

This directory contains the **Cloud Functions** that power scheduled push-notifications for the **GLP-1 Nutrition Companion**.  
The main entry point is `src/index.ts`.

---

## 1.  Prerequisites

| Requirement | Notes |
|-------------|-------|
| Node 18 LTS | Functions runtime is set to **nodejs18** |
| Firebase CLI ≥ 13 | `npm i -g firebase-tools` |
| Firebase project | You must have Owner/Editor rights |
| Billing enabled  | Cloud Scheduler & Pub/Sub require the **Blaze** plan (free quota covers this use-case) |
| FCM VAPID key  | Already configured in `.env.local` for the web app |

---

## 2.  Install & Build

```bash
cd functions
npm install          # installs firebase-admin, firebase-functions, typescript, etc.
npm run build        # compiles TypeScript to lib/*
```

On first run the CLI will create `.firebase/` metadata folders.

---

## 3.  Local Development & Testing

### 3.1 Emulators

```bash
# from repo root
firebase emulators:start --only functions,firestore,pubsub
```

What happens:

* Firestore emulator on **localhost:8080**  
* Functions emulator on **localhost:5001**  
* Pub/Sub emulator on **localhost:8085**

The scheduled function **`checkAndSendMealReminders`** still runs every 5 minutes using the Pub/Sub emulator.

### 3.2 Manual trigger

While emulators are running you can hit the HTTP endpoint:

```bash
curl http://localhost:5001/<PROJECT_ID>/us-central1/triggerMealReminders
```

It returns JSON describing how many reminders were processed.

### 3.3 Send a test notification to *your* user

From a signed-in web page (reminders → “Server Notification”) or cURL:

```bash
firebase functions:shell
# then inside shell
sendTestNotification()
```

---

## 4.  Deploy to Production

```bash
# build TS ➜ JS then deploy functions
npm --prefix functions run deploy
```

The `firebase.json` pre-deploy hook ensures `npm run build` is executed automatically.

> **Tip:** To deploy only one function:  
> `firebase deploy --only functions:sendTestNotification`

---

## 5.  Function Overview

| Function | Type | Description |
|----------|------|-------------|
| `checkAndSendMealReminders` | **Scheduled** (`every 5 minutes`) | Scans `users/*` for `notificationSettings` and compares times to *now*. Sends push-notifications via FCM. |
| `triggerMealReminders` | HTTPS *GET* | Same logic as the scheduler but callable on demand (useful for QA). |
| `sendTestNotification` | HTTPS callable | Sends a “Test Notification” to the authenticated user’s devices. |
| **Utilities** | — | Token validation / cleanup, helper to convert HH:MM→minutes, etc. |

---

## 6.  Monitoring & Debugging

| Tool | What to look for |
|------|------------------|
| **Firebase Console ➜ Functions ➜ Logs** | Success / error logs emitted by each run. |
| **Cloud Scheduler** | Confirms the cron job (`checkAndSendMealReminders`) is executing. |
| **Cloud Messaging → Delivery Data** | Tracks send success, opens, failures. |
| **Logs Explorer** | Search `resource.type="cloud_function"` and `severity=ERROR`. |

Common log markers:
```
Running scheduled meal reminder check
Sending Breakfast reminder to user <uid>
No FCM tokens found ...
Removed <n> invalid tokens ...
```

---

## 7.  Cost Considerations

* **Cloud Functions**: 1 invocation every 5 min (≈ 8,640 / month) – easily inside free tier.  
* **Cloud Scheduler**: 1 job, free.  
* **FCM**: free for unlimited messages.  
* **Firestore reads**: one read per user per 5 min; optimize later with batched queries or TTL if needed.

---

## 8.  Future Enhancements

1. **Time-zone support** – store user TZ and evaluate reminders accordingly.  
2. **Dynamic schedules** – only schedule times that actually exist instead of fixed 5 min polling.  
3. **Digest notifications** – consolidate multiple reminders into a single push.  
4. **In-app analytics** – log reminder opens (`notificationclick`) to Firebase Analytics.

---

### Quick Reference

```bash
# Full cycle in 3 commands
npm --prefix functions i      # install deps
npm --prefix functions run build
firebase deploy --only functions
```

Happy shipping! 🚀
