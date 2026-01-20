const { chromium } = require('playwright');

// Glen's credentials
const CREDENTIALS = {
  email: 'glenferrand@icloud.com',
  password: 'Tennismb1!',
  url: 'https://www.courts.manhattanbeach.gov/'
};

// Booking preferences with fallbacks
const BOOKING_CONFIG = {
  location: 'Manhattan Heights Park',
  courts: ['Court #2', 'Court #1', 'Court #3'], // Preferred order
  timeSlots: [
    '10:00 AM – 11:00 AM',  // First choice
    '9:00 AM – 10:00 AM',   // Fallback 1
    '11:00 AM – 12:00 PM'   // Fallback 2
  ],
  daysInAdvance: 4,
  skipDays: [3] // Wednesday
};

async function login(page) {
  console.log('🔐 Logging in...');
  
  await page.goto(CREDENTIALS.url);
  await page.getByText('Log in').click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(CREDENTIALS.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForLoadState('networkidle');
  
  console.log('✅ Logged in successfully');
}

async function selectTennisAndPickleball(page) {
  console.log('🎾 Selecting Tennis & Pickleball...');
  
  await page.getByRole('button', { name: 'Discover' }).first().click();
  await page.waitForTimeout(1000);
  await page.getByTestId('AddIcon').nth(2).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(1000);
}

async function selectDateAndLocation(page, targetDate) {
  console.log(`📅 Selecting date: ${targetDate.toLocaleDateString()}`);
  
  await page.getByRole('checkbox').check();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForTimeout(1000);
  
  // TODO: Add actual date selection here after recording
  // Example: await page.getByRole('button', { name: targetDate.getDate().toString() }).click();
}

async function selectCourtAndTime(page) {
  console.log(`🎯 Attempting to book preferred court and time...`);
  
  // Try each court in order of preference
  for (const court of BOOKING_CONFIG.courts) {
    console.log(`   Checking ${court}...`);
    
    // TODO: Add actual court selection after recording
    // Check if court is available
    // const courtAvailable = await page.locator(`text="${court}"`).isVisible();
    
    // if (courtAvailable) {
    //   await page.click(`text="${court}"`);
    //   
    //   // Try each time slot
    //   for (const timeSlot of BOOKING_CONFIG.timeSlots) {
    //     const slotAvailable = await page.locator(`text="${timeSlot}"`).isVisible();
    //     
    //     if (slotAvailable) {
    //       await page.click(`text="${timeSlot}"`);
    //       console.log(`✅ Booked ${court} at ${timeSlot}`);
    //       return { court, timeSlot };
    //     }
    //   }
    // }
  }
  
  throw new Error('❌ No courts or time slots available!');
}

async function completeBooking(page) {
  console.log('💳 Completing booking with saved payment...');
  
  // Select saved VISA card
  await page.getByRole('radio', { name: /VISA ending in 4745/ }).check();
  await page.waitForTimeout(1000);
  
  // TODO: Add final confirmation after recording
  // await page.getByRole('button', { name: 'Confirm' }).click();
  // await page.waitForSelector('text=/confirmation|success|booked/i', { timeout: 10000 });
  
  console.log('✅ Payment method selected');
}

function getTargetBookingDate() {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + BOOKING_CONFIG.daysInAdvance);
  
  if (BOOKING_CONFIG.skipDays.includes(targetDate.getDay())) {
    console.log('⏭️  Skipping Wednesday - courts closed');
    return null;
  }
  
  return targetDate;
}

function calculateTimeUntilRelease() {
  const now = new Date();
  const release = new Date(now);
  release.setHours(6, 0, 0, 0);
  
  if (now >= release) {
    release.setDate(release.getDate() + 1);
  }
  
  return release - now;
}

async function runBooking(retries = 3) {
  const targetDate = getTargetBookingDate();
  
  if (!targetDate) {
    console.log('❌ No booking needed today (Wednesday skip)');
    return;
  }
  
  console.log(`\n🚀 Starting booking for ${targetDate.toLocaleDateString()}`);
  console.log(`⏰ Current time: ${new Date().toLocaleString()}`);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`\n📍 Attempt ${attempt} of ${retries}`);
    
    const browser = await chromium.launch({ 
      headless: false,
      slowMo: 100
    });
    
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      await login(page);
      await selectTennisAndPickleball(page);
      await selectDateAndLocation(page, targetDate);
      const booking = await selectCourtAndTime(page);
      await completeBooking(page);
      
      console.log('\n🎉 SUCCESS! Court booked for Glen.');
      console.log(`   Court: ${booking.court}`);
      console.log(`   Time: ${booking.timeSlot}`);
      console.log(`   Date: ${targetDate.toLocaleDateString()}`);
      
      await browser.close();
      return true;
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      await browser.close();
      
      if (attempt < retries) {
        console.log(`   Retrying in 30 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  }
  
  console.error('\n❌ All booking attempts failed!');
  // TODO: Send notification email/SMS
  return false;
}

if (require.main === module) {
  runBooking().catch(console.error);
}

module.exports = { runBooking, calculateTimeUntilRelease };
