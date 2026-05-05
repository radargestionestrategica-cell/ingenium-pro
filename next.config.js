/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ['pdfkit'],
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data: https:",
      "connect-src 'self' https://api.anthropic.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',                      value: 'DENY' },
          { key: 'X-Content-Type-Options',               value: 'nosniff' },
          { key: 'Strict-Transport-Security',            value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Referrer-Policy',                      value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy',              value: csp },
          { key: 'Permissions-Policy',                   value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'X-Permitted-Cross-Domain-Policies',    value: 'none' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
