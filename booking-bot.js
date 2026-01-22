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
  
  // Wait for navigation after login - use 'load' instead of 'networkidle' for better reliability
  try {
    await page.waitForLoadState('load', { timeout: 15000 });
  } catch (e) {
    console.log('   ⚠️  Load state timeout, continuing anyway...');
  }
  
  // Additional wait to ensure page is ready
  await page.waitForTimeout(2000);
  
  console.log('✅ Logged in successfully');
}

async function selectTennisAndPickleballCard(page) {
  console.log('🎾 Selecting Tennis & Pickleball...');
  
  // Click on the Tennis & Pickleball card using the title with exact class
  // Use first() to handle multiple matches, or use more specific selector
  await page.locator('p.css-mex72g:has-text("Tennis and pickleball")').first().click();
  await page.waitForTimeout(2000);
  
  console.log('✅ Tennis & Pickleball selected');
}

async function selectManhattanHeightsPark(page) {
  console.log('📍 Selecting Manhattan Heights Park...');
  
  // Click on Facility filter
  await page.getByRole('button', { name: 'Facility' }).click();
  await page.waitForTimeout(1000);
  
  // Select Manhattan Heights Park
  await page.locator('span').filter({ hasText: 'Manhattan Heights Park' }).click();
  await page.waitForTimeout(500);
  
  // Close the facility selector by clicking backdrop
  await page.locator('.MuiPopover-root.MuiModal-root.css-17ljz8u > .MuiBackdrop-root').click();
  await page.waitForTimeout(1500);
  
  console.log('✅ Manhattan Heights Park selected');
}

async function selectCourt2(page) {
  console.log('🎾 Selecting Tennis Court #2...');
  
  // Wait for court selector to be ready
  await page.waitForTimeout(1000);
  
  // Click on Tennis Court #2
  await page.getByLabel('Tennis Court #2', { exact: true }).click();
  await page.waitForTimeout(500);
  
  // Close the court selector
  await page.getByLabel('Close').click();
  await page.waitForTimeout(2000);
  
  console.log('✅ Court #2 selected');
}

async function selectTargetDate(page, targetDate) {
  console.log(`📅 Selecting date: ${moment(targetDate).format('MMMM D, YYYY (dddd)')}...`);
  
  // Click on the date picker input
  await page.getByRole('textbox', { name: 'EEEE, MMMM DD' }).click();
  await page.waitForTimeout(1000);
  
  // Click the "Choose date" button to open calendar
  await page.getByRole('button', { name: 'Choose date, selected date is' }).click();
  await page.waitForTimeout(1000);
  
  // Check if we need to navigate to next month
  const today = moment.tz(TIMEZONE);
  const target = moment(targetDate);
  const currentMonth = today.month();
  const targetMonth = target.month();
  
  // If target month is different (next month), click the next month arrow
  if (targetMonth !== currentMonth) {
    console.log(`   📆 Navigating to ${target.format('MMMM YYYY')}...`);
    
    // Calculate how many months to navigate forward
    let monthsToNavigate = targetMonth - currentMonth;
    if (monthsToNavigate < 0) {
      monthsToNavigate += 12; // Handle year transition
    }
    
    // Click next month arrow the required number of times
    for (let i = 0; i < monthsToNavigate; i++) {
      await page.getByLabel('Next month').click();
      await page.waitForTimeout(500);
    }
  }
  
  // Get the day number to click
  const dayNumber = target.format('D');
  console.log(`   Clicking day: ${dayNumber}`);
  
  // Click on the specific day in the calendar
  await page.getByRole('gridcell', { name: dayNumber, exact: true }).click();
  await page.waitForTimeout(2000);
  
  console.log(`✅ Date selected: ${target.format('MMMM D, YYYY (dddd)')}`);
}

async function select10AMSlotOnCourt2(page) {
  console.log(`🎯 Looking for 10:00 AM slot on Court #2...`);
  
  // Wait for the grid to fully load after date selection
  // Use 'load' instead of 'networkidle' for better reliability
  try {
    await page.waitForLoadState('load', { timeout: 10000 });
  } catch (e) {
    console.log('   ⚠️  Load state timeout, continuing anyway...');
  }
  
  await page.waitForTimeout(3000); // Give extra time for grid to render
  
  try {
    // Find all rows in the table body
    const allRows = page.locator('tbody tr');
    const rowCount = await allRows.count();
    console.log(`   Found ${rowCount} total rows in the grid`);
    
    // Find the row that contains Tennis Court #2
    // Look for the <p> tag with aria-label="Tennis Court #2"
    let court2Row = null;
    let court2RowIndex = -1;
    
    for (let i = 0; i < rowCount; i++) {
      const row = allRows.nth(i);
      
      // Check if this row contains the Tennis Court #2 label
      const court2Label = row.locator('p[aria-label="Tennis Court #2"]');
      const labelCount = await court2Label.count();
      
      if (labelCount > 0) {
        court2RowIndex = i;
        court2Row = row;
        console.log(`   ✅ Found Tennis Court #2 at row ${i + 1}`);
        break;
      }
    }
    
    if (!court2Row) {
      throw new Error('Could not find Tennis Court #2 in the grid. Court filter may have been cleared.');
    }
    
    // Scroll the row into view
    await court2Row.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // Now find all cells in this row
    const allCells = court2Row.locator('td');
    const cellCount = await allCells.count();
    console.log(`   Found ${cellCount} cells in Court #2 row`);
    
    // Find the cell that contains "10:00AM" text in a <p> tag
    let tenAMCell = null;
    let tenAMCellIndex = -1;
    
    for (let i = 0; i < cellCount; i++) {
      const cell = allCells.nth(i);
      
      // Look for <p> tag containing "10:00AM"
      const timeLabel = cell.locator('p:has-text("10:00AM")');
      const timeLabelCount = await timeLabel.count();
      
      if (timeLabelCount > 0) {
        tenAMCellIndex = i;
        tenAMCell = cell;
        console.log(`   ✅ Found 10:00AM cell at index ${i}`);
        break;
      }
    }
    
    if (!tenAMCell) {
      throw new Error('Could not find 10:00AM time slot in Court #2 row');
    }
    
    // Check the cell content for status
    const cellText = await tenAMCell.textContent();
    console.log(`   Cell content: "${cellText.trim()}"`);
    
    // Check if already reserved by you
    if (cellText.toLowerCase().includes('reserved by you')) {
      if (config.testMode) {
        console.log('   ⚠️  TEST MODE: Slot shows "Reserved by you", skipping click...');
        return true;
      } else {
        console.log('   ⚠️  10:00 AM slot is ALREADY RESERVED by you!');
        throw new Error('ALREADY_RESERVED');
      }
    }
    
    // Look for the AddIcon SVG (+ icon) which indicates availability
    const addIcon = tenAMCell.locator('svg[data-testid="AddIcon"]');
    const addIconCount = await addIcon.count();
    
    console.log(`   AddIcon count: ${addIconCount}`);
    
    if (addIconCount === 0) {
      // No + icon found - check if it's reserved or booked
      if (cellText.toLowerCase().includes('reserved') || cellText.toLowerCase().includes('booked')) {
        if (config.testMode) {
          console.log('   ⚠️  TEST MODE: Slot is reserved/booked, continuing anyway...');
          return true;
        } else {
          console.log('   ⚠️  10:00 AM slot is already reserved/booked');
          throw new Error('ALREADY_RESERVED');
        }
      }
      
      throw new Error('10:00 AM slot is not available on Court #2 (no AddIcon found)');
    }
    
    console.log(`   ✅ 10:00 AM slot is available! Found AddIcon.`);
    console.log(`   Clicking the cell...`);
    
    // Click the cell (not just the icon, click the whole cell)
    await tenAMCell.click();
    await page.waitForTimeout(1500);
    
    console.log(`   ✅ Successfully clicked 10:00 AM slot on Court #2`);
    return true;
    
  } catch (error) {
    if (error.message === 'ALREADY_RESERVED' && !config.testMode) {
      console.log('   ✅ Slot already reserved - no action needed');
      throw new Error('ALREADY_RESERVED');
    }
    
    console.error('   ❌ Cannot book slot:', error.message);
    throw error;
  }
}

