# VPS Deployment Checklist

## Quick deployment guide for production

---

## 🚀 Quick Start (5 Minutes)

### 1. Connect to VPS
```bash
ssh root@your-vps-ip
```

### 2. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

### 3. Install Playwright dependencies
```bash
apt install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libdbus-1-3 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2
```

### 4. Upload project
```bash
cd /opt
# Upload your project files here (git clone or scp)
cd tennis-booking-bot
```

### 5. Install dependencies
```bash
npm install
npx playwright install chromium
npx playwright install-deps chromium
```

### 6. Test it works
```bash
npm run test-dates
npm run book-now  # Watch for errors!
```

### 7. Deploy with PM2
```bash
npm install -g pm2
pm2 start scheduler.js --name "glen-tennis-bot"
pm2 save
pm2 startup  # Follow the command it shows
```

### 8. Verify
```bash
pm2 logs glen-tennis-bot
```

---

## ✅ What to Check

Look for these in the logs:

```
🌍 Server Time: 2025-01-20 14:00:00 UTC
🇺🇸 Pacific Time: 2025-01-20 06:00:00 PST  ← Should show PST/PDT
⏰ Next booking attempt scheduled for:
   Tuesday, January 21, 2025 at 6:00:00 AM PST  ← Correct time
```

---

## 🎯 Key Points

1. **Timezone**: Bot automatically converts to Pacific Time - works from any VPS location
2. **Headless**: Runs without GUI (headless: true in code)
3. **6 AM PST**: Books at exactly 6:00 AM Manhattan Beach time
4. **4 days ahead**: Books 4 days in advance, skips Wednesdays
5. **Auto-restart**: PM2 keeps it running 24/7

---

## 📊 Monitor Daily

```bash
# Check status
pm2 status

# View logs
pm2 logs glen-tennis-bot

# Check for success
pm2 logs glen-tennis-bot | grep "SUCCESS"
```

---

## 🐛 If Something Fails

```bash
# View error logs
pm2 logs glen-tennis-bot --err

# Check error screenshots
ls -la /opt/tennis-booking-bot/error-*.png

# Restart
pm2 restart glen-tennis-bot

# Test manually
npm run book-now
```

---

## 🎉 Done!

Bot is now running 24/7 and will book courts automatically at 6 AM PST every day!
