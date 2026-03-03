# MOT 로컬 개발 환경 자동 가동

이 스킬은 MOT 프로젝트 로컬 개발 환경을 **직접 실행**합니다.
2026-02-18 가동 성공 사례 기반.

---

## 실행 절차 (Claude가 직접 순서대로 실행)

### 1단계: 사전 조건 자동 점검

아래 명령을 **모두 실행**하여 결과를 사용자에게 보여주세요:

```bash
java -version
```
```bash
node -v
```
```bash
netstat -ano | findstr ":8285 :3005"
```

- Java 17+, Node.js 18+ 미설치 시 → 안내 후 중단
- 포트 충돌 시 → 사용 중인 PID를 알려주고 종료 여부 질문 (사용자 확인 후 `taskkill /PID <PID> /F`)

### 2단계: 백엔드 기동 (Spring Boot - 포트 8285)

**배치 파일을 백그라운드로 실행합니다:**

```bash
start "" cmd /c "C:\dev\start_backend_8285.bat"
```

실행 후 **약 15초 대기** 한 뒤 헬스 체크:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8285 2>nul || echo FAIL
```

- 응답 200 또는 HTML 반환 → ✅ 성공
- FAIL 또는 타임아웃 → ⚠️ 사용자에게 알림
  - 가능 원인: VPN 미연결 (DB서버 192.168.0.101 접근 불가), Gradle 빌드 실패
  - **프론트엔드만 단독 기동할지 사용자에게 질문**

### 3단계: 프론트엔드 기동 (Next.js - 포트 3005)

**배치 파일을 백그라운드로 실행합니다:**

```bash
start "" cmd /c "C:\dev\start_frontend_3005.bat"
```

실행 후 **약 10초 대기** 한 뒤 헬스 체크:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3005 2>nul || echo FAIL
```

- 응답 200 → ✅ 성공
- FAIL → ⚠️ 트러블슈팅 진행 (아래 문제 해결 섹션 참고)

### 4단계: 결과 리포트

모든 실행 완료 후 아래 형식으로 사용자에게 보고:

```
🚀 MOT 로컬 환경 가동 결과
━━━━━━━━━━━━━━━━━━━━━━━━━
Backend  (http://localhost:8285) : [성공/실패]
Frontend (http://localhost:3005) : [성공/실패]
━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 트러블슈팅 자동 대응

문제 발생 시 Claude가 **자동으로 진단하고 해결을 시도**합니다:

### 포트 충돌
```bash
netstat -ano | findstr ":8285"
netstat -ano | findstr ":3005"
```
→ 사용자 확인 후 `taskkill /PID <PID> /F` 실행

### TURBOPACK 충돌
프론트엔드 시작 실패 시 환경변수 확인:
```bash
echo %TURBOPACK%
```
→ 값이 있으면 `set TURBOPACK=` 후 재시작

### node_modules 오류
프론트엔드 시작 실패 시:
```bash
cd /d C:\dev\mot_prj && rmdir /s /q node_modules .next 2>nul && npm install
```
→ 재설치 후 3단계 재시도

### Gradle 빌드 실패
백엔드 시작 실패 시:
```bash
cd /d C:\dev\MOT_Club\Backend\mot && gradlew.bat clean build --stacktrace
```
→ 에러 로그 분석 후 사용자에게 보고

### DB 접속 불가 (VPN 문제)
백엔드 `Connect timed out` 발생 시:
```bash
ping 192.168.0.101 -n 2
```
→ 응답 없으면: "VPN 연결이 필요합니다. VPN 연결 후 백엔드를 재기동해주세요."

---

## 참조 정보

| 서비스 | 로컬 개발 포트 | Docker 포트 | 소스 경로 |
|--------|---------------|-------------|-----------|
| Backend (Spring Boot) | 8285 | 8080 | C:\dev\MOT_Club\Backend\mot |
| Frontend (Next.js) | 3005 | 3000 | C:\dev\mot_prj |
| PostgreSQL | 5432 | 5432 | Docker |
| Redis | 6379 | 6379 | Docker |

### 핵심 설정 파일
- 백엔드 properties: `C:\dev\MOT_Club\Backend\mot\src\main\resources\application.properties`
- 프론트엔드 env: `C:\dev\mot_prj\.env.local`
- 백엔드 배치: `C:\dev\start_backend_8285.bat`
- 프론트엔드 배치: `C:\dev\start_frontend_3005.bat`

### 성공 사례 기록 (2026-02-18)
- 프론트엔드(3005): 정상 가동 확인
- 백엔드(8285): 내부 네트워크/VPN 연결 시 정상 가동
- TURBOPACK= 빈 값 설정 필수 (--webpack 플래그 충돌 방지)
