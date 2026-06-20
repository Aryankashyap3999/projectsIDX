// pm2 process config for ProjectService.
//   Install: npm i -g pm2
//   Start:   pm2 start ecosystem.config.cjs
//   Persist: pm2 startup && pm2 save
// Reads env from the local .env via dotenv (loaded in serverConfig.js).
module.exports = {
  apps: [
    {
      name: "project-service",
      script: "src/index.js",
      cwd: __dirname,
      instances: 1, // keep at 1: it manages stateful Docker containers + sockets
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
