module.exports = {
  apps: [{
    name: "panelpulse",
    script: "npm",
    args: "run dev",
    cwd: "/home/mtnddev1/apps/panelpulse",
    env: {
      NODE_ENV: "development",
      PORT: 3000
    },
    watch: false,
    instances: 1,
    autorestart: true,
    max_memory_restart: "1G"
  }]
};