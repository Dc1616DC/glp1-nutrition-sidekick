# Google Analytics Setup

## How to Add Your GA4 Measurement ID

1. **Create a Google Analytics 4 Property:**
   - Go to https://analytics.google.com
   - Create a new property (or use existing)
   - Get your Measurement ID (format: G-XXXXXXXXXX)

2. **Add to Your Environment Variables:**

   Add this line to your `.env.local` file:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

   Replace `G-XXXXXXXXXX` with your actual Measurement ID.

3. **Add to Vercel:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add: `NEXT_PUBLIC_GA_MEASUREMENT_ID` with your Measurement ID
   - Redeploy your app

4. **Verify It's Working:**
   - Open your deployed site
   - Open Chrome DevTools → Network tab
   - Filter for "google-analytics" or "gtag"
   - You should see requests being sent
   - Check Google Analytics Real-Time view

## What Gets Tracked

The current setup tracks:
- Page views
- Page navigation
- User sessions
- Referral sources

## Adding Custom Events

To track custom events (e.g., "Meal Generated", "Recipe Saved"), add this code:

```typescript
// Track custom event
if (typeof window !== 'undefined' && (window as any).gtag) {
  (window as any).gtag('event', 'meal_generated', {
    'event_category': 'engagement',
    'event_label': 'AI Meal Generator',
    'value': 1
  });
}
```

## Privacy Compliance

Remember to:
1. Add a privacy policy page
2. Add cookie consent banner (if required by your region)
3. Update your terms of service to mention analytics
