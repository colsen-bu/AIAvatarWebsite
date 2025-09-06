/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    // Disable ESLint during builds for now
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
