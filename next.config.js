/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://ernsdev.iptime.org:8082/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 