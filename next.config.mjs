/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@sparticuz/chromium', 'playwright-core'],
  outputFileTracingIncludes: {
    '/api/invoice': [
      'node_modules/@sparticuz/chromium/bin/**',
      'node_modules/playwright-core/browsers.json',
      'node_modules/playwright-core/package.json',
      'node_modules/playwright-core/lib/**',
    ],
  },
}

export default nextConfig
