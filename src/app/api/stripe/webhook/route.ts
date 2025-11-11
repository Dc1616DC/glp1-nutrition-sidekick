import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_EVENTS } from '../../../../lib/stripe';
import { getFirestore, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../../../../firebase/config';
import Stripe from 'stripe';

const db = getFirestore(app);

// Disable body parsing for webhooks
export const runtime = 'nodejs';

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id;

  if (!userId) {
    console.error('No user ID found in checkout session');
    return;
  }

  console.log(`Checkout completed for user: ${userId}`);

  // Get subscription details
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update user subscription in Firestore
  const subscriptionRef = doc(db, 'userSubscriptions', userId);
  await setDoc(subscriptionRef, {
    userId,
    isPremium: true,
    subscriptionType: 'premium',
    subscriptionStatus: 'active',
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: subscription.items.data[0].price.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    mealGenerationsUsed: 0,
    mealGenerationsLimit: 999999, // Unlimited for premium
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log(`Upgraded user ${userId} to premium`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No user ID found in subscription metadata');
    return;
  }

  console.log(`Subscription updated for user: ${userId}, status: ${subscription.status}`);

  const subscriptionRef = doc(db, 'userSubscriptions', userId);
  await updateDoc(subscriptionRef, {
    subscriptionStatus: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    updatedAt: serverTimestamp()
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No user ID found in subscription metadata');
    return;
  }

  console.log(`Subscription canceled for user: ${userId}`);

  // Downgrade to free tier
  const nextResetDate = new Date();
  nextResetDate.setMonth(nextResetDate.getMonth() + 1);
  nextResetDate.setDate(1);
  nextResetDate.setHours(0, 0, 0, 0);

  const subscriptionRef = doc(db, 'userSubscriptions', userId);
  await updateDoc(subscriptionRef, {
    isPremium: false,
    subscriptionType: 'free',
    subscriptionStatus: 'canceled',
    mealGenerationsUsed: 0,
    mealGenerationsLimit: 5, // Back to free tier limit
    resetDate: nextResetDate,
    updatedAt: serverTimestamp()
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({
      error: 'Webhook signature verification failed'
    }, { status: 400 });
  }

  try {
    // Handle different event types
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.CHECKOUT_COMPLETED:
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        console.log('Subscription created:', event.data.object);
        // Handled by checkout.session.completed
        break;

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAID:
        console.log('Invoice paid:', event.data.object);
        // You can add additional logic here if needed
        break;

      case STRIPE_WEBHOOK_EVENTS.INVOICE_FAILED:
        console.log('Invoice payment failed:', event.data.object);
        // You can add logic to notify users or update status
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({
      error: 'Webhook processing failed'
    }, { status: 500 });
  }
}
