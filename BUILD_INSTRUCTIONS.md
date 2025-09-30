# 빌드 및 실행 가이드

## 환경별 빌드 및 실행

### 로컬 환경 (localhost:8084)
```bash
# 빌드
npm run build:local

# 실행
npm run start:local
```

### 프로덕션 환경 (www.motclub.co.kr)
```bash
# 빌드
npm run build:prod

# 실행
npm run start:prod
```

## 개발 환경

### 로컬 개발
```bash
npm run dev:local
```

### 스테이징 개발
```bash
npm run dev:staging
```

### 프로덕션 개발
```bash
npm run dev:prod
```

## 환경 변수

빌드 시 자동으로 설정되는 환경 변수:

- **build:local**: `API_URL=http://localhost:8084`
- **build:prod**: `API_URL=http://www.motclub.co.kr`

## 확인 방법

빌드 시 콘솔에서 다음 로그를 확인할 수 있습니다:
```
=== API 환경 설정 ===
NODE_ENV: production
API_URL: http://localhost:8084 (또는 http://www.motclub.co.kr)
NEXT_PUBLIC_API_URL: undefined
최종 BASE_URL: http://localhost:8084 (또는 http://www.motclub.co.kr)
==================
```

## 주의사항

1. 빌드 시 환경 변수가 올바르게 설정되었는지 콘솔 로그를 확인하세요.
2. 프로덕션 빌드는 실제 서버 환경에서 테스트하세요.
3. API 서버가 해당 URL에서 실행 중인지 확인하세요.
