# How the Tennis Court Booking Bot Works

## 📁 File Overview

### 1. **booking-bot.js** - Main Booking Logic
**What it does:** Contains all the steps to book a court
**How it works:**
- Logs into the website using Glen's credentials
- Navigates through the booking flow
- Selects tennis facility, date, court, time
- Completes payment with saved card
- Uses recorded selectors from Playwright codegen

**Key Functions:**
- `login()` - Logs in with email/password
- `selectTennisAndPickleball()` - Chooses tennis facility
- `selectDateAndLocation()` - Picks date and confirms Glen as member
- `selectCourtAndTime()` - Selects Court #2 and 10-11 AM slot
- `completeBooking()` - Selects payment and confirms
- `runBooking()` - Runs all steps in sequence

**Current Status:** ⚠️ INCOMPLETE - Missing date/court/time selectors

---

### 2. **scheduler.js** - Automatic Daily Runner
**What it does:** Runs the booking bot automatically every day at 6:00 AM PST
**How it works:**
- Calculates time until next 6:00 AM
- Waits until 5:59:59 AM (1 second early for speed)
- Runs `booking-bot.js`
- Schedules next day's booking
- Runs continuously in a loop

**To use:** `npm start` (keeps running forever)

---

### 3. **config.js** - Settings
**What it does:** Stores all configuration in one place
**Contains:**
- Login credentials
- Court preferences (location, court number, time)
- Days to skip (Wednesday)
- Browser settings

**Currently:** Not being used yet (credentials are hardcoded in booking-bot.js)

---

### 4. **login-and-save-session.js** - Manual Session Saver
**What it does:** Opens browser for you to login manually, then saves the session
**How it works:**
- Opens browser (not headless)
- Waits 60 seconds for you to login
- Saves cookies/session to `auth.json`
- Can be used to avoid logging in each time

**To use:** `npm run save-session`
**Currently:** Not integrated with main bot

---

### 5. **record-booking-flow.js** - Selector Logger
**What it does:** Helps identify selectors by logging clicks
**How it works:**
- Opens the website
- Logs every element you click
- Helps debug selector issues

**To use:** `npm run record-flow`

---

### 6. **inspect-selectors.js** - Automated Selector Tester
**What it does:** Tests if basic selectors work
**How it works:**
- Tries to find login elements
- Attempts automatic login
- Shows which selectors work/fail

**To use:** `npm run inspect`

---

## 🚨 CRITICAL ISSUES TO FIX

### Issue #1: Incomplete Recording
Your recording is missing:
- ❌ Date selection (how to pick 4 days from today)
- ❌ Location selection (Manhattan Heights Park)
- ❌ Court #2 selection
- ❌ Time slot selection (10:00 AM - 11:00 AM)
- ❌ Final confirmation button

**Why this matters:** The bot will fail when it reaches these steps because the selectors don't exist yet.

### Issue #2: No Fallback Logic
**Your concern is valid!** Current code has NO handling for:
- ❌ Court #2 not available → Bot will fail
- ❌ 10-11 AM slot taken → Bot will fail
- ❌ Website changes → Bot will fail

---

## 🎯 WHAT YOU NEED TO DO

### Step 1: Complete the Recording
Run: `npm run record`

Go through the ENTIRE flow including:
1. Login ✅
2. Select tennis ✅
3. Select Glen ✅
4. **SELECT DATE** (pick a specific date)
5. **SELECT LOCATION** (Manhattan Heights Park)
6. **SELECT COURT #2**
7. **SELECT TIME** (10:00 AM - 11:00 AM)
8. Select payment ✅
9. **CLICK FINAL CONFIRM BUTTON**

Copy ALL the code and share it.

### Step 2: Add Fallback Logic (After Step 1)
We need to add:
- Check if Court #2 is available, if not try Court #1 or #3
- Check if 10-11 AM is available, if not try 9-10 AM or 11-12 PM
- Retry logic if booking fails
- Error notifications

---

## 🤖 HOW TO RUN THE BOT AUTOMATICALLY

### For Testing (Manual Run):
```bash
npm run book-now
```
- Runs once immediately
- Browser opens so you can watch
- Good for testing

### For Production (Automatic Daily):
```bash
npm start
```
- Runs continuously
- Waits until 6:00 AM each day
- Automatically books courts
- **MUST KEEP TERMINAL OPEN**
- **MUST KEEP COMPUTER ON**

### Better Option: Run as Background Service
```bash
# Install PM2 (process manager)
npm install -g pm2

# Start bot as background service
pm2 start scheduler.js --name "tennis-bot"

# Save configuration
pm2 save

# Auto-start on computer reboot
pm2 startup
```

Now the bot runs even if you close the terminal!

---

## ⚠️ CURRENT LIMITATIONS

1. **Recorded selectors only work for exact flow**
   - If website layout changes → Bot breaks
   - If buttons have different text → Bot breaks

2. **No intelligence**
   - Can't adapt to changes
   - Can't handle unavailable slots
   - Can't retry different options

3. **Requires computer to be on**
   - Must run at 6:00 AM PST
   - Computer must be awake
   - Internet must be connected

4. **No notifications**
   - Won't tell you if booking succeeds
   - Won't alert you if it fails

---

## 🔧 NEXT STEPS TO MAKE IT PRODUCTION-READY

1. ✅ Complete the recording (get all selectors)
2. ⬜ Add availability checking
3. ⬜ Add fallback options (other courts/times)
4. ⬜ Add error handling and retries
5. ⬜ Add email/SMS notifications
6. ⬜ Add logging to file
7. ⬜ Test for multiple days
8. ⬜ Set up as system service

---

## 📊 WHAT HAPPENS WHEN YOU RUN `npm start`

```
1. scheduler.js starts
2. Calculates: "Next 6:00 AM is in X hours"
3. Waits...
4. At 5:59:59 AM:
   - Launches browser
   - Runs booking-bot.js
   - Logs in
   - Selects tennis
   - Selects Glen
   - [FAILS HERE - missing selectors]
5. Schedules next day
6. Repeats forever
```

**Current problem:** It will fail at step 4 because the date/court/time selectors are missing!
