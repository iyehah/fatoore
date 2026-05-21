/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@sparticuz/chromium', 'playwright-core'],
  // Trace only real Chromium binaries (not entire package tree — pnpm symlinks break Vercel deploy)
  outputFileTracingIncludes: {
    '/api/invoice': ['node_modules/@sparticuz/chromium/bin/**'],
  },
}

export default nextConfig
