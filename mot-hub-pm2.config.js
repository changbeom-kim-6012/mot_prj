module.exports = {
  apps: [
    {
      name: "MOT_DEV",                  // PM2에서 식별할 이름
      script: "npm",
      args: "run startDev",              // 실행할 npm 스크립트
      cwd: "/var/lib/jenkins/workspace/mot-front",  // 작업 디렉토리
      env: {
        NODE_ENV: "development",
        PORT: 14000,
        NODE_OPTIONS: "--openssl-legacy-provider"
      },
      watch: false,
      autorestart: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "/data/app_data/erns/mot/hub/logs/err.log",
      out_file: "/data/app_data/erns/mot/hub/logs/out.log"
    }
  ]
}