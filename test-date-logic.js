// Test script to verify date calculation logic
const config = require('./config');

const BOOKING_CONFIG = {
  daysInAdvance: config.booking.daysInAdvance,
  skipDays: config.booking.skipDays
};

function getTargetBookingDate(testDate) {
  const today = testDate || new Date();
  let targetDate = new Date(today);
  targetDate.setDate(today.getDate() + BOOKING_CONFIG.daysInAdvance);
  
  // If target date is Wednesday, skip to Thursday (book 5 days ahead instead)
  if (BOOKING_CONFIG.skipDays.includes(targetDate.getDay())) {
    console.log('   ⚠️  Target is Wednesday (closed) - booking for Thursday instead');
    targetDate.setDate(targetDate.getDate() + 1);
  }
  
  return targetDate;
}

console.log('🧪 Testing Date Logic\n');
console.log('═'.repeat(70));
console.log(`Rule: Book ${BOOKING_CONFIG.daysInAdvance} days ahead (today = day 1), skip Wednesdays`);
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
  console.log(`\n📅 Today: ${name}, ${date.toLocaleDateString()}`);
  
  const targetDate = getTargetBookingDate(date);
  const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
  const daysAhead = Math.round((targetDate - date) / (1000 * 60 * 60 * 24));
  
  console.log(`   ✅ BOOK for: ${dayName}, ${targetDate.toLocaleDateString()} (${daysAhead} days ahead)`);
});

console.log('\n═'.repeat(70));
console.log(`Summary: Bot runs EVERY day at 6 AM, books ${BOOKING_CONFIG.daysInAdvance} days ahead`);
console.log('         Today counts as day 1 (Mon=1, Tue=2, Wed=3, Thu=4)');
console.log('         Wednesdays are skipped (books Thursday instead)');
console.log('═'.repeat(70));
console.log('\n✅ Date logic test complete!\n');
