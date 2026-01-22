# Complete VPS Deployment Guide - Hetzner CPX11

## 🎯 Overview

This guide shows you exactly how to deploy the Tennis Court Booking Bot on a Hetzner CPX11 VPS and keep it running 24/7.

---

## 📋 Step 1: Create Hetzner CPX11 VPS

### 1.1 Login to Hetzner
- Go to: https://console.hetzner.cloud/
- Login with your credentials
- Click "Console" from dropdown

### 1.2 Create Server
1. Click "New Project" or select existing project
2. Click "Add Server"
3. **Configure:**
   - **Location:** Ashburn, VA (closest to California)
   - **Image:** Ubuntu 22.04
   - **Type:** CPX11 (2 vCPU, 2GB RAM) - €4.51/month
   - **SSH Key:** Add your SSH key (or use password)
   - **Name:** tennis-bot
4. Click "Create & Buy Now"

### 1.3 Get Server Details
- **IP Address:** Copy this (e.g., 123.45.67.89)
- **Root Password:** Check your email (if no SSH key)

---

## 📋 Step 2: Connect to VPS

### From Your Local Machine:

```bash
# Connect via SSH
ssh root@YOUR_SERVER_IP

# Example:
ssh root@123.45.67.89

# Enter password when prompted (if using password auth)
```

You should see:
```
Welcome to Ubuntu 22.04.3 LTS
root@tennis-bot:~#
```

---

## 📋 Step 3: Setup VPS Environment

### 3.1 Update System
```bash
apt update && apt upgrade -y
```

### 3.2 Install Node.js 20.x
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 3.3 Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### 3.4 Install Playwright Dependencies
```bash
apt install -y \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libdbus-1-3 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2
```

---

## 📋 Step 4: Upload Bot Files to VPS

### Method 1: Using SCP (Recommended)

**From your local machine** (in your project folder):

```bash
# Upload all files to VPS
scp -r * root@YOUR_SERVER_IP:/root/tennis-bot/

# Example:
scp -r * root@123.45.67.89:/root/tennis-bot/
```

### Method 2: Using Git

**On VPS:**
```bash
cd /root
git clone YOUR_PRIVATE_REPO_URL tennis-bot
cd tennis-bot
```

### Method 3: Manual Upload via SFTP

Use FileZilla, Cyberduck, or WinSCP:
- Host: YOUR_SERVER_IP
- Username: root
- Password: (your password)
- Port: 22
- Upload all files to `/root/tennis-bot/`

---

## 📋 Step 5: Install Dependencies on VPS

**On VPS:**

```bash
# Navigate to project directory
cd /root/tennis-bot

# Install Node.js dependencies
npm install

# Install Playwright Chromium browser
npx playwright install chromium

# Install Playwright system dependencies
npx playwright install-deps chromium
```

---

## 📋 Step 6: Configure for Production

### 6.1 Edit .env File

**On VPS:**
```bash
nano /root/tennis-bot/.env
```

**Update these settings for production:**
```bash
# Change these to production values:
HEADLESS=true        # ← Change from false to true
SLOW_MO=0           # ← Change from 500 to 0
DEV_MODE=false      # ← Change from true to false
TEST_MODE=false     # ← Keep as false
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### 6.2 Verify Configuration

```bash
# Test that config loads correctly
node -e "const config = require('./config'); console.log('Email:', config.credentials.email); console.log('DevMode:', config.devMode); console.log('Headless:', config.browser.headless);"
```

Should show:
```
Email: glenferrand@icloud.com
DevMode: false
Headless: true
```

---

## 📋 Step 7: Start the Bot with PM2

### 7.1 Start Scheduler

```bash
cd /root/tennis-bot

# Start the scheduler with PM2
pm2 start scheduler.js --name "tennis-bot"
```

You should see:
```
┌─────┬──────────────┬─────────┬─────────┬─────────┐
│ id  │ name         │ status  │ restart │ uptime  │
├─────┼──────────────┼─────────┼─────────┼─────────┤
│ 0   │ tennis-bot   │ online  │ 0       │ 0s      │
└─────┴──────────────┴─────────┴─────────┴─────────┘
```

### 7.2 Save PM2 Process List

```bash
pm2 save
```

### 7.3 Setup Auto-Start on Server Reboot

```bash
pm2 startup
```

This will show a command like:
```
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

**Copy and run that command** (it will be specific to your system)

### 7.4 Verify It's Running

```bash
# Check status
pm2 status

# View logs
pm2 logs tennis-bot

# View last 50 lines of logs
pm2 logs tennis-bot --lines 50
```

---

## 📋 Step 8: Verify Bot is Working

### 8.1 Check Logs

```bash
pm2 logs tennis-bot --lines 100
```

You should see:
```
🤖 Glen's Tennis Court Auto-Booking Bot Started
════════════════════════════════════════════════════════════
🌍 Server Time: 2026-01-21 09:30:00 UTC
🇺🇸 Pacific Time: 2026-01-21 01:30:00 PST
📍 Location: Manhattan Heights Park ONLY
🎾 Court: Tennis Court #2 ONLY (no fallbacks)
⏰ Time: 10:00 AM – 11:00 AM ONLY (no fallbacks)
📅 Booking: 4 days ahead (today = day 1)
⏭️  Skip: Wednesdays (courts closed)
🎉 Skip: US Federal Holidays (auto-calculated)
🕐 Release window: 6:00 AM PST/PDT daily
════════════════════════════════════════════════════════════

⏰ Next booking attempt scheduled for:
   Thursday, January 23, 2026 at 5:59:59 AM PST
   (in 1439 minutes)
```

### 8.2 Monitor Resources

```bash
pm2 monit
```

