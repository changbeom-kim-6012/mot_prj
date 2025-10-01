#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 환경별 API URL 설정
const environments = {
  local: 'http://localhost:8084',
  dev: 'http://192.168.0.101:8084',
  staging: 'http://www.motclub.co.kr',
  production: 'http://www.motclub.co.kr'
};

// 환경 변수 설정
const env = process.argv[2] || 'local';
const apiUrl = environments[env];

if (!apiUrl) {
  console.error(`❌ 지원하지 않는 환경: ${env}`);
  console.log('사용 가능한 환경: local, dev, staging, production');
  process.exit(1);
}

console.log(`🔧 환경 설정: ${env}`);
console.log(`🌐 API URL: ${apiUrl}`);

// .env 파일 생성
const envContent = `# ${env.toUpperCase()} 환경 설정
NEXT_PUBLIC_API_URL=${apiUrl}
API_URL=${apiUrl}
NODE_ENV=${env === 'production' ? 'production' : 'development'}
`;

fs.writeFileSync('.env.local', envContent);
console.log('✅ .env.local 파일이 생성되었습니다.');

// package.json의 스크립트 실행을 위한 환경 변수 설정
process.env.API_URL = apiUrl;
process.env.NEXT_PUBLIC_API_URL = apiUrl;

console.log('🚀 다음 명령어로 실행하세요:');
console.log(`  npm run dev:${env}`);
console.log(`  npm run build:${env}`);
