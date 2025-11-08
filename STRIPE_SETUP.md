# Stripe Integration Setup Guide

This guide will walk you through setting up Stripe for your GLP-1 Nutrition Sidekick app.

## Overview

The Stripe integration allows you to:
- Accept monthly ($19.99/month) and annual ($199.99/year) subscriptions
- Automatically upgrade users to Premium when they subscribe
- Handle subscription renewals, cancellations, and payment failures
- Track subscription status in Firestore

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Access to your Vercel deployment
- Firebase project configured

---

## Step 1: Create Stripe Products & Prices

### 1.1 Sign in to Stripe Dashboard
Go to https://dashboard.stripe.com

### 1.2 Create Products

**Product 1: GLP-1 Nutrition Sidekick - Monthly**
1. Navigate to **Products** in the left sidebar
2. Click **+ Add product**
3. Fill in:
   - **Name**: GLP-1 Nutrition Sidekick - Monthly Premium
   - **Description**: Unlimited AI meal generations, advanced tracking, and premium features
   - **Pricing model**: Standard pricing
   - **Price**: $19.99
   - **Billing period**: Monthly (recurring every 1 month)
4. Click **Save product**
5. **COPY THE PRICE ID** (starts with `price_...`) - you'll need this!

**Product 2: GLP-1 Nutrition Sidekick - Annual**
1. Click **+ Add product** again
2. Fill in:
   - **Name**: GLP-1 Nutrition Sidekick - Annual Premium
   - **Description**: Unlimited AI meal generations, advanced tracking, and premium features (Save 17%)
   - **Pricing model**: Standard pricing
   - **Price**: $199.99
   - **Billing period**: Yearly (recurring every 12 months)
3. Click **Save product**
4. **COPY THE PRICE ID** (starts with `price_...`) - you'll need this!

---

## Step 2: Get Stripe API Keys

### 2.1 Get Secret Key
1. Go to https://dashboard.stripe.com/test/apikeys
2. Find **Secret key** (starts with `sk_test_...`)
3. Click **Reveal test key** and copy it
4. **IMPORTANT**: Keep this secret! Never commit to git.

### 2.2 Get Publishable Key
1. On the same page, find **Publishable key** (starts with `pk_test_...`)
2. Copy it

---

## Step 3: Configure Webhook Endpoint

### 3.1 Create Webhook
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **+ Add endpoint**
3. Enter endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Replace `your-app.vercel.app` with your actual Vercel domain
4. Click **Select events**
5. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**

### 3.2 Get Webhook Secret
1. Click on the webhook you just created
2. Find **Signing secret** (starts with `whsec_...`)
3. Click **Reveal** and copy it

---

## Step 4: Add Environment Variables

### 4.1 Local Development (.env.local)

Add these lines to your `.env.local` file:

```bash
# -------------------------------------
# Stripe Configuration
# -------------------------------------
STRIPE_SECRET_KEY="sk_test_..." # From Step 2.1
STRIPE_WEBHOOK_SECRET="whsec_..." # From Step 3.2

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # From Step 2.2
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID="price_..." # From Step 1.2 (Monthly)
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID="price_..." # From Step 1.2 (Annual)
NEXT_PUBLIC_APP_URL="http://localhost:3000" # For local development
```

### 4.2 Vercel Production Environment

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:

| Name | Value | Environment |
|------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | Production, Preview, Development |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID` | `price_...` | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID` | `price_...` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |

4. Click **Save** for each variable
5. **Redeploy your app** for changes to take effect

---

## Step 5: Test the Integration

### 5.1 Test Checkout Flow

1. Go to your pricing page: `https://your-app.vercel.app/pricing`
2. Sign in with a test account
3. Click **Subscribe Now** on the Premium plan
4. You'll be redirected to Stripe Checkout
5. Use test card: **4242 4242 4242 4242**
   - Any future expiration date (e.g., 12/34)
   - Any 3-digit CCV (e.g., 123)
   - Any zip code (e.g., 12345)
6. Complete checkout
7. You should be redirected to `/subscription/success`
8. Check your Firebase console - user subscription should be upgraded

### 5.2 Verify Webhook Processing

1. Go to https://dashboard.stripe.com/test/logs
2. You should see webhook events being sent
3. Check that `checkout.session.completed` shows as successful
4. Verify in Firebase that the user's subscription document was updated

### 5.3 Test Usage Limits

1. Generate 5 meals as a free user
2. The 6th attempt should be blocked
3. Subscribe to premium
4. After subscribing, meal generation should be unlimited

---

## Step 6: Going Live (Production)

### 6.1 Activate Stripe Account
1. Go to https://dashboard.stripe.com
2. Click **Activate your account**
3. Fill in business details, banking information, etc.

### 6.2 Create Live Products
1. Toggle from **Test mode** to **Live mode** (top right in Stripe dashboard)
2. Repeat Step 1 to create products in live mode
3. Get new live price IDs (start with `price_...`)

### 6.3 Get Live API Keys
1. Go to https://dashboard.stripe.com/apikeys (in live mode)
2. Get **Live secret key** (starts with `sk_live_...`)
3. Get **Live publishable key** (starts with `pk_live_...`)

### 6.4 Create Live Webhook
1. Repeat Step 3 in live mode
2. Get **Live webhook secret** (starts with `whsec_...`)

### 6.5 Update Environment Variables
1. Update all Vercel environment variables with LIVE keys
2. Keep test keys for Preview/Development environments
3. Redeploy

---

## How It Works

### User Flow:
1. User clicks **Subscribe Now** on pricing page
2. Frontend calls `/api/stripe/create-checkout-session` with Firebase auth token
3. API creates Stripe checkout session
4. User redirected to Stripe's hosted checkout page
5. User enters payment details
6. Stripe processes payment
7. Stripe redirects user to `/subscription/success`
8. Stripe sends webhook to `/api/stripe/webhook`
9. Webhook updates user's subscription in Firebase
10. User now has premium access

### Subscription Management:
- **New subscription**: Webhook sets `isPremium: true`, `mealGenerationsLimit: 999999`
- **Renewal**: Webhook updates `currentPeriodEnd`
- **Cancellation**: Webhook sets `isPremium: false`, `mealGenerationsLimit: 5`
- **Payment failure**: Webhook logs error (you can add custom logic)

---

## Troubleshooting

### Webhook not receiving events
- Check webhook URL is correct in Stripe dashboard
- Ensure webhook secret is correct in environment variables
- Check Vercel logs for errors
- Verify webhook events are selected correctly

### Checkout session creation fails
- Verify price IDs are correct
- Check Firebase auth token is being sent
- Ensure user is signed in
- Check Vercel logs for API errors

### Subscription not upgrading user
- Check webhook is processing successfully
- Verify Firebase permissions allow updates
- Check webhook handler logs
- Ensure `userId` metadata is being passed correctly

### Test payments not working
- Use Stripe test card: 4242 4242 4242 4242
- Ensure you're in TEST mode in Stripe
- Check you're using test API keys (sk_test_...)

---

## Security Notes

- ✅ Never commit API keys to git
- ✅ Use test keys for development
- ✅ Validate webhook signatures (already implemented)
- ✅ Verify user authentication before creating checkout sessions (already implemented)
- ✅ Store sensitive data server-side only
- ✅ Use HTTPS in production (Vercel handles this)

---

## Support

If you encounter issues:
1. Check Vercel logs: https://vercel.com/[your-team]/[your-project]/logs
2. Check Stripe logs: https://dashboard.stripe.com/test/logs
3. Check Firebase logs in the Firebase console
4. Review this setup guide again

For Stripe-specific questions, see: https://stripe.com/docs
