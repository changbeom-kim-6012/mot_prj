# 빌드 및 실행 가이드

**업데이트**: 2026-02-03
**프로젝트 위치**: c:\dev\mot_prj

---

## 시스템 요구사항

- **Node.js**: 18.x 이상
- **npm**: 10.x 이상
- **Next.js**: 16.0.1
- **React**: 18.3.1 (중요: React 19는 의존성 충돌 발생)

---

## 개발 환경 실행

### 1. 의존성 설치

```bash
cd c:\dev\mot_prj
npm install
```

### 2. 환경별 개발 서버 실행

#### 로컬 개발 (권장)
```bash
npm run dev:local
```
- 백엔드 연결: http://localhost:8084
- 프론트엔드 실행: http://localhost:3002
- **사전 조건**: 백엔드 서버가 8084 포트에서 실행 중이어야 함

#### 개발 서버 연결
```bash
npm run dev:dev
```
- 백엔드 연결: http://192.168.0.101:8084

#### 스테이징 개발
```bash
npm run dev:staging
```
- 백엔드 연결: http://www.motclub.co.kr

#### 프로덕션 개발
```bash
npm run dev:prod
```
- 백엔드 연결: http://www.motclub.co.kr

---

## 프로덕션 빌드 및 실행

### 환경별 빌드

#### 로컬 환경 빌드
```bash
npm run build:local
```
- API_URL: http://localhost:8084

#### 개발 서버 빌드
```bash
npm run build:dev
```
- API_URL: http://192.168.0.101:8084

#### 스테이징 빌드
```bash
npm run build:staging
```
- API_URL: http://www.motclub.co.kr

#### 프로덕션 빌드
```bash
npm run build:prod
```
- API_URL: http://www.motclub.co.kr
- 빌드 시간: 약 24.3초
- 결과물: `.next/standalone` 디렉토리

### 빌드 후 실행

#### 로컬 환경
```bash
npm run start:local
```

#### 프로덕션 환경
```bash
npm run start:prod
```

---

## 환경 변수

### 자동 설정되는 환경 변수

각 빌드/실행 스크립트는 다음 환경 변수를 자동으로 설정합니다:

| 스크립트 | API_URL | NEXT_PUBLIC_API_URL |
|---------|---------|---------------------|
| dev:local / build:local | http://localhost:8084 | http://localhost:8084 |
| dev:dev / build:dev | http://192.168.0.101:8084 | http://192.168.0.101:8084 |
| dev:staging / build:staging | http://www.motclub.co.kr | http://www.motclub.co.kr |
| dev:prod / build:prod | http://www.motclub.co.kr | http://www.motclub.co.kr |

### 빌드 최적화 설정

```bash
NODE_OPTIONS="--max-old-space-size=8192 --no-warnings"
NEXT_TELEMETRY_DISABLED=1
```

- **max-old-space-size**: Node.js 힙 메모리 8GB 할당
- **NEXT_TELEMETRY_DISABLED**: Next.js 원격 측정 비활성화

---

## 확인 방법

### 개발 서버 실행 확인

```
▲ Next.js 16.0.1
- Local:        http://localhost:3002
- Environments: API_URL=http://localhost:8084
- Ready in X.Xs
```

**브라우저 접속**: http://localhost:3002

### 빌드 성공 확인

```
Route (app)                              Size     First Load JS
┌ ○ /                                    X kB       XX kB
├ ○ /login                               X kB       XX kB
├ ● /admin                               X kB       XX kB
...

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML
```

### API 연결 확인

1. 브라우저 개발자 도구 (F12)
2. Network 탭
3. API 호출이 올바른 백엔드 URL로 전송되는지 확인

---

## 트러블슈팅

### 1. npm 명령어 인식 안됨

**증상**:
```
'npm' is not recognized as an internal or external command
```

**해결**:
1. Node.js 설치: https://nodejs.org/ (LTS 버전 권장)
2. 설치 시 "Add to PATH" 옵션 체크
3. 터미널 재시작

### 2. 의존성 충돌 오류

**증상**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve
```

**해결**:
```bash
# node_modules 및 package-lock.json 삭제
rm -rf node_modules package-lock.json

# 재설치
npm install
```

### 3. React 버전 충돌

**증상**:
```
Error: Package requires React 18, but React 19 is installed
```

**해결**:
현재 프로젝트는 React 18.3.1로 설정되어 있습니다. package.json 확인:
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

React 19로 업그레이드 시 다음 패키지와 충돌:
- `@headlessui/react@2.0.0` → React 18 이하 요구
- `framer-motion@11.0.0` → React 18 이하 요구
- `react-quill@2.0.0` → React 18 이하 요구

### 4. 빌드 메모리 부족

**증상**:
```
FATAL ERROR: Reached heap limit Allocation failed
```

**해결**:
빌드 스크립트에 이미 8GB 메모리 할당 설정되어 있음:
```bash
NODE_OPTIONS="--max-old-space-size=8192"
```

더 큰 메모리 필요 시 값 증가 (예: 16384 = 16GB)

### 5. 백엔드 연결 실패

**증상**: API 호출이 실패하거나 CORS 오류 발생

**확인 사항**:
1. 백엔드 서버 실행 중인지 확인:
   ```bash
   curl http://localhost:8084/actuator/health
   ```
2. CORS 설정 확인 (백엔드 application.properties):
   ```properties
   cors.allowed-origins=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:13000
   ```

---

## Docker 빌드 (선택사항)

### Dockerfile 사용

프로젝트에 Dockerfile이 포함되어 있습니다.

```bash
# Docker 이미지 빌드
docker build -t mot-frontend:latest .

# Docker 컨테이너 실행
docker run -p 3002:3002 mot-frontend:latest
```

### 다단계 빌드 구조

1. **deps 단계**: 프로덕션 의존성만 설치
2. **builder 단계**: Next.js 빌드 실행
3. **runner 단계**: 최소 용량 최종 이미지 생성

---

## 주의사항

### 개발 환경
1. ✅ 백엔드 서버가 먼저 실행되어야 함
2. ✅ 환경 변수가 올바른 백엔드 URL을 가리키는지 확인
3. ✅ Hot Reload 활성화 (코드 변경 시 자동 새로고침)

### 프로덕션 환경
1. ⚠️ 프로덕션 빌드는 실제 서버 환경에서 테스트 필수
2. ⚠️ API 서버가 해당 URL에서 실행 중인지 확인
3. ⚠️ `public` 폴더가 standalone 디렉토리로 복사되었는지 확인 (`copy-public` 스크립트)

---

## 빠른 참조

### 로컬 개발 시작 (권장)

```bash
# 1. 프로젝트 디렉토리 이동
cd c:\dev\mot_prj

# 2. 의존성 설치 (최초 1회)
npm install

# 3. 개발 서버 실행
npm run dev:local

# 4. 브라우저 접속
# http://localhost:3002
```

### 배포용 빌드

```bash
# 프로덕션 빌드
npm run build:prod

# 빌드 결과 실행
npm run start:prod
```

---

## 관련 문서

- [docs/02-아키텍처.md](docs/02-아키텍처.md) - Next.js 아키텍처 및 구조
- [UPDATE_GUIDE.md](UPDATE_GUIDE.md) - 패키지 업데이트 가이드
- [백엔드 로컬 설정](../MOT_Club/DOC/로컬_개발_환경_설정.md) - 백엔드 실행 가이드

---

**작성자**: Claude Sonnet 4.5
**최종 업데이트**: 2026-02-03
