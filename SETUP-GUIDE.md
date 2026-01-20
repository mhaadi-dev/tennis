# Setup Guide - Recording Selectors

## Step 1: Install Dependencies

```bash
npm install
npx playwright install chromium
```

## Step 2: Record the Booking Flow

Use Playwright's codegen tool to record the actual selectors:

```bash
npm run record
```

This will open:
1. A browser window (perform actions here)
2. Playwright Inspector (shows generated code)

### What to do in the browser:

1. **Login**
   - Enter email: `glenferrand@icloud.com`
   - Enter password: `Tennismb1!`
   - Click login button

2. **Navigate to Tennis Courts**
   - Click on "Tennis & Pickleball" or similar option

3. **Select Date**
   - Choose a date 4 days from today

4. **Select Location**
   - Click "Manhattan Heights Park"

5. **Select Court**
   - Click "Court #2"

6. **Select Time**
   - Click "10:00 AM – 11:00 AM" time slot

7. **Proceed to Payment**
   - Click Continue/Next button

8. **Payment Method**
   - Select saved credit card (if available)

9. **Stop before final confirmation** (don't actually book during recording)

### Copy the generated code:

The Playwright Inspector will show code like this:

```javascript
await page.goto('https://www.courts.manhattanbeach.gov/');
await page.getByLabel('Email').click();
await page.getByLabel('Email').fill('glenferrand@icloud.com');
await page.getByLabel('Password').click();
await page.getByLabel('Password').fill('Tennismb1!');
await page.getByRole('button', { name: 'Login' }).click();
// ... more steps
```

## Step 3: Update booking-bot.js

Replace the generic selectors in `booking-bot.js` with the actual selectors from the recording.

### Example Updates:

**Before (generic):**
```javascript
await page.fill('input[type="email"]', CREDENTIALS.email);
```

**After (specific from recording):**
```javascript
await page.getByLabel('Email').fill(CREDENTIALS.email);
```

## Step 4: Test the Bot

Run a test booking:

```bash
npm run book-now
```

Watch the browser to ensure each step works correctly.

## Step 5: Start Automated Scheduler

Once everything works:

```bash
npm start
```

The bot will now run automatically at 6:00 AM PST every day.

## Tips

- **Selectors change?** Re-run `npm run record` to get updated selectors
- **Test first**: Always test with `npm run book-now` before relying on the scheduler
- **Check timing**: Make sure your system clock is set to PST/PDT
- **Saved payment**: Ensure credit card is saved in Glen's account before automation

## Alternative: Manual Recording

If you prefer to manually identify selectors:

```bash
npm run record-flow
```

This opens a browser and logs clicked elements to help you identify selectors.
