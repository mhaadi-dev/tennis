// Configuration Template for Tennis Court Booking Bot
// Copy this file to config.js and fill in your actual values

module.exports = {
  // Login credentials
  credentials: {
    email: 'your-email@example.com',
    password: 'your-password',
    url: 'https://www.courts.manhattanbeach.gov/'
  },
  
  // Booking preferences
  booking: {
    location: 'Manhattan Heights Park',
    court: 'Court #2',
    timeSlot: '10:00 AM – 11:00 AM',
    daysInAdvance: 4, // 4 days ahead (today counts as day 1: Mon=1, Tue=2, Wed=3, Thu=4)
    skipDays: [3], // Wednesday = 3 (0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, etc.) - SKIP WEDNESDAYS
    releaseHour: 6, // 6:00 AM Pacific
    releaseMinute: 0,
    earlyAttemptSeconds: 1, // Try 1 second early for busy days
    
    // US National Holidays - Skip booking on these dates (format: 'MM-DD')
    // Courts are typically closed or unavailable on these days
    holidays: [
      '01-01', // New Year's Day
      '01-20', // Martin Luther King Jr. Day (3rd Monday of January - approximate)
      '02-17', // Presidents' Day (3rd Monday of February - approximate)
      '05-26', // Memorial Day (last Monday of May - approximate)
      '07-04', // Independence Day
      '09-01', // Labor Day (1st Monday of September - approximate)
      '10-31', // Halloween
      '11-11', // Veterans Day
      '11-27', // Thanksgiving (4th Thursday of November - approximate)
      '12-25', // Christmas Day
      '12-31'  // New Year's Eve
    ]
  },
  
  // Timezone
  timezone: 'America/Los_Angeles', // Pacific Time (Manhattan Beach)
  
  // Browser settings
  browser: {
    headless: true, // Set to false to see browser (for debugging)
    slowMo: 0, // Milliseconds delay between actions (0 for production, 500 for debugging)
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for VPS
  },
  
  // Development mode
  devMode: true // Set to false in production to enable actual payment
};
