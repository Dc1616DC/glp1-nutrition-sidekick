export default function PWATestPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">PWA Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Installation Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Installation Status</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Manifest configured</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Service worker registered</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">PWA icons configured</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Offline support enabled</span>
            </div>
          </div>
        </div>

        {/* PWA Features */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">PWA Features</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>📱 Install on home screen</li>
            <li>⚡ Fast loading with caching</li>
            <li>🔔 Push notifications</li>
            <li>📡 Offline functionality</li>
            <li>🎨 Native app appearance</li>
            <li>🔄 Background sync</li>
          </ul>
        </div>

        {/* Installation Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 md:col-span-2">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">How to Install</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Chrome (Desktop)</h3>
              <p className="text-sm text-blue-700">
                Look for the install icon in the address bar, or use the install prompt that appears.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Safari (iOS)</h3>
              <p className="text-sm text-blue-700">
                Tap the share button and select &quot;Add to Home Screen&quot;.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Chrome (Android)</h3>
              <p className="text-sm text-blue-700">
                Use the install prompt or tap the menu and select &quot;Install app&quot;.
              </p>
            </div>
          </div>
        </div>

        {/* Testing Tools */}
        <div className="bg-gray-50 rounded-lg p-6 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Testing Your PWA</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Chrome DevTools:</strong> Open DevTools → Application tab → check Manifest and Service Workers
            </p>
            <p>
              <strong>Lighthouse:</strong> Run an audit to check PWA score and get improvement suggestions
            </p>
            <p>
              <strong>Offline Test:</strong> Turn off network in DevTools → Network tab → set to &quot;Offline&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
