# Quick Reference Card

## 🚀 VPS Deployment (Copy-Paste Commands)

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt install -y nodejs

# 2. Install Playwright deps
apt install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libdbus-1-3 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2

# 3. Go to project
cd /opt/tennis-booking-bot

# 4. Install
npm install && npx playwright install chromium && npx playwright install-deps chromium

# 5. Test
npm run test-dates && npm run book-now

# 6. Deploy
npm install -g pm2 && pm2 start scheduler.js --name "glen-tennis-bot" && pm2 save && pm2 startup
```

---

## 📊 Daily Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs glen-tennis-bot

# Restart
pm2 restart glen-tennis-bot

# Check success
pm2 logs glen-tennis-bot | grep "SUCCESS"
```

---

## 🎯 What Bot Does

- Runs at **6:00 AM PST/PDT** every day
- Books **4 days ahead**
- Skips **Wednesdays** (courts closed)
- Uses **Glen's saved VISA card**
- Selects **first available court**

---

## ✅ Success Indicators

Logs should show:
```
🇺🇸 Pacific Time: 2025-01-20 06:00:00 PST
✅ SUCCESS! Court booked for Glen.
```

---

## 🐛 If It Fails

```bash
pm2 logs glen-tennis-bot --err
ls -la error-*.png
npm run book-now
```

---

## 📁 Main File

**Run this:** `scheduler.js` (via PM2)

That's it! 🎾
