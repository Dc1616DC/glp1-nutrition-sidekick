'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function PricingPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

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
      cta: 'Current Plan',
      ctaStyle: 'bg-gray-200 text-gray-700 cursor-default',
      popular: false
    },
    {
      name: 'Premium',
      price: billingCycle === 'monthly' ? 9.99 : 99.99,
      billingCycle: billingCycle,
      savings: billingCycle === 'annual' ? '$19.89/year (17% off)' : null,
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
      cta: 'Coming Soon',
      ctaStyle: 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700',
      popular: true
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

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
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
                <button
                  disabled={plan.cta === 'Current Plan'}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors mb-6 ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </button>

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

        {/* Coming Soon Notice */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-3xl mx-auto">
          <div className="flex items-start">
            <div className="text-3xl mr-4">🚀</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Premium Launching Soon!
              </h3>
              <p className="text-blue-700 mb-4">
                We're putting the finishing touches on our premium features. Sign up for the free plan now and
                we'll notify you when premium launches. Early adopters will get special pricing!
              </p>
              {!user && (
                <Link
                  href="/signup"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get Started Free
                </Link>
              )}
            </div>
          </div>
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
                Your limit resets every month, or you can upgrade to Premium for unlimited generations.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes! When premium launches, you'll be able to cancel anytime with no questions asked.
                You'll keep access until the end of your billing period.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Will there be a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! Premium will include a 7-day free trial so you can test all features before committing.
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
