# Docker Deployment Guide

## 🐳 What is Docker?

Docker packages your bot into a "container" - a self-contained unit that runs the same way everywhere. Think of it as a box with everything the bot needs inside.

---

## 📋 Prerequisites

### Install Docker on VPS

**On Ubuntu/Debian VPS:**
```bash
# Update system
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Upload Files to VPS

**From your local machine:**
```bash
# Upload all files to VPS
scp -r * root@YOUR_VPS_IP:/root/tennis-bot/

# Or use Git
ssh root@YOUR_VPS_IP
cd /root
git clone YOUR_REPO_URL tennis-bot
cd tennis-bot
```

### Step 2: Configure Environment

**On VPS:**
```bash
cd /root/tennis-bot

# Make sure .env file exists with correct values
nano .env
```

Verify these settings:
```bash
EMAIL=glenferrand@icloud.com
PASSWORD=Tennismb1!
HEADLESS=true
DEV_MODE=false
TEST_MODE=false
```

### Step 3: Start the Bot

**On VPS:**
```bash
# Build and start the container
docker-compose up -d

# Check if it's running
docker-compose ps

# View logs
docker-compose logs -f tennis-bot
```

**That's it!** The bot is now running 24/7 in Docker! 🎉

---

## 📊 Managing the Bot

### View Logs (Real-time)
```bash
docker-compose logs -f tennis-bot
```
Press `Ctrl+C` to exit.

### View Last 100 Lines
```bash
docker-compose logs --tail=100 tennis-bot
```

### Check Status
```bash
docker-compose ps
```

### Restart Bot
```bash
docker-compose restart tennis-bot
```

### Stop Bot
```bash
docker-compose stop tennis-bot
```

### Start Bot
```bash
docker-compose start tennis-bot
```

### Stop and Remove Container
```bash
docker-compose down
```

### Rebuild After Code Changes
```bash
# Stop container
docker-compose down

# Rebuild image
docker-compose build

# Start again
docker-compose up -d
```

---

## 🔄 Updating the Bot

### Method 1: Upload New Files
```bash
# From local machine
scp -r * root@YOUR_VPS_IP:/root/tennis-bot/

# On VPS
cd /root/tennis-bot
docker-compose down
docker-compose build
docker-compose up -d
```

### Method 2: Using Git
```bash
# On VPS
cd /root/tennis-bot
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 🐛 Troubleshooting

### Bot Not Starting
```bash
# Check logs for errors
docker-compose logs tennis-bot

# Check if container is running
docker ps -a
```

### View Container Details
```bash
docker-compose ps
docker inspect tennis-booking-bot
```

### Enter Container Shell
```bash
docker exec -it tennis-booking-bot /bin/bash
```

### Remove Everything and Start Fresh
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```

---

## 📁 File Structure

```
tennis-bot/
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker orchestration
├── .dockerignore          # Files to exclude from image
├── .env                   # Environment variables
├── package.json           # Node.js dependencies
├── booking-bot.js         # Main bot logic
├── scheduler.js           # Scheduling logic
├── config.js              # Configuration loader
└── logs/                  # Log files (created automatically)
```

---

## ✅ Advantages of Docker

1. **Consistent Environment** - Runs the same everywhere
2. **Easy Deployment** - One command to start
3. **Isolated** - Doesn't affect other VPS services
4. **Auto-Restart** - Restarts if it crashes
5. **Easy Updates** - Rebuild and restart
6. **Portable** - Move to any server easily

---

## 🆚 Docker vs PM2

| Feature | Docker | PM2 |
|---------|--------|-----|
| Setup | More complex | Simpler |
| Isolation | Full isolation | Shared environment |
| Portability | Very portable | Less portable |
| Resource Usage | Slightly more | Slightly less |
| Learning Curve | Steeper | Easier |

**Both work great!** Choose based on your preference.

---

## 🎯 Production Checklist

- [ ] Docker installed on VPS
- [ ] Files uploaded to VPS
- [ ] .env configured correctly
- [ ] HEADLESS=true in .env
- [ ] DEV_MODE=false in .env
- [ ] TEST_MODE=false in .env
- [ ] Container built: `docker-compose build`
- [ ] Container started: `docker-compose up -d`
- [ ] Logs show "Next booking attempt scheduled"
- [ ] Bot runs at 6:00 AM PST daily

---

## 💡 Quick Commands Reference

```bash
# Start bot
docker-compose up -d

# View logs
docker-compose logs -f tennis-bot

# Stop bot
docker-compose down

# Restart bot
docker-compose restart tennis-bot

# Rebuild after changes
docker-compose up -d --build

# Check status
docker-compose ps

# View last 50 lines
docker-compose logs --tail=50 tennis-bot
```

---

## 🔒 Security Notes

1. **Never commit .env** - Already in .gitignore
2. **Keep Docker updated** - `sudo apt update && sudo apt upgrade`
3. **Use strong passwords** - For VPS and credentials
4. **Backup .env file** - Keep a secure copy

---

## 🆘 Need Help?

### Common Issues:

**"Cannot connect to Docker daemon"**
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

**"Port already in use"**
```bash
docker-compose down
docker ps -a
docker rm -f $(docker ps -aq)
```

**"Out of disk space"**
```bash
docker system prune -a
```

---

## 📞 Support

If you encounter issues:
1. Check logs: `docker-compose logs tennis-bot`
2. Verify .env settings
3. Ensure Docker is running: `docker ps`
4. Try rebuilding: `docker-compose up -d --build`

Your bot is now running in Docker! 🐳🎾
