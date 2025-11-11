'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: January 20, 2025</p>

        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to GLP-1 Nutrition Sidekick ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application.
            </p>
            <p className="text-gray-700">
              By using GLP-1 Nutrition Sidekick, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 mb-4">When you create an account, we collect:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Authentication credentials</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Health & Nutrition Data</h3>
            <p className="text-gray-700 mb-4">With your consent, we collect:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Dietary preferences and restrictions</li>
              <li>Meal logging data (food consumed, nutrition values)</li>
              <li>Symptom tracking information</li>
              <li>Nutrition goals and targets</li>
              <li>GLP-1 medication type (if provided)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Usage Data</h3>
            <p className="text-gray-700 mb-4">We automatically collect:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Device information (browser type, operating system)</li>
              <li>Usage statistics (features used, pages visited)</li>
              <li>IP address and general location data</li>
              <li>Timestamps of interactions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.4 Cookies and Tracking</h3>
            <p className="text-gray-700 mb-4">We use:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Google Analytics for usage analytics</li>
              <li>Firebase Authentication cookies</li>
              <li>Session cookies for app functionality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Provide Services:</strong> Generate personalized meal recommendations, track nutrition, provide educational content</li>
              <li><strong>Improve User Experience:</strong> Analyze usage patterns to enhance features and functionality</li>
              <li><strong>Communication:</strong> Send meal reminders, service updates, and important notifications</li>
              <li><strong>Subscription Management:</strong> Process payments and manage premium features</li>
              <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
              <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. AI-Powered Features</h2>
            <p className="text-gray-700 mb-4">
              We use third-party AI services (OpenAI/Grok) to generate personalized meal recommendations. When you request meal suggestions:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Your dietary preferences and restrictions are sent to our AI provider</li>
              <li>No personally identifiable information (name, email) is shared with AI providers</li>
              <li>AI-generated content is not used to train external models</li>
              <li>All meal generation requests are processed through secure, encrypted connections</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">We DO NOT sell your personal data.</h3>

            <p className="text-gray-700 mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Service Providers:</strong> Firebase (hosting, authentication), Google Analytics (usage tracking), Stripe (payment processing), AI providers (meal generation)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to users)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>All data transmitted over HTTPS encryption</li>
              <li>Firebase Authentication with secure password hashing</li>
              <li>API keys and secrets stored server-side only</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication for all sensitive operations</li>
            </ul>
            <p className="text-gray-700">
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Receive your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Disable analytics, notifications, or marketing communications</li>
              <li><strong>Withdraw Consent:</strong> Revoke consent for data processing at any time</li>
            </ul>
            <p className="text-gray-700">
              To exercise these rights, visit your Account Settings or contact us at privacy@glp1nutritionsidekick.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your information for as long as your account is active or as needed to provide services. When you delete your account:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Personal data is deleted within 30 days</li>
              <li>Backup copies may persist for up to 90 days</li>
              <li>Anonymized usage data may be retained for analytics</li>
              <li>Legal or compliance data may be retained longer as required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700">
              Our service is not intended for children under 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Users</h2>
            <p className="text-gray-700">
              Your information may be transferred to and processed in the United States or other countries where our service providers operate. By using our service, you consent to such transfers. We ensure appropriate safeguards are in place for international data transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Third-Party Links</h2>
            <p className="text-gray-700">
              Our app may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Medical Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              <strong>Important:</strong> GLP-1 Nutrition Sidekick provides educational information and meal planning tools. It is NOT a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Always consult your healthcare provider before making dietary changes</li>
              <li>Do not disregard professional medical advice based on information from this app</li>
              <li>We do not provide medical advice or treatment recommendations</li>
              <li>Symptom tracking is for informational purposes only</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Significant changes will be communicated via email or in-app notification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none mb-4 text-gray-700">
              <li><strong>Email:</strong> privacy@glp1nutritionsidekick.com</li>
              <li><strong>Website:</strong> GLP-1 Nutrition Sidekick</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. California Privacy Rights (CCPA)</h2>
            <p className="text-gray-700 mb-4">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Right to know what personal information is collected, used, shared, or sold</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale of personal information (we do not sell your data)</li>
              <li>Right to non-discrimination for exercising your privacy rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. GDPR Compliance (EU Users)</h2>
            <p className="text-gray-700 mb-4">
              If you are located in the European Economic Area (EEA), you have rights under GDPR:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Right to access, rectification, and erasure</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
