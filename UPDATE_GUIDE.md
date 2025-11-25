# 패키지 업데이트 가이드

## 단계별 업데이트 방법

### 1단계: 현재 버전 확인
```powershell
cd C:\A-Cursor\MOT_Club\Frontend\mot
npm list next
```

### 2단계: 의존성 패키지 업데이트 (안전한 방법)
```powershell
# package.json의 버전 범위 내에서만 업데이트 (권장)
npm update
```

### 3단계: Next.js 최신 버전 확인
```powershell
# Next.js 최신 버전 확인
npm view next version
```

### 4단계: Next.js 업그레이드 (선택사항)
```powershell
# Next.js를 최신 버전으로 업그레이드
npm install next@latest react@latest react-dom@latest

# 또는 특정 버전으로 업그레이드 (예: 14.2.0)
npm install next@14.2.0 react@18.3.0 react-dom@18.3.0
```

### 5단계: 관련 패키지도 함께 업데이트
```powershell
# eslint-config-next도 함께 업데이트
npm install eslint-config-next@latest

# TypeScript 타입 정의 업데이트
npm install --save-dev @types/node@latest @types/react@latest @types/react-dom@latest
```

### 6단계: 업데이트 후 확인
```powershell
# 업데이트된 버전 확인
npm list next react react-dom

# 빌드 테스트
npm run build
```

## 주의사항

⚠️ **중요**: Next.js를 업그레이드하기 전에:
1. 현재 코드가 정상 작동하는지 확인
2. Git에 커밋하여 백업
3. 업그레이드 후 테스트 필수

## 현재 버전 정보
- Next.js: 14.0.4
- React: 18.2.0
- React DOM: 18.2.0

## 최신 안정 버전 (2024년 기준)
- Next.js: 14.2.x (권장)
- React: 18.3.x (권장)