Shows CPU and memory usage in real-time.

---

## 🎯 How It Works 24/7

### The Magic of PM2:

1. **PM2 starts `scheduler.js`**
   ```
   pm2 start scheduler.js --name "tennis-bot"
   ```

2. **Scheduler calculates next run time**
   ```javascript
   // In scheduler.js
   function scheduleNextRun() {
     const msUntilRelease = calculateTimeUntilRelease();
     setTimeout(async () => {
       await runBooking();
       scheduleNextRun(); // ← Schedules next day
     }, msUntilRelease);
   }
   ```

3. **Process stays alive forever**
   - Scheduler uses `setTimeout()` which keeps Node.js running
   - After each booking attempt, it schedules the next one
   - Creates an infinite loop: Today → Tomorrow → Next Day → Forever

4. **PM2 ensures it never dies**
   - If process crashes → PM2 restarts it automatically
   - If server reboots → PM2 starts it on boot (via `pm2 startup`)
   - Logs are saved → Can check what happened anytime

### Timeline Example:

```
Day 1 (Jan 21) - 1:30 AM PST
├─ Bot starts
├─ Calculates: Next run = Jan 21, 5:59:59 AM PST
└─ Waits...

Day 1 (Jan 21) - 5:59:59 AM PST
├─ Wakes up
├─ Attempts booking for Jan 24 (4 days ahead)
├─ Success or Failure
└─ Schedules next run: Jan 22, 5:59:59 AM PST

Day 2 (Jan 22) - 5:59:59 AM PST
├─ Wakes up
├─ Attempts booking for Jan 25
├─ Success or Failure
└─ Schedules next run: Jan 23, 5:59:59 AM PST

... continues forever ...
```

---

## 🔧 Managing the Bot

### View Status
```bash
pm2 status
```

### View Logs (Real-time)
```bash
pm2 logs tennis-bot
```

### View Last 100 Lines
```bash
pm2 logs tennis-bot --lines 100
```

### Restart Bot
```bash
pm2 restart tennis-bot
```

### Stop Bot
```bash
pm2 stop tennis-bot
```

### Start Bot
```bash
pm2 start tennis-bot
```

### Delete Bot from PM2
```bash
pm2 delete tennis-bot
```

### Monitor Resources
```bash
pm2 monit
```

---

## 🔄 Updating the Bot

### When you need to update code:

**On your local machine:**
```bash
# Upload new files
scp -r * root@YOUR_SERVER_IP:/root/tennis-bot/
```

**On VPS:**
```bash
cd /root/tennis-bot

# Install any new dependencies
npm install

# Restart the bot
pm2 restart tennis-bot

# Check logs
pm2 logs tennis-bot
```

---

## 🔒 Security Best Practices

### 1. Change Root Password
```bash
passwd
```

### 2. Setup Firewall (Optional)
```bash
ufw allow 22/tcp
ufw enable
```

### 3. Keep System Updated
```bash
apt update && apt upgrade -y
```

### 4. Backup .env File
```bash
# Download to local machine
scp root@YOUR_SERVER_IP:/root/tennis-bot/.env ./backup.env
```

---

## 📊 Monitoring & Troubleshooting

### Check if Bot is Running
```bash
pm2 status
```

### Check Logs for Errors
```bash
pm2 logs tennis-bot --err
```

### Check System Resources
```bash
# CPU and Memory
htop

# Or use PM2
pm2 monit
```

### Restart if Stuck
```bash
pm2 restart tennis-bot
```

### View Full Logs
```bash
pm2 logs tennis-bot --lines 1000
```

---

## 🎉 Success Checklist

- [ ] VPS created and accessible via SSH
- [ ] Node.js 20.x installed
- [ ] PM2 installed
- [ ] Playwright dependencies installed
- [ ] Bot files uploaded to `/root/tennis-bot/`
- [ ] Dependencies installed (`npm install`)
- [ ] Playwright browsers installed
- [ ] `.env` configured for production (HEADLESS=true, DEV_MODE=false)
- [ ] Bot started with PM2
- [ ] PM2 process saved
- [ ] PM2 startup configured (survives reboots)
- [ ] Logs show "Next booking attempt scheduled"
- [ ] Bot runs 24/7 automatically

---

## 💰 Cost Breakdown

**Hetzner CPX11:**
- €4.51/month (~$5 USD)
- 2 vCPU
- 2 GB RAM
- 40 GB SSD
- 20 TB traffic

**Perfect for this bot!** Uses minimal resources:
- CPU: ~5% average
- RAM: ~200-300 MB
- Disk: ~500 MB

---

## 🆘 Need Help?

### Common Issues:

**Bot not starting:**
```bash
pm2 logs tennis-bot --err
```

**Can't connect to VPS:**
```bash
ssh -v root@YOUR_SERVER_IP
```

**Playwright errors:**
```bash
npx playwright install-deps chromium
```

**Out of memory:**
```bash
pm2 restart tennis-bot
```

---

## 🎯 Summary

1. **Buy CPX11 VPS** → Get IP address
2. **SSH into VPS** → `ssh root@IP`
3. **Install software** → Node.js, PM2, Playwright
4. **Upload files** → SCP or Git
5. **Configure** → Edit `.env` for production
6. **Start bot** → `pm2 start scheduler.js`
7. **Save & auto-start** → `pm2 save` + `pm2 startup`
8. **Done!** → Bot runs 24/7 forever

The bot will automatically:
- ✅ Run every day at 6:00 AM PST
- ✅ Book 4 days ahead
- ✅ Skip Wednesdays
- ✅ Skip holidays
- ✅ Retry 3 times if needed
- ✅ Continue forever

**Your bot is now running 24/7 on autopilot!** 🎾🤖
