'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last Updated: January 20, 2025</p>

        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              Welcome to GLP-1 Nutrition Sidekick. By accessing or using our web application ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p className="text-gray-700">
              These Terms constitute a legally binding agreement between you and GLP-1 Nutrition Sidekick ("we," "us," or "our").
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              GLP-1 Nutrition Sidekick is a nutrition planning and tracking application designed to help individuals using GLP-1 medications optimize their dietary intake. Our Service provides:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>AI-powered meal recommendations optimized for GLP-1 medication users</li>
              <li>Nutrition tracking (protein, fiber, calories)</li>
              <li>Meal logging and planning tools</li>
              <li>Symptom tracking</li>
              <li>Educational resources about GLP-1 medications and nutrition</li>
              <li>Recipe library and shopping list features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Medical Disclaimer</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-gray-800 font-semibold mb-2">IMPORTANT MEDICAL DISCLAIMER:</p>
              <p className="text-gray-700 mb-2">
                GLP-1 Nutrition Sidekick is NOT a medical device and does NOT provide medical advice, diagnosis, or treatment.
              </p>
            </div>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>This Service is for informational and educational purposes only</li>
              <li>Always consult your healthcare provider before making dietary changes or medication adjustments</li>
              <li>Do not disregard professional medical advice or delay seeking it because of information from this Service</li>
              <li>If you experience a medical emergency, call 911 or your local emergency number immediately</li>
              <li>Symptom tracking is for personal record-keeping only and should be shared with your healthcare provider</li>
              <li>AI-generated meal recommendations are suggestions, not medical prescriptions</li>
              <li>Individual nutritional needs vary; consult a registered dietitian for personalized advice</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              BY USING THIS SERVICE, YOU ACKNOWLEDGE THAT YOU UNDERSTAND THIS IS NOT MEDICAL ADVICE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Accounts</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Account Creation</h3>
            <p className="text-gray-700 mb-4">To use certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be at least 18 years of age</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Account Responsibility</h3>
            <p className="text-gray-700">
              You are responsible for all activities that occur under your account. We are not liable for any loss or damage arising from your failure to maintain account security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription Plans</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Free Plan</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Limited to 5 AI meal generations per month</li>
              <li>Access to basic features (calculator, education, recipe library)</li>
              <li>No access to premium features (meal logging, symptom tracking, unlimited AI generations)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Premium Plan</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Unlimited AI meal generations</li>
              <li>Full access to meal logging, symptom tracking, shopping lists</li>
              <li>Advanced analytics and insights</li>
              <li>Pricing: $9.99/month or $99.99/year (billed annually)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Payment Terms</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Premium subscriptions are billed in advance on a recurring basis</li>
              <li>Payments are processed through Stripe, a third-party payment processor</li>
              <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
              <li>You can cancel anytime; cancellation takes effect at the end of the current billing period</li>
              <li>No refunds for partial months or unused features</li>
              <li>We reserve the right to change pricing with 30 days notice to existing subscribers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Acceptable Use Policy</h2>
            <p className="text-gray-700 mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Share your account credentials with others</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Use automated systems (bots, scrapers) to access the Service</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Upload malicious code, viruses, or harmful data</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use the Service to distribute spam or unsolicited messages</li>
              <li>Violate the privacy rights of others</li>
              <li>Use AI-generated content for commercial purposes without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property Rights</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Our Content</h3>
            <p className="text-gray-700 mb-4">
              The Service and its original content, features, and functionality are owned by GLP-1 Nutrition Sidekick and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Your Content</h3>
            <p className="text-gray-700 mb-4">
              You retain ownership of any content you submit (meal logs, symptom data, notes). By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, and process your content to provide the Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 AI-Generated Content</h3>
            <p className="text-gray-700">
              Meal recommendations generated by AI are provided for your personal use. We do not claim ownership of AI-generated meal suggestions, but you may not resell or redistribute them commercially.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Our collection and use of personal information is described in our{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference.
            </p>
            <p className="text-gray-700">
              By using the Service, you consent to our collection, use, and sharing of your information as described in the Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              Our Service integrates with third-party services:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Firebase:</strong> Authentication and data storage</li>
              <li><strong>Google Analytics:</strong> Usage analytics</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>OpenAI/Grok:</strong> AI meal generation</li>
              <li><strong>Spoonacular:</strong> Recipe data</li>
            </ul>
            <p className="text-gray-700">
              We are not responsible for the practices of these third-party services. Your use of them is subject to their respective terms and privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers and Limitations of Liability</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 Service "AS IS"</h3>
            <p className="text-gray-700 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 No Guarantees</h3>
            <p className="text-gray-700 mb-4">We do not guarantee that:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>The Service will be uninterrupted, secure, or error-free</li>
              <li>Results from using the Service will be accurate or reliable</li>
              <li>AI-generated meal recommendations will meet your specific needs</li>
              <li>Nutritional data will be 100% accurate</li>
              <li>The Service will help you achieve health or weight goals</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.3 Limitation of Liability</h3>
            <p className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p className="text-gray-700">
              OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM (OR $100 IF YOU HAVE NOT PAID US).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-700">
              You agree to defend, indemnify, and hold us harmless from any claims, liabilities, damages, losses, and expenses arising from: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any rights of another party; or (d) any health outcomes resulting from following meal recommendations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">12.1 Termination by You</h3>
            <p className="text-gray-700 mb-4">
              You may terminate your account at any time through Account Settings. Upon termination:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Your subscription will continue until the end of the current billing period</li>
              <li>Your data will be deleted within 30 days (see Privacy Policy for details)</li>
              <li>No refunds will be provided for unused time</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">12.2 Termination by Us</h3>
            <p className="text-gray-700 mb-4">
              We may suspend or terminate your access immediately, without notice, for:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>At our sole discretion for any reason</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Posting the updated Terms on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending email notification for significant changes</li>
            </ul>
            <p className="text-gray-700">
              Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law and Disputes</h2>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law provisions.
            </p>
            <p className="text-gray-700 mb-4">
              Any disputes arising from these Terms or the Service shall be resolved through:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Good faith negotiation</li>
              <li>Binding arbitration if negotiation fails</li>
              <li>Small claims court (if eligible)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Severability</h2>
            <p className="text-gray-700">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Entire Agreement</h2>
            <p className="text-gray-700">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and GLP-1 Nutrition Sidekick regarding the Service and supersede all prior agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms, please contact us:
            </p>
            <ul className="list-none mb-4 text-gray-700">
              <li><strong>Email:</strong> support@glp1nutritionsidekick.com</li>
              <li><strong>Legal:</strong> legal@glp1nutritionsidekick.com</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">18. Acknowledgment</h2>
            <p className="text-gray-700 font-semibold">
              BY USING GLP-1 NUTRITION SIDEKICK, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </Link>
          <Link
            href="/privacy"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
