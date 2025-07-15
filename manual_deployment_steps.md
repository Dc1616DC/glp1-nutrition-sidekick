# Manual Deployment Steps – Meal Reminders System  
_GL P-1 Nutrition Companion_

> Follow this checklist **in order** to put the Meal Reminders feature into production.

---

## 0. Prerequisites

| Requirement | Notes |
|-------------|-------|
| **Firebase project** | Already created (ID: `glp1-nutrition-sidekick`) |
| **Blaze plan** | You just upgraded – no further action needed |
| **Node 18 LTS** | `node -v` should output ≥ 18 |
| **Firebase CLI ≥ 14** | `npm i -g firebase-tools` (you may need `sudo` on macOS/Linux) |
| **Git repo cloned** | All code & functions present locally |
| **Service-account rights** | Your Google account must have **Owner / Editor** on the project |

---

## 1. Authenticate & Select Project

```bash
firebase login                 # opens browser; complete OAuth
firebase use --add             # select glp1-nutrition-sidekick → alias “default”
firebase projects:list         # verify ★ marks the correct project
```

---

## 2. Build Cloud Functions

```bash
cd functions
npm install                    # only first time or after package changes
npm run build                  # compiles TS → lib/
```

Status messages should finish with **zero errors**.

---

## 3. First-Time Deployment

```bash
# still inside functions/
firebase deploy --only functions
```

What happens:
* `predeploy` hook runs `npm run build`
* Functions uploaded:
  * `checkAndSendMealReminders`  — scheduled every 5 min
  * `triggerMealReminders`       — HTTPS GET endpoint
  * `sendTestNotification`       — HTTPS callable

When finished you’ll see a green ✅ and URLs for each HTTP function.

---

## 4. Verify Scheduled Trigger

1. Open **Firebase Console → Cloud Functions → left nav “Triggers”**  
   Confirm a Pub/Sub schedule “every 5 minutes”.
2. Wait up to 5 minutes and check the **Logs** tab for  
   `Running scheduled meal reminder check`.

---

## 5. Grant Notification Permission in the Web App

1. Start the Next.js site (or deploy it if already hosted).  
   `npm run dev` → `localhost:3000`
2. Go to **/reminders** page  
   • Click **“Enable Notifications”** → Allow in browser prompt.  
   • Use **“Send Test Notification”** button to ensure foreground delivery.

---

## 6. End-to-End Test

1. On the Reminders page set *Breakfast* to **five minutes ahead** of current time, press **Save Reminders**  
2. Close the browser tab or leave it in background.  
3. Within ~5 minutes you should receive a native push-notification:  
   “Time for Breakfast!”
4. If nothing arrives:  
   * Check **Firebase Console → Functions → Logs** for errors  
   * Confirm the user doc in Firestore contains `fcmTokens` array  
   * Make sure OS-level notification settings allow alerts for the browser

---

## 7. Create Real Icons (one-time)

Replace placeholder files:

```
/public/icons/icon-192x192.png   # required for push notifications
/public/icons/icon-512x512.png   # PWA install prompt
```

Recommend 192×192 px and 512×512 px PNG, transparent background.

---

## 8. Cost & Budget Alerts (Optional but Recommended)

```bash
gcloud billing budgets create \
  --display-name="Firebase safeguard" \
  --budget-amount=10  \
  --threshold-rule-percent=0.8
```

This emails you if monthly spend exceeds $8 (80 % of $10).

---

## 9. Ongoing Monitoring

| Console Section | What to watch |
|-----------------|---------------|
| **Functions → Dashboard** | Invocation count, avg duration |
| **Functions → Logs**      | Errors or token cleanup entries |
| **Cloud Messaging → Delivery** | Message opens, failures |
| **Firestore Usage** | Reads per day (target \< 50 K) |

---

## 10. Troubleshooting Cheat-Sheet

| Symptom | Check |
|---------|-------|
| No scheduled runs | “Triggers” page – make sure the cron exists |
| “unauthenticated” error on test | Call from signed-in client only |
| Notification shows on Android but silent on iOS | iOS Focus / Notification summary settings |
| Many `messaging/registration-token-not-registered` logs | Old tokens – automatic cleanup will remove |

---

**Deployment complete!**  
Your users will now receive meal reminders even when the app is closed. 🎉
