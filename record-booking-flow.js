const { chromium } = require('playwright');

// This script helps you record the actual booking flow
// Run with: node record-booking-flow.js

(async () => {
  console.log('🎬 Recording booking flow...');
  console.log('📝 Perform these steps manually:');
  console.log('   1. Log in with credentials');
  console.log('   2. Select Tennis & Pickleball');
  console.log('   3. Choose date (4 days from today)');
  console.log('   4. Select Manhattan Heights Park');
  console.log('   5. Choose Court #2');
  console.log('   6. Select 10:00 AM – 11:00 AM time slot');
  console.log('   7. Proceed to payment');
  console.log('   8. Select saved credit card');
  console.log('   9. Complete booking (or stop before final confirmation)');
  console.log('\n⚠️  Watch the console for selector suggestions!\n');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  // Log all clicks to help identify selectors
  page.on('click', async (element) => {
    try {
      const selector = await element.evaluate(el => {
        if (el.id) return `#${el.id}`;
        if (el.className) return `.${el.className.split(' ')[0]}`;
        return el.tagName.toLowerCase();
      });
      console.log(`🖱️  Clicked: ${selector}`);
    } catch (e) {
      // Ignore errors
    }
  });

  await page.goto('https://www.courts.manhattanbeach.gov/');

  console.log('\n👉 Perform the booking flow manually...');
  console.log('   Press Ctrl+C when done to exit\n');

  // Keep browser open
  await new Promise(() => {});
})();
