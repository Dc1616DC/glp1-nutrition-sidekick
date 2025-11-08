# Freemium vs Premium Flow - Complete Documentation

This document explains exactly how the freemium system works across Firebase, Stripe, and your API routes.

---

## 🏗️ **System Architecture**

```
┌─────────────┐       ┌──────────────┐       ┌─────────────────┐
│   Firebase  │◄─────►│ Your Next.js │◄─────►│     Stripe      │
│  Firestore  │       │      App     │       │   (Payments)    │
└─────────────┘       └──────────────┘       └─────────────────┘
      │                       │                         │
      │                       │                         │
  Stores user          API routes check           Sends webhook
  subscription         subscription status        when user pays
  data                 before generating
```

---

## 📊 **Data Flow: How Everything Connects**

### **1. New User Signs Up**

```
User → Firebase Auth → Account created
         ↓
subscriptionService.getUserSubscription(userId)
         ↓
No subscription found
         ↓
subscriptionService.createFreeSubscription(userId)
         ↓
Firebase: userSubscriptions/{userId}
    {
      userId: "abc123",
      isPremium: false,
      subscriptionType: "free",
      subscriptionStatus: "active",
      mealGenerationsUsed: 0,
      mealGenerationsLimit: 5,        ← FREE TIER LIMIT
      resetDate: "2025-02-01T00:00:00.000Z",
      createdAt: timestamp,
      updatedAt: timestamp
    }
```

---

### **2. User Generates a Meal (Free Tier)**

```
User clicks "Generate Meal"
    ↓
Frontend calls /api/generate-meal-options-new
    ↓
API Route:
    1. verifyUser(request) → Get userId from Firebase token
    2. subscriptionService.getUsageStats(userId)
         ↓
       canGenerate = (mealGenerationsLimit - mealGenerationsUsed) > 0
       canGenerate = (5 - 0) > 0 = true  ✅
    3. If canGenerate = false → Return 403 error
    4. Generate meal with Grok AI
    5. subscriptionService.useMealGeneration(userId)
         ↓
       Firebase UPDATE:
         mealGenerationsUsed: 0 → 1   (increment)
    6. Return meal + usageStats to frontend
```

---

### **3. User Hits Free Limit**

```
After 5 meal generations:
    mealGenerationsUsed = 5
    mealGenerationsLimit = 5
    canGenerate = (5 - 5) > 0 = false  ❌

Next generation attempt:
    ↓
API Route returns 403:
    {
      error: "Meal generation limit reached",
      message: "You've used all 5 free meal generations this month...",
      upgradeUrl: "/pricing",
      usageStats: {
        used: 5,
        limit: 5,
        remaining: 0,
        resetDate: "2025-02-01",
        daysUntilReset: 10
      }
    }
```

---

### **4. User Subscribes to Premium**

```
User clicks "Subscribe Now" on /pricing
    ↓
Frontend calls /api/stripe/create-checkout-session
    ↓
API creates Stripe checkout session with:
    - client_reference_id: userId (Firebase UID)
    - metadata: { userId, planType }
    ↓
User redirected to Stripe hosted checkout page
    ↓
User enters credit card → Stripe processes payment
    ↓
Stripe sends webhook to /api/stripe/webhook
    ↓
Webhook handler (handleCheckoutCompleted):
    1. Extract userId from session.metadata
    2. Get subscription details from Stripe
    3. UPDATE Firebase: userSubscriptions/{userId}
        {
          isPremium: true,                          ← UPGRADED!
          subscriptionType: "premium",
          subscriptionStatus: "active",
          stripeCustomerId: "cus_...",
          stripeSubscriptionId: "sub_...",
          stripePriceId: "price_...",
          mealGenerationsUsed: 0,                   ← RESET
          mealGenerationsLimit: 999999,             ← UNLIMITED!
          currentPeriodStart: Date,
          currentPeriodEnd: Date,
          updatedAt: timestamp
        }
    ↓
User redirected to /subscription/success
```

---

### **5. Premium User Generates Meals**

```
User generates meal
    ↓
API Route:
    1. getUsageStats(userId)
         ↓
       mealGenerationsUsed = 50 (example)
       mealGenerationsLimit = 999999
       canGenerate = (999999 - 50) > 0 = true  ✅  (always true)
    2. Generate meal
    3. useMealGeneration(userId) → Increment counter to 51
    4. Return meal + usageStats
```

**Premium users will NEVER hit the limit** because 999,999 is effectively unlimited.

---

### **6. User Cancels Subscription**

```
User cancels in Stripe dashboard OR subscription expires
    ↓
Stripe sends webhook (customer.subscription.deleted)
    ↓
Webhook handler (handleSubscriptionDeleted):
    1. Extract userId from subscription.metadata
    2. UPDATE Firebase: userSubscriptions/{userId}
        {
          isPremium: false,                        ← DOWNGRADED
          subscriptionType: "free",
          subscriptionStatus: "canceled",
          mealGenerationsUsed: 0,                  ← RESET
          mealGenerationsLimit: 5,                 ← BACK TO FREE TIER
          resetDate: "2025-03-01",
          updatedAt: timestamp
        }
    ↓
Next meal generation attempt will enforce 5 meal limit again
```

---

## 🔒 **Protected API Endpoints**

All meal generation endpoints are now protected:

