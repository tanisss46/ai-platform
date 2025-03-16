/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // In production, we'll want to enable this
    // For development, ignoring type errors can be helpful
    ignoreBuildErrors: true,
  },
  eslint: {
    // In production, we'll want to enable this
    // For development, ignoring linting errors can be helpful
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    return config;
  },
}

module.exports = nextConfig
