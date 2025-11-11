'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold text-blue-600 mb-2">GLP-1 Nutrition Sidekick</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your AI-powered nutrition companion for GLP-1 medication success.
              Personalized meal planning, tracking, and education.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Powered by AI • Built for GLP-1 Users</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/meal-generator" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  AI Meal Generator
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/education" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  GLP-1 Education
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Nutrition Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} GLP-1 Nutrition Sidekick. All rights reserved.
          </p>

          {/* Medical Disclaimer */}
          <div className="text-xs text-gray-500 text-center md:text-right max-w-md">
            ⚕️ Not medical advice. Consult your healthcare provider.
          </div>
        </div>
      </div>
    </footer>
  );
}
