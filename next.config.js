/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  output: 'standalone',
  distDir: 'dist',
  trailingSlash: false,
  typescript: {
    // 빌드 시 TypeScript 에러가 있어도 빌드를 계속 진행
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 시 ESLint 에러가 있어도 빌드를 계속 진행
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // PDF.js 워커 파일 처리
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://121.140.143.9:8082/api/:path*',
      },
    ];
  },

  webpack(config) {
    // 1) node_modules 안의 .mjs를 "자바스크립트"로 강제 처리
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    return config;
  },
};

module.exports = nextConfig; 