module.exports = {
  apps: [
    {
      name: "MOT_HUB",                  // PM2에서 식별할 이름
      script: "npm",
      args: "run startHub",              // 실행할 npm 스크립트 수정
      cwd: "/var/lib/jenkins/workspace/mot_front",  // 작업 디렉토리 수정
      env: {
        NODE_ENV: "production",
        PORT: 14000,
        HOSTNAME: "0.0.0.0",
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