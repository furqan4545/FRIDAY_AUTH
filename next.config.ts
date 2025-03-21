import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Other configuration options…
  devIndicators: {
    buildActivity: false, // This is valid here
  },
  eslint: {
    // This will allow production builds even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to succeed even if there are TypeScript errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
