/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  // 개발 환경에서는 기본 .next 폴더 사용, 프로덕션에서만 dist 사용
  distDir: process.env.NODE_ENV === 'production' ? 'dist' : '.next',
  trailingSlash: false,
  // Workspace root 경고 해결: Frontend/mot 폴더를 루트로 명시
  outputFileTracingRoot: require('path').join(__dirname),
  // standalone 모드에서 public 폴더 포함
  outputFileTracingIncludes: {
    '/**': [
      'public/**/*',
    ],
  },
  typescript: {
    // 빌드 시 TypeScript 에러가 있어도 빌드를 계속 진행
    ignoreBuildErrors: true,
  },
  // 워커 에러 방지를 위한 설정
  experimental: {
    // 워커 스레드 비활성화 (단일 프로세스로 빌드)
    workerThreads: false,
    // CPU 코어 수 제한
    cpus: 1,
  },
  // Turbopack 설정 (Next.js 16에서 webpack과 함께 사용 시 필요)
  turbopack: {},
  // 빌드 최적화 설정
  swcMinify: true,
  // 컴파일러 캐시 비활성화 (에러 발생 시)
  // onDemandEntries: {
  //   maxInactiveAge: 25 * 1000,
  //   pagesBufferLength: 2,
  // },
  // Next.js 16에서는 eslint 설정이 next.config.js에서 제거됨
  // eslint 설정은 eslint.config.mjs 파일에서 관리
  
  // webpack 설정 (--webpack 플래그 사용 시에만 적용)
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
    
    // 1) node_modules 안의 .mjs를 "자바스크립트"로 강제 처리
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

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
        // 프로덕션에서는 외부 서버의 백엔드 API 사용
        apiUrl = 'http://www.motclub.co.kr';
      } else {
        // development 환경에서는 localhost 사용
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
};

module.exports = nextConfig; 