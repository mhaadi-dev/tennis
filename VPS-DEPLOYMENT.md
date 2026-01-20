# VPS Deployment Guide

## Complete guide for deploying the tennis court booking bot on a VPS server

---

## ✅ What's Configured

- ✅ **Timezone handling**: Works from any VPS location (automatically converts to Pacific Time)
- ✅ **Headless mode**: Runs without GUI on server
- ✅ **6 AM PST/PDT**: Correct timing for Manhattan Beach court bookings
- ✅ **4 days ahead**: Books exactly 4 days in advance
- ✅ **Wednesday skip**: Automatically skips Wednesdays (courts closed)
- ✅ **Auto-restart**: PM2 keeps bot running 24/7

---

## 🖥️ VPS Requirements

### Minimum Specs:
- **RAM**: 1GB minimum (2GB recommended)
- **CPU**: 1 core
- **Storage**: 2GB free space
- **OS**: Ubuntu 20.04+ or Debian 10+
- **Network**: Stable internet connection

### Recommended VPS Providers:
- DigitalOcean ($6/month droplet)
- Linode ($5/month nanode)
- Vultr ($5/month instance)
- AWS Lightsail ($3.50/month)

---

## 📦 Step 1: Prepare VPS

### Connect to your VPS:
```bash
ssh root@your-vps-ip
```

### Update system:
```bash
apt update && apt upgrade -y
```

### Install Node.js 18+:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version  # Should show v18.x or higher
```

### Install required dependencies for Playwright:
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
  libasound2 \
  libpango-1.0-0 \
  libcairo2
```

---

## 📂 Step 2: Upload Project Files

### Option A: Using Git (Recommended)
```bash
# On VPS
cd /opt
git clone <your-repo-url> tennis-bot
cd tennis-bot
```

### Option B: Using SCP
```bash
# On your local machine
scp -r /path/to/tennis-booking-bot root@your-vps-ip:/opt/tennis-bot
```

### Option C: Using SFTP
Use FileZilla or WinSCP to upload the project folder to `/opt/tennis-bot`

---

## 🔧 Step 3: Install Dependencies

```bash
cd /opt/tennis-bot

# Install Node packages
npm install

# Install Playwright browsers
npx playwright install chromium
npx playwright install-deps chromium
```

---

## 🧪 Step 4: Test the Bot

### Test timezone handling:
```bash
npm run test-dates
```

You should see:
```
🧪 Testing Date Logic
Rule: Book 4 days in advance, skip Wednesdays (book Thursday instead)
...
Saturday  → Books for Thursday (5 days ahead - skips Wednesday)
```

### Test manual booking (IMPORTANT - Do this first!):
```bash
npm run book-now
```

**Watch the logs carefully!** This will:
- Show current server time vs Pacific time
- Attempt to book a court
- Save error screenshots if it fails

---

## 🚀 Step 5: Deploy with PM2

### Install PM2:
```bash
npm install -g pm2
```

### Start the bot:
```bash
pm2 start scheduler.js --name "glen-tennis-bot"
```

### Save PM2 configuration:
```bash
pm2 save
```

### Enable auto-start on server reboot:
```bash
pm2 startup
# Follow the command it shows (copy-paste and run it)
```

### Verify it's running:
```bash
pm2 status
```

You should see:
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ status  │ restart │ uptime   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ glen-tennis-bot  │ online  │ 0       │ 5s       │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

---

## 📊 Step 6: Monitor the Bot

### View live logs:
```bash
pm2 logs glen-tennis-bot
```

You should see:
```
═══════════════════════════════════════════════════════
🤖 Glen's Tennis Court Auto-Booking Bot Started
═══════════════════════════════════════════════════════
🌍 Server Time: 2025-01-20 14:30:00 UTC
🇺🇸 Pacific Time: 2025-01-20 06:30:00 PST
📍 Location: Manhattan Heights Park
🎾 Court: Court #2 (or first available)
⏰ Time: 10:00 AM – 11:00 AM
📅 Booking: 4 days in advance
⏭️  Skip: Wednesdays (courts closed)
🕐 Release window: 6:00 AM PST/PDT daily
═══════════════════════════════════════════════════════

⏰ Next booking attempt scheduled for:
   Tuesday, January 21, 2025 at 6:00:00 AM PST
   (in 1410 minutes)
```

### Check logs later:
```bash
pm2 logs glen-tennis-bot --lines 50
```

### View error logs only:
```bash
pm2 logs glen-tennis-bot --err
```

---

## 🔍 Step 7: Verify Timezone is Correct

The bot automatically handles timezone conversion. Even if your VPS is in:
- **UTC** (most common)
- **EST** (US East Coast)
- **Europe** (CET, GMT, etc.)
- **Asia** (SGT, JST, etc.)

It will **always** book at 6:00 AM Pacific Time (Manhattan Beach time).

### To verify:
```bash
# Check server timezone
timedatectl

# Check bot's Pacific time calculation
pm2 logs glen-tennis-bot | grep "Pacific Time"
```

---

## 🛠️ Management Commands

### Check status:
```bash
pm2 status
```

### Restart bot:
```bash
pm2 restart glen-tennis-bot
```

### Stop bot:
```bash
pm2 stop glen-tennis-bot
```

### Start bot again:
```bash
pm2 start glen-tennis-bot
```

### View detailed info:
```bash
pm2 show glen-tennis-bot
```

### Delete bot (if needed):
```bash
pm2 delete glen-tennis-bot
```

---

## 📧 Step 8: Set Up Monitoring (Optional)

### PM2 Plus (Free tier available):
```bash
pm2 link <secret> <public>
# Get keys from https://app.pm2.io
```

### Email notifications on failure:
Install pm2-logrotate to prevent log files from filling disk:
```bash
pm2 install pm2-logrotate
```

---

## 🔒 Security Best Practices

### 1. Create non-root user:
```bash
adduser tennisbot
usermod -aG sudo tennisbot
su - tennisbot
```

### 2. Set up firewall:
```bash
ufw allow 22/tcp  # SSH
ufw enable
```

### 3. Disable root SSH login:
```bash
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
systemctl restart sshd
```

### 4. Keep system updated:
```bash
apt update && apt upgrade -y
```

---

## 🐛 Troubleshooting

### Bot not starting?
```bash
pm2 logs glen-tennis-bot --err
```

### Playwright errors?
```bash
npx playwright install-deps chromium
```

### Timezone issues?
```bash
# Check if moment-timezone is installed
npm list moment-timezone

# Reinstall if needed
npm install moment-timezone
```

### Memory issues?
```bash
# Check memory usage
free -h

# Restart bot
pm2 restart glen-tennis-bot
```

### Bot crashed?
```bash
# PM2 auto-restarts, but check logs
pm2 logs glen-tennis-bot --lines 100
```

---

## 📅 Daily Operation

**The bot runs automatically!** No manual intervention needed.

### What happens daily:
1. **5:59:59 AM PST** - Bot wakes up (1 second early)
2. **Calculates target date** - 4 days ahead, skips Wednesday
3. **Opens browser** - Headless mode
4. **Logs in** - Glen's credentials
5. **Selects date and court** - First available slot
6. **Completes payment** - Saved VISA card
7. **Confirms booking** - Done!
8. **Schedules next run** - Tomorrow at 6 AM

### Check if booking succeeded:
```bash
pm2 logs glen-tennis-bot | grep "SUCCESS"
```

---

## 📊 Expected Log Output

### Successful booking:
```
🔔 Release window opening! Starting booking...
═══════════════════════════════════════════════════════
🚀 Starting booking process...
⏰ Current Pacific Time: 2025-01-21 06:00:00 PST
🔐 Logging in...
✅ Logged in successfully
🎾 Opening facility browser...
📅 Selecting date: Friday, January 24, 2025
🎯 Selecting court and time slot...
👤 Confirming Glen Ferrand as member...
💳 Completing booking with saved payment...
✅ Clicking final confirmation...
🎉 Booking confirmed!

✅ SUCCESS! Court booked for Glen.
   Date: 2025-01-24 (Friday)
   Location: Manhattan Heights Park
   Time: 10:00 AM – 11:00 AM
   Booked at: 2025-01-21 06:00:15 PST
═══════════════════════════════════════════════════════
✅ Booking successful! Scheduling next run...
```

---

## 🎯 Final Checklist

Before going live:

- [ ] VPS is running and accessible
- [ ] Node.js 18+ installed
- [ ] Playwright dependencies installed
- [ ] Project files uploaded
- [ ] `npm install` completed
- [ ] `npm run test-dates` shows correct logic
- [ ] `npm run book-now` works successfully
- [ ] PM2 installed and bot started
- [ ] `pm2 save` executed
- [ ] `pm2 startup` configured
- [ ] Logs show correct Pacific time
- [ ] Bot scheduled for next 6 AM PST
- [ ] Firewall configured
- [ ] Monitoring set up (optional)

---

## 📞 Support

If bot fails:
1. Check logs: `pm2 logs glen-tennis-bot --lines 100`
2. Check error screenshots in `/opt/tennis-bot/`
3. Test manually: `npm run book-now`
4. Restart: `pm2 restart glen-tennis-bot`

**Bot is now production-ready and will run 24/7 on your VPS!** 🎉
