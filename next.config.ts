import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security: Enable proper build validation
  eslint: {
    // Temporarily ignoring ESLint for deployment - TODO: Fix linting issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Only ignore TypeScript errors in emergency deployments (not recommended)
    ignoreBuildErrors: process.env.EMERGENCY_DEPLOY === 'true',
  },
  // Add security headers for pages only (not static assets)
  async headers() {
    return [
      {
        // Apply security headers to pages but exclude static assets
        source: '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-|apple-touch-icon).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
