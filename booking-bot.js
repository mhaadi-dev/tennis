const { chromium } = require('playwright');
const moment = require('moment-timezone');
const config = require('./config');

// Load configuration
const TIMEZONE = config.timezone;
const CREDENTIALS = config.credentials;
const BOOKING_CONFIG = config.booking;

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

async function selectTennisAndDiscoverFacilities(page) {
  console.log('🎾 Opening facility browser...');
  
  await page.getByRole('button', { name: 'Discover' }).first().click();
  await page.waitForTimeout(1500);
}

async function selectDateAndCourt(page, targetDate) {
  console.log(`📅 Selecting date: ${targetDate.toLocaleDateString()}`);
  
  // Click on the date picker
  await page.getByRole('textbox', { name: 'EEEE, MMMM DD' }).click();
  await page.waitForTimeout(500);
  
  // Open the date picker calendar
  await page.getByRole('button', { name: 'Choose date, selected date is' }).click();
  await page.waitForTimeout(500);
  
  // Click on the specific day (e.g., 20th, 24th, etc.)
  const dayOfMonth = targetDate.getDate().toString();
  console.log(`   Clicking on day: ${dayOfMonth}`);
  await page.getByRole('gridcell', { name: dayOfMonth }).click();
  await page.waitForTimeout(1000);
  
  console.log(`🎯 Selecting court and time slot...`);
  await page.locator('.box-border.overflow-hidden.p-0.border-r.border-t > .h-full.bg-white > .flex').first().click();
  await page.waitForTimeout(1000);
  
  // Click Continue
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(1000);
}

async function confirmMemberAndProceed(page) {
  console.log('👤 Confirming Glen Ferrand as member...');
  
  // Check Glen Ferrand checkbox
  await page.getByRole('checkbox').check();
  await page.waitForTimeout(500);
  
  // Click Next
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForTimeout(1500);
}

async function completeBooking(page) {
  console.log('💳 Completing booking with saved payment...');
  
  // Select saved VISA card ending in 4745
  await page.getByRole('radio', { name: /VISA ending in 4745/ }).check();
  await page.waitForTimeout(1000);
  
  // Click final Confirm button
  console.log('✅ Clicking final confirmation...');
  await page.getByRole('button', { name: 'Confirm' }).click();
  
  // Wait for confirmation page
  await page.waitForTimeout(3000);
  
  console.log('🎉 Booking confirmed!');
}

function getTargetBookingDate() {
  // Get current date in Pacific timezone
  const today = moment.tz(TIMEZONE);
  let targetDate = today.clone().add(BOOKING_CONFIG.daysInAdvance, 'days');
  
  // If target date is Wednesday, skip to Thursday (book 5 days ahead instead)
  if (BOOKING_CONFIG.skipDays.includes(targetDate.day())) {
    console.log('⏭️  Target date is Wednesday (courts closed) - booking for Thursday instead');
    targetDate.add(1, 'day');
  }
  
  console.log(`📆 Booking for: ${targetDate.format('dddd, MMMM D, YYYY')}`);
  
  return targetDate.toDate();
}

function calculateTimeUntilRelease() {
  // Get current time in Pacific timezone
  const now = moment.tz(TIMEZONE);
  
  // Set release time to 6:00 AM Pacific today
  let release = now.clone().hours(BOOKING_CONFIG.releaseHour).minutes(BOOKING_CONFIG.releaseMinute).seconds(0).milliseconds(0);
  
  // If already past 6 AM Pacific today, schedule for tomorrow
  if (now.isAfter(release)) {
    release.add(1, 'day');
  }
  
  const msUntilRelease = release.diff(now);
  
  console.log(`⏰ Current Pacific Time: ${now.format('YYYY-MM-DD HH:mm:ss z')}`);
  console.log(`🎯 Next release: ${release.format('YYYY-MM-DD HH:mm:ss z')}`);
  
  return msUntilRelease;
}

async function runBooking() {
  const targetDate = getTargetBookingDate();
  
  console.log(`\n🚀 Starting booking process...`);
  console.log(`⏰ Current Pacific Time: ${moment.tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss z')}`);
  
  const browser = await chromium.launch({ 
    headless: config.browser.headless,
    slowMo: config.browser.slowMo,
    args: config.browser.args
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    const page = await context.newPage();
    
    await login(page);
    await selectTennisAndDiscoverFacilities(page);
    await selectDateAndCourt(page, targetDate);
    await confirmMemberAndProceed(page);
    await completeBooking(page);
    
    console.log('\n✅ SUCCESS! Court booked for Glen.');
    console.log(`   Date: ${moment(targetDate).format('YYYY-MM-DD (dddd)')}`);
    console.log(`   Location: ${BOOKING_CONFIG.location}`);
    console.log(`   Time: ${BOOKING_CONFIG.timeSlot}`);
    console.log(`   Booked at: ${moment.tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss z')}`);
    
  } catch (error) {
    console.error('\n❌ Booking failed:', error.message);
    console.error('   Stack:', error.stack);
    console.error(`   Failed at: ${moment.tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss z')}`);
    
    // Take screenshot on error
    try {
      const screenshotPath = `error-${moment().format('YYYY-MM-DD-HHmmss')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`   Screenshot saved: ${screenshotPath}`);
    } catch (e) {
      // Ignore screenshot errors
    }
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Main execution
if (require.main === module) {
  runBooking().catch(console.error);
}

module.exports = { runBooking, calculateTimeUntilRelease };
