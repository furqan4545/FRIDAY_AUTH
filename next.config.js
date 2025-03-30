/** @type {import('next').NextConfig} */
module.exports = {
    eslint: {
      // Warning: This allows production builds to succeed even if your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    // Ensure webhook endpoint is properly handled
    async headers() {
      return [
        {
          source: '/api/webhooks/stripe',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'POST,OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: 'Content-Type,stripe-signature' },
          ],
        },
      ];
    },
  };