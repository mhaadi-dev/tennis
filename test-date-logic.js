// Test script to verify date calculation logic
const moment = require('moment-timezone');
const config = require('./config');

const BOOKING_CONFIG = config.booking;

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

function getTargetBookingDate(testDate) {
  const today = moment(testDate);
  let targetDate = today.clone().add(3, 'days'); // 4 days ahead including today
  let daysSkipped = 0;
  const maxSkips = 7;
  
  // Keep skipping if target date is Wednesday OR a US national holiday
  while (daysSkipped < maxSkips) {
    const isWednesday = BOOKING_CONFIG.skipDays.includes(targetDate.day());
    const isUSHoliday = isHoliday(targetDate);
    
    if (isWednesday) {
      console.log(`   ⚠️  ${targetDate.format('MMM D (ddd)')} - Wednesday (closed), skipping...`);
      targetDate.add(1, 'day');
      daysSkipped++;
    } else if (isUSHoliday) {
      console.log(`   🎉 ${targetDate.format('MMM D (ddd)')} - US Holiday, skipping...`);
      targetDate.add(1, 'day');
      daysSkipped++;
    } else {
      break;
    }
  }
  
  return targetDate;
}

console.log('🧪 Testing Date Logic\n');
console.log('═'.repeat(70));
console.log(`Rule: Book 3 days ahead (today = day 1), skip Wednesdays & US Holidays`);
console.log('═'.repeat(70));

// Test each day of the week
const testDays = [
  { name: 'Sunday', date: new Date('2025-01-19') },
  { name: 'Monday', date: new Date('2025-01-20') },
  { name: 'Tuesday', date: new Date('2025-01-21') },
  { name: 'Wednesday', date: new Date('2025-01-22') },
  { name: 'Thursday', date: new Date('2025-01-23') },
  { name: 'Friday', date: new Date('2025-01-24') },
  { name: 'Saturday', date: new Date('2025-01-25') }
];

testDays.forEach(({ name, date }) => {
  console.log(`\n📅 Today: ${name}, ${moment(date).format('M/D/YYYY')}`);
  
  const targetDate = getTargetBookingDate(date);
  const dayName = targetDate.format('dddd');
  const daysAhead = targetDate.diff(moment(date), 'days');
  
  console.log(`   ✅ BOOK for: ${dayName}, ${targetDate.format('M/D/YYYY')} (${daysAhead} days ahead)`);
});

// Test holiday scenarios
console.log('\n\n🎉 Testing Holiday Skip Logic');
console.log('═'.repeat(70));

const holidayTests = [
  { name: 'Before Christmas', date: new Date('2025-12-22') }, // Mon -> Thu is Christmas
  { name: 'Before New Year', date: new Date('2025-12-28') }, // Sun -> Wed is NYE
  { name: 'Before July 4th', date: new Date('2025-07-01') }  // Tue -> Fri is July 4th
];

holidayTests.forEach(({ name, date }) => {
  console.log(`\n📅 ${name}: ${moment(date).format('ddd, M/D/YYYY')}`);
  
  const targetDate = getTargetBookingDate(date);
  const daysAhead = targetDate.diff(moment(date), 'days');
  
  console.log(`   ✅ BOOK for: ${targetDate.format('ddd, M/D/YYYY')} (${daysAhead} days ahead)`);
});

console.log('\n═'.repeat(70));
console.log(`Summary: Bot runs EVERY day at 6 AM, books 3 days ahead`);
console.log('         Today counts as day 1 (Mon=1, Tue=2, Wed=3, Thu=4)');
console.log('         Skips: Wednesdays + US National Holidays');
console.log('═'.repeat(70));
console.log('\n✅ Date logic test complete!\n');
