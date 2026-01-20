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
    daysInAdvance: 3, // 3 days ahead (today counts as day 1)
    skipDays: [3], // Wednesday = 3 (0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, etc.)
    releaseHour: 6, // 6:00 AM Pacific
    releaseMinute: 0,
    earlyAttemptSeconds: 1 // Try 1 second early for busy days
  },
  
  // Timezone
  timezone: 'America/Los_Angeles', // Pacific Time (Manhattan Beach)
  
  // Browser settings
  browser: {
    headless: true, // Set to false to see browser (for debugging)
    slowMo: 0, // Milliseconds delay between actions (0 for production, 500 for debugging)
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for VPS
  }
};
