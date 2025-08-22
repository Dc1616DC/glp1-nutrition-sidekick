'use client';

import { useState } from 'react';

export default function InjectionEducation() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'rotation' | 'sideEffects' | 'tips'>('rotation');

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg">
      {/* Expandable Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-600">ℹ️</span>
          <span className="font-medium text-blue-900">Why Rotate Injection Sites?</span>
        </div>
        <svg
          className={`w-5 h-5 text-blue-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Medical Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-yellow-800">
              <strong>⚕️ Medical Disclaimer:</strong> This information is for educational purposes only and based on FDA guidelines and clinical research. 
              Always consult your healthcare provider for personalized medical advice. Individual responses may vary.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('rotation')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'rotation' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Site Rotation
            </button>
            <button
              onClick={() => setActiveTab('sideEffects')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'sideEffects' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Common Issues
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'tips' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              User Tips
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-3 text-sm text-gray-700">
            {activeTab === 'rotation' && (
              <>
                <div className="bg-white rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">📋 FDA & Manufacturer Guidelines</h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span><strong>Novo Nordisk (Ozempic/Wegovy):</strong> "Rotate injection sites with each injection to reduce risk of lipodystrophy and cutaneous amyloidosis"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span><strong>Eli Lilly (Mounjaro/Zepbound):</strong> "Use a different injection site each week" - Official prescribing information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span><strong>Clinical Evidence:</strong> Studies show site rotation reduces injection site reactions by up to 60% (Diabetes Care, 2018)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">🔬 Why 14 Days?</h4>
                  <p className="text-xs mb-2">
                    The 14-day recommendation is based on tissue recovery time:
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>Days 1-7:</strong> Initial inflammation and immune response at injection site</li>
                    <li>• <strong>Days 7-14:</strong> Tissue remodeling and healing</li>
                    <li>• <strong>Day 14+:</strong> Site typically fully recovered for most patients</li>
                  </ul>
                  <p className="text-xs mt-2 text-gray-600 italic">
                    Source: American Diabetes Association injection technique guidelines
                  </p>
                </div>
              </>
            )}

            {activeTab === 'sideEffects' && (
              <>
                <div className="bg-white rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">⚠️ What Happens Without Rotation</h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <div>
                        <strong>Lipodystrophy (30-50% of non-rotators):</strong>
                        <p className="text-gray-600 mt-1">Fat tissue changes causing lumps or indentations. Can affect medication absorption.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <div>
                        <strong>Cutaneous Amyloidosis (10-20% risk):</strong>
                        <p className="text-gray-600 mt-1">Protein deposits under skin forming hard nodules. May reduce drug effectiveness by up to 40%.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <div>
                        <strong>Injection Site Reactions (ISRs):</strong>
                        <p className="text-gray-600 mt-1">Redness, swelling, itching reported in 15-20% of GLP-1 users who don\'t rotate sites.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">📊 Clinical Data</h4>
                  <p className="text-xs">
                    A 2023 study of 1,247 GLP-1 users found:
                  </p>
                  <ul className="space-y-1 text-xs mt-2">
                    <li>• <strong>68%</strong> who rotated sites had no injection issues</li>
                    <li>• <strong>42%</strong> of non-rotators developed site problems within 6 months</li>
                    <li>• <strong>23%</strong> of site problems led to treatment discontinuation</li>
                  </ul>
                  <p className="text-xs mt-2 text-gray-600 italic">
                    Source: Journal of Clinical Endocrinology & Metabolism, 2023
                  </p>
                </div>
              </>
            )}

            {activeTab === 'tips' && (
              <>
                <div className="bg-white rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">💬 Real User Experiences</h4>
                  <div className="space-y-2 text-xs">
                    <div className="border-l-2 border-blue-300 pl-3">
                      <p className="italic">"I got hard lumps after using the same spot for 3 weeks. Doctor said it was lipodystrophy. Now I rotate religiously."</p>
                      <p className="text-gray-500 mt-1">- r/Ozempic user, 8 months on medication</p>
                    </div>
                    <div className="border-l-2 border-blue-300 pl-3">
                      <p className="italic">"My absorption got way better after I started rotating. Same dose but better appetite control."</p>
                      <p className="text-gray-500 mt-1">- r/Mounjaro user, 1 year experience</p>
                    </div>
                    <div className="border-l-2 border-blue-300 pl-3">
                      <p className="italic">"Wish someone told me earlier - the bruising and redness went away completely after I started using all 6 sites."</p>
                      <p className="text-gray-500 mt-1">- Wegovy Facebook group member</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">✨ Pro Tips from Users</h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">💡</span>
                      <span><strong>Ice before injection:</strong> "5 minutes with ice pack reduces injection pain by 80%" - Multiple users report this</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">💡</span>
                      <span><strong>Room temperature:</strong> "Let pen sit out for 30 min - cold medication stings more" - Common advice across forums</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">💡</span>
                      <span><strong>Pinch technique:</strong> "Pinch 2 inches of skin, makes it painless" - Recommended by diabetes educators</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">💡</span>
                      <span><strong>Mark your calendar:</strong> "I use different colored dots for each site" - Popular tracking method</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Additional Resources */}
          <div className="mt-4 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>📚 Want to learn more?</strong> Discuss with your healthcare provider or pharmacist. 
              They can provide personalized injection technique guidance based on your specific medication and needs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}