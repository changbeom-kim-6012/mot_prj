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
    // 환경별 API URL 설정
    let apiUrl;
    
    // 환경 변수 우선순위: API_URL > NEXT_PUBLIC_API_URL > 기본값
    if (process.env.API_URL) {
      apiUrl = process.env.API_URL;
    } else if (process.env.NEXT_PUBLIC_API_URL) {
      apiUrl = process.env.NEXT_PUBLIC_API_URL;
    } else {
      // 환경 변수가 없을 때 NODE_ENV 기반으로 설정
      const nodeEnv = process.env.NODE_ENV;
      if (nodeEnv === 'production') {
        apiUrl = 'http://www.motclub.co.kr';
      } else {
        // development 또는 기타 환경에서는 localhost 사용
        apiUrl = 'http://localhost:8084';
      }
    }
    
    console.log('=== API URL 설정 ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('API_URL:', process.env.API_URL);
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('최종 API URL:', apiUrl);
    console.log('==================');
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
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