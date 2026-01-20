const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://reservation.manhattanbeach.gov');

  console.log('👉 Please log in manually...');
  await page.waitForTimeout(60000); // 1 minute to login

  await context.storageState({ path: 'auth.json' });
  console.log('✅ Session saved to auth.json');

  await browser.close();
})();