async function confirmBooking(page) {
  console.log('   Clicking Continue...');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(1500);
}

async function confirmMemberAndProceed(page) {
  console.log('👤 Confirming Glen Ferrand as member...');
  
  // Check Glen Ferrand checkbox
  await page.getByRole('checkbox').check();
  await page.waitForTimeout(500);
  
  // Click Next
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForTimeout(2000);
}

async function completeBooking(page) {
  console.log('💳 Selecting payment method...');
  
  // Select saved VISA card ending in 4745
  await page.getByRole('radio', { name: /VISA ending in 4745/ }).check();
  await page.waitForTimeout(1000);
  
  // if (true) {
  //   console.log('⚠️  DEV MODE: Skipping final confirmation (payment not processed)');
  //   console.log('✅ Stopped before payment (dev mode)');
    
  //   // Keep browser open for 10 seconds so you can see the state
  //   console.log('⏳ Keeping browser open for 10 seconds...');
  //   await page.waitForTimeout(10000);
  // } else {
  
    console.log('💰 PRODUCTION MODE: Completing payment...');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForTimeout(3000);
    console.log('🎉 Booking confirmed and paid!');
  
}

// Helper: Get nth weekday of a month (e.g., 3rd Monday)
function getNthWeekdayOfMonth(year, month, weekday, n) {
  const firstDay = moment(`${year}-${String(month).padStart(2, '0')}-01`);
  const firstWeekday = firstDay.clone().day(weekday);
  
  // If the first occurrence is in the previous month, move to next week
  if (firstWeekday.month() !== month - 1) {
    firstWeekday.add(7, 'days');
  }
  
  // Add weeks to get to nth occurrence
  firstWeekday.add((n - 1) * 7, 'days');
  
  return firstWeekday;
}