| Endpoint | Protection | Usage Tracking | Notes |
|----------|-----------|----------------|-------|
| `/api/generate-meal-options` | ✅ Yes | ✅ Yes | Main generator |
| `/api/generate-meal-options-new` | ✅ Yes | ✅ Yes | Main generator (new) |
| `/api/generate-chef-meals` | ✅ Yes | ✅ Yes | Chef-inspired meals |
| `/api/generate-chef-meals` (PATCH) | ✅ Auth only | ❌ No | Enhancement doesn't count |

**NOT meal generation (no limits needed):**
- `/api/enhance-meal` - Enhances existing meals
- `/api/enhance-recipe` - Enhances existing recipes
- `/api/generate-symptom-tip` - Just generates tips (not meals)
- `/api/get-meals-data` - Reads data (no generation)

---

## 🔐 **Security Checkpoints**

### **Authentication Check:**
```typescript
const userId = await verifyUser(request);
if (!userId) {
  return 401 Unauthorized
}
```
**What it does:** Verifies the Firebase ID token sent in the Authorization header

### **Usage Limit Check:**
```typescript
const usageStats = await subscriptionService.getUsageStats(userId);
if (!usageStats.canGenerate) {
  return 403 Forbidden + upgrade message
}
```
**What it does:** Checks if user has remaining meal generations

### **Usage Tracking:**
```typescript
const usageResult = await subscriptionService.useMealGeneration(userId);
```
**What it does:** Increments mealGenerationsUsed counter in Firebase

---

## 📝 **Firebase Data Structure**

### **Collection: `userSubscriptions`**

Each document ID is the Firebase user ID:

```typescript
{
  // User identification
  userId: string,                      // Firebase UID

  // Subscription status
  isPremium: boolean,                  // true = premium, false = free
  subscriptionType: "free" | "premium",
  subscriptionStatus: "active" | "canceled" | "expired",

  // Stripe integration (only for premium)
  stripeCustomerId?: string,           // "cus_..."
  stripeSubscriptionId?: string,       // "sub_..."
  stripePriceId?: string,              // "price_..." (monthly or annual)
  currentPeriodStart?: Date,
  currentPeriodEnd?: Date,

  // Usage tracking
  mealGenerationsUsed: number,         // Current count
  mealGenerationsLimit: number,        // 5 for free, 999999 for premium
  resetDate: Date,                     // When limit resets (1st of month)

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 **Monthly Reset Logic**

Free users' limits reset on the 1st of each month:

```typescript
// In subscriptionService.getUserSubscription()
if (shouldResetLimits(subscription)) {
  return await resetMonthlyLimits(userId, subscription);
}

// Resets:
mealGenerationsUsed → 0
resetDate → Next month's 1st
```

---

## 🧪 **Testing the Flow**

### **Test Free Tier:**
1. Create account → Check Firebase: mealGenerationsLimit = 5
2. Generate 5 meals → Check Firebase: mealGenerationsUsed = 5
3. Try 6th meal → Should get 403 error with upgrade message
4. Wait until 1st of month → Limit resets to 0

### **Test Premium Upgrade:**
1. Subscribe via Stripe (use test card: 4242 4242 4242 4242)
2. Check webhook fired in Stripe dashboard logs
3. Check Firebase: isPremium = true, limit = 999999
4. Generate meals → No limit

### **Test Cancellation:**
1. Cancel subscription in Stripe
2. Check webhook fired
3. Check Firebase: isPremium = false, limit = 5
4. Generate meals → Limited to 5 again

---

## ⚠️ **Common Pitfalls & Solutions**

### **Problem: User bypasses limit**
**Cause:** Unprotected API endpoint
**Solution:** Every meal generation endpoint must call `getUsageStats()` and `useMealGeneration()`

### **Problem: Webhook doesn't update Firebase**
**Cause:** Webhook signature verification failed OR userId not in metadata
**Solution:** Check Stripe logs, verify webhook secret is correct, ensure userId is passed in checkout session

### **Problem: Free users have unlimited access**
**Cause:** `hasPremiumAccess()` returns true for everyone (this was the bug we fixed)
**Solution:** Properly check `subscription.isPremium && subscription.subscriptionStatus === 'active'`

### **Problem: Premium users hit limit**
**Cause:** `mealGenerationsLimit` not set to 999999 in webhook
**Solution:** Verify webhook handler sets limit to 999999 on checkout.session.completed

---

## 🎯 **Key Points**

1. **Firebase is source of truth** for subscription status
2. **Stripe webhooks update Firebase** automatically
3. **API routes check Firebase** before generating meals
4. **Usage counter increments** after successful generation
5. **Free tier resets** monthly on the 1st
6. **Premium tier is unlimited** (999,999 limit)
7. **All meal generation endpoints are protected**

---

## 📞 **Support Scenarios**

### User: "I'm premium but getting limit errors"
**Check:**
1. Firebase: Is isPremium = true?
2. Firebase: Is mealGenerationsLimit = 999999?
3. Stripe: Is subscription active?
4. Webhook: Did checkout.session.completed fire?

### User: "I hit 5 meals, when does it reset?"
**Answer:** Check `resetDate` in Firebase userSubscriptions doc. It's the 1st of next month.

### User: "I canceled but still have access"
**Explanation:** Stripe allows access until end of billing period. Check `currentPeriodEnd` in Firebase.

---

This is the complete freemium enforcement system. Every meal generation goes through this flow!
