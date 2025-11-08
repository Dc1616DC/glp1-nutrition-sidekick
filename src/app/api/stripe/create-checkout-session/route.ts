import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PLANS } from '../../../../lib/stripe';
import { verifyIdToken, isAdminInitialized } from '../../../../lib/firebase-admin';

/**
 * Verify user authentication
 */
async function verifyUser(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];

  if (isAdminInitialized()) {
    try {
      const decodedToken = await verifyIdToken(token);
      return decodedToken.uid;
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      return null;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyUser(request);

    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
        message: 'Please sign in to subscribe to Premium.'
      }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, planType } = body;

    // Validate plan type
    if (!priceId || !['monthly', 'annual'].includes(planType)) {
      return NextResponse.json({
        error: 'Invalid plan',
        message: 'Please select a valid subscription plan.'
      }, { status: 400 });
    }

    // Get the base URL for redirects
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      client_reference_id: userId, // Store Firebase user ID
      metadata: {
        userId: userId,
        planType: planType,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planType: planType,
        },
      },
      customer_email: body.email, // Optional: pre-fill email if available
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({
      error: 'Checkout failed',
      message: error instanceof Error ? error.message : 'An error occurred creating checkout session'
    }, { status: 500 });
  }
}
