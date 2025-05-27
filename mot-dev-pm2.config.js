module.exports = {
  apps: [
    {
      name: "MOT_DEV",                  // PM2에서 식별할 이름
      script: "npm",
      args: "run startDev",              // 실행할 npm 스크립트
      cwd: "/var/lib/jenkins/workspace/MOT_PRJ_DEV",  // 작업 디렉토리
      env: {
        NODE_ENV: "development",
        PORT: 13000,
        NODE_OPTIONS: "--openssl-legacy-provider"
      },
      watch: false,
      autorestart: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "/data/app_data/erns/mot/dev/logs/err.log",
      out_file: "/data/app_data/erns/mot/dev/logs/out.log"
    }
  ]
}