const { runBooking, calculateTimeUntilRelease } = require('./booking-bot');
const moment = require('moment-timezone');
const config = require('./config');

const TIMEZONE = config.timezone;

function scheduleNextRun() {
  const msUntilRelease = calculateTimeUntilRelease();
  const releaseTime = moment.tz(TIMEZONE).add(msUntilRelease, 'milliseconds');
  
  console.log(`\n⏰ Next booking attempt scheduled for:`);
  console.log(`   ${releaseTime.format('dddd, MMMM D, YYYY [at] h:mm:ss A z')}`);
  console.log(`   (in ${Math.round(msUntilRelease / 1000 / 60)} minutes)\n`);
  
  // Try at 5:59:59 for busy days (1 second before official release)
  const earlyAttemptMs = Math.max(0, msUntilRelease - 1000);
  
  setTimeout(async () => {
    console.log('\n🔔 Release window opening! Starting booking...\n');
    console.log('═'.repeat(60));
    
    try {
      await runBooking();
      console.log('\n═'.repeat(60));
      console.log('✅ Booking successful! Scheduling next run...');
    } catch (error) {
      console.log('\n═'.repeat(60));
      console.error('❌ Booking attempt failed:', error.message);
      console.log('Will retry tomorrow at 6:00 AM PST...');
    }
    
    // Schedule next day's booking
    scheduleNextRun();
    
  }, earlyAttemptMs);
}

console.log('═'.repeat(60));
console.log('🤖 Glen\'s Tennis Court Auto-Booking Bot Started');
console.log('═'.repeat(60));
console.log(`🌍 Server Time: ${moment().format('YYYY-MM-DD HH:mm:ss z')}`);
console.log(`🇺🇸 Pacific Time: ${moment.tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss z')}`);
console.log('📍 Location: Manhattan Heights Park');
console.log('🎾 Court: Court #2 (or first available)');
console.log('⏰ Time: 10:00 AM – 11:00 AM');
console.log(`📅 Booking: ${config.booking.daysInAdvance} days ahead (today = day 1)`);
console.log('⏭️  Skip: Wednesdays (courts closed)');
console.log(`🕐 Release window: ${config.booking.releaseHour}:${String(config.booking.releaseMinute).padStart(2, '0')} AM PST/PDT daily`);
console.log('═'.repeat(60));

// Start the scheduler
scheduleNextRun();

// Keep process alive and handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n═'.repeat(60));
  console.log('👋 Shutting down booking bot...');
  console.log('═'.repeat(60));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n═'.repeat(60));
  console.log('👋 Shutting down booking bot...');
  console.log('═'.repeat(60));
  process.exit(0);
});
