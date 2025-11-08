'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (planType: 'monthly' | 'annual') => {
    if (!user) {
      router.push('/signin?redirect=/pricing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Get Stripe price ID from environment variables
      const priceId = planType === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;

      if (!priceId) {
        throw new Error('Stripe price ID not configured. Please contact support.');
      }

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          priceId,
          planType,
          email: user.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      billingCycle: 'forever',
      description: 'Perfect for trying out GLP-1 nutrition tracking',
      features: [
        '5 AI meal generations per month',
        'Nutrition goals calculator',
        'Recipe library access',
        'GLP-1 education resources',
        'Protein & fiber guide',
        'Basic meal planning'
      ],
      limitations: [
        'No meal logging',
        'No symptom tracking',
        'No shopping lists',
        'No meal reminders'
      ],
      cta: user ? 'Current Plan' : 'Get Started Free',
      ctaLink: user ? null : '/signup',
      ctaStyle: user
        ? 'bg-gray-200 text-gray-700 cursor-default'
        : 'bg-blue-600 text-white hover:bg-blue-700',
      popular: false,
      planType: null
    },
    {
      name: 'Premium',
      price: billingCycle === 'monthly' ? 9.99 : 99.99,
      billingCycle: billingCycle,
      savings: billingCycle === 'annual' ? 'Save $19.89/year (17% off)' : null,
      description: 'Everything you need for GLP-1 success',
      features: [
        '✨ Unlimited AI meal generations',
        '📝 Advanced meal logging with protein/fiber tracking',
        '📊 Symptom tracker with AI insights',
        '🛒 Smart shopping lists',
        '⏰ Meal commitment reminders',
        '📈 Nutrition trends & analytics',
        '🍽️ Personalized meal suggestions',
        '🎯 Goal tracking & progress monitoring',
        '💾 Unlimited recipe saves (cookbook)',
        '🔔 Priority support'
      ],
      limitations: [],
      cta: user ? 'Subscribe Now' : 'Sign Up to Subscribe',
      ctaLink: user ? null : '/signup',
      ctaStyle: 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700',
      popular: true,
      planType: billingCycle
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the support you need for your GLP-1 journey
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              disabled={loading}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              disabled={loading}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                plan.popular ? 'border-4 border-blue-500' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white text-center py-2 font-semibold">
                  ⭐ MOST POPULAR
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">
                      ${plan.price.toFixed(2)}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{plan.billingCycle === 'monthly' ? 'mo' : plan.billingCycle === 'annual' ? 'yr' : ''}
                    </span>
                  </div>
                  {plan.savings && (
                    <p className="text-green-600 font-medium mt-1">{plan.savings}</p>
                  )}
                </div>

                {/* CTA Button */}
                {plan.ctaLink ? (
                  <Link
                    href={plan.ctaLink}
                    className={`block w-full py-3 px-6 rounded-lg font-semibold transition-colors mb-6 text-center ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </Link>
                ) : plan.planType ? (
                  <button
                    onClick={() => handleSubscribe(plan.planType as 'monthly' | 'annual')}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors mb-6 ${plan.ctaStyle} ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Processing...' : plan.cta}
                  </button>
                ) : (
                  <button
                    disabled
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors mb-6 ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </button>
                )}

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <p className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                    What's Included:
                  </p>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="space-y-3 pt-6 border-t border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                      Not Included:
                    </p>
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        <span className="text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex justify-center items-center gap-2 text-sm text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secure payment processing powered by Stripe</span>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens when I hit my free meal generation limit?
              </h3>
              <p className="text-gray-600">
                You can still access the recipe library, calculator, and education resources.
                Your limit resets on the 1st of every month, or you can upgrade to Premium for unlimited generations.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can cancel anytime with no questions asked. You'll keep access until the end of your billing period.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What GLP-1 medications are supported?
              </h3>
              <p className="text-gray-600">
                Our app supports Ozempic, Wegovy, Mounjaro, Zepbound, Saxenda, and Victoza.
                The meal recommendations are optimized for all GLP-1 medications.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We don't offer refunds for partial months, but you can cancel at any time to prevent future charges.
                Contact support if you have special circumstances.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        {user && (
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
