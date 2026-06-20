# Deploying ProjectService (DigitalOcean droplet)

ProjectService spawns Docker containers via `dockerode` and serves Socket.IO,
so it needs a real VM with Docker daemon access — not a serverless/PaaS tier.

**Target:** DigitalOcean droplet, Ubuntu 24.04, **2 GB RAM**, region BLR1 (Bangalore).

---

## 1. Create the droplet
- Image: Ubuntu 24.04 LTS
- Plan: Basic, Regular, **2 GB / 1 CPU** (1 GB will OOM during `docker build`)
- Region: Bangalore (BLR1)
- Auth: add your SSH key
- After creation, note the public IP.

## 2. First login + a non-root deploy user
```bash
ssh root@<DROPLET_IP>
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy   # copy SSH key
```

## 3. Install Docker + Node 22
```bash
ssh deploy@<DROPLET_IP>
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker deploy        # log out/in afterwards so it applies
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.nvm/nvm.sh && nvm install 22 && nvm alias default 22
node -v && docker run --rm hello-world   # verify both
```

## 4. Get the code + build the sandbox image
```bash
git clone https://github.com/Aryankashyap3999/projectsIDX.git ~/app
cd ~/app/ProjectService
docker build -t projectsidx-sandbox .   # uses ./Dockerfile
npm install
```

## 5. Configure env
```bash
cp .env.example .env
nano .env
# PORT=3001
# REACT_PROJECT_COMMAND=npm run dev
# CORS_ORIGIN=https://<your-frontend>.vercel.app
```

## 6. Run under pm2
```bash
npm i -g pm2
pm2 start ecosystem.config.cjs
pm2 startup systemd        # run the command it prints
pm2 save
pm2 logs project-service   # confirm "Server is running on port 3001"
```
(Alternative: use `deploy/project-service.service` with systemd instead of pm2.)

## 7. Domain + HTTPS (Nginx + Certbot)
Point an A record (e.g. `api.yourdomain.com`) at the droplet IP, then:
```bash
sudo apt install -y nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/project-service
# edit it: replace your-domain.com with api.yourdomain.com
sudo ln -s /etc/nginx/sites-available/project-service /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```
The nginx config already forwards WebSocket upgrades (Socket.IO / xterm).

## 8. Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # 80 + 443
sudo ufw enable
```
Do NOT expose 3001 publicly — only Nginx talks to it on localhost.

## 9. Wire the frontend
Set in Vercel: `VITE_BACKEND_URL=https://api.yourdomain.com`, then redeploy.

## Updating later
```bash
cd ~/app && git pull
cd ProjectService && npm install
pm2 restart project-service
```
