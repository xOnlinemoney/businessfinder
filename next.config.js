/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@iconify/react', 'framer-motion', 'recharts'],
  },
  // Redirects
  async redirects() {
    return [
      {
        source: '/browse',
        destination: '/marketplace',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