// Helper: Get last weekday of a month (e.g., last Monday of May)
function getLastWeekdayOfMonth(year, month, weekday) {
  const lastDay = moment(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month');
  const lastWeekday = lastDay.clone().day(weekday);
  
  // If we went into next month, go back a week
  if (lastWeekday.month() !== month - 1) {
    lastWeekday.subtract(7, 'days');
  }
  
  return lastWeekday;
}

// Calculate US Federal Holidays dynamically for any year
function getUSFederalHolidays(year) {
  const holidays = [];
  
  // Fixed date holidays
  holidays.push(moment(`${year}-01-01`)); // New Year's Day
  holidays.push(moment(`${year}-07-04`)); // Independence Day
  holidays.push(moment(`${year}-11-11`)); // Veterans Day
  holidays.push(moment(`${year}-12-25`)); // Christmas Day
  
  // Additional observances
  holidays.push(moment(`${year}-10-31`)); // Halloween
  holidays.push(moment(`${year}-12-31`)); // New Year's Eve
  
  // Floating holidays (calculated dynamically)
  holidays.push(getNthWeekdayOfMonth(year, 1, 1, 3));  // MLK Day - 3rd Monday of January
  holidays.push(getNthWeekdayOfMonth(year, 2, 1, 3));  // Presidents' Day - 3rd Monday of February
  holidays.push(getLastWeekdayOfMonth(year, 5, 1));    // Memorial Day - Last Monday of May
  holidays.push(getNthWeekdayOfMonth(year, 9, 1, 1));  // Labor Day - 1st Monday of September
  holidays.push(getNthWeekdayOfMonth(year, 11, 4, 4)); // Thanksgiving - 4th Thursday of November
  
  return holidays;
}

function isHoliday(date) {
  const checkDate = moment(date);
  const year = checkDate.year();
  
  // Get holidays for this year
  const holidays = getUSFederalHolidays(year);
  
  // Check if the date matches any holiday
  for (const holiday of holidays) {
    if (checkDate.format('YYYY-MM-DD') === holiday.format('YYYY-MM-DD')) {
      return true;
    }
  }
  
  return false;
}

function getTargetBookingDate() {
  // Get current date in Pacific timezone
  const today = moment.tz(TIMEZONE);
  // 4 days ahead INCLUDING today means add 3 days
  // Today = Day 1, Tomorrow = Day 2, Day after = Day 3, Target = Day 4
  let targetDate = today.clone().add(3, 'days');
  let daysSkipped = 0;
  const maxSkips = 7; // Prevent infinite loop
  
  // Keep skipping if target date is Wednesday OR a US national holiday
  while (daysSkipped < maxSkips) {
    const isWednesday = BOOKING_CONFIG.skipDays.includes(targetDate.day());
    const isUSHoliday = isHoliday(targetDate);
    
    if (isWednesday) {
      console.log(`⏭️  ${targetDate.format('MMMM D (dddd)')} - Courts closed on Wednesday, skipping...`);
      targetDate.add(1, 'day');
      daysSkipped++;
    } else if (isUSHoliday) {
      console.log(`🎉 ${targetDate.format('MMMM D (dddd)')} - US National Holiday, skipping...`);
      targetDate.add(1, 'day');
      daysSkipped++;
    } else {
      break; // Found a valid date
    }
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

async function attemptBooking(retryCount = 0) {
  const targetDate = getTargetBookingDate();
  const maxRetries = 2; // Retry up to 2 times (total 3 attempts)
  const retryDelay = 20000; // 20 seconds between retries
  
  console.log(`\n🚀 Starting booking attempt ${retryCount + 1}/${maxRetries + 1}...`);
  console.log(`⏰ Current Pacific Time: ${moment.tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss z')}`);
  
  const browser = await chromium.launch({ 
    headless: config.browser.headless,
    slowMo: config.browser.slowMo,
    args: config.browser.args
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    const page = await context.newPage();
    
    await login(page);
    await selectTennisAndPickleballCard(page);
    await selectManhattanHeightsPark(page);
    await selectCourt2(page);
    await selectTargetDate(page, targetDate);
    await select10AMSlotOnCourt2(page);
    await confirmBooking(page);
    await confirmMemberAndProceed(page);
    await completeBooking(page);
    
    console.log('\n✅ SUCCESS! Court booked for Glen.');
    console.log(`   Date: ${moment(targetDate).format('YYYY-MM-DD (dddd)')}`);
    console.log(`   Location: Manhattan Heights Park`);
    console.log(`   Court: Tennis Court #2`);
    console.log(`   Time: 10:00 AM - 11:00 AM`);
    console.log(`   Booked at: ${moment.tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss z')}`);
    
    await browser.close();
    return true;
    
  } catch (error) {
    // Check if slot is already reserved - don't retry in this case
    if (error.message && error.message.includes('ALREADY_RESERVED')) {
      console.log('\n✅ Slot already reserved - no booking needed!');
      await browser.close();
      return true; // Return success since slot is already booked
    }
    
    console.error(`\n❌ Booking attempt ${retryCount + 1} failed:`, error.message);
    
    // Take screenshot on error
    try {
      const screenshotPath = `error-attempt${retryCount + 1}-${moment().format('YYYY-MM-DD-HHmmss')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`   Screenshot saved: ${screenshotPath}`);
    } catch (e) {
      // Ignore screenshot errors
    }
    
    await browser.close();
    
    // Retry logic
    if (retryCount < maxRetries) {
      console.log(`\n⏳ Waiting ${retryDelay / 1000} seconds before retry...`);
      console.log(`   Slots may not be released yet. Will retry in ${retryDelay / 1000} seconds.`);
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Recursive retry
      return attemptBooking(retryCount + 1);
    } else {
      console.error(`\n❌ All ${maxRetries + 1} booking attempts failed.`);
      console.error(`   Slot not available: 10:00 AM - 11:00 AM on Court #2`);
      console.error(`   Will try again tomorrow at 6:00 AM PST`);
      throw error;
    }
  }
}

async function runBooking() {
  return attemptBooking(0);
}

// Main execution
if (require.main === module) {
  runBooking().catch(console.error);
}

module.exports = { runBooking, calculateTimeUntilRelease };
