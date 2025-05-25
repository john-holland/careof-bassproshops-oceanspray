import { test, expect } from '@playwright/test';

test('capture client logs', async ({ page }) => {
  // Listen for all console events
  page.on('console', msg => {
    console.log(`Browser Console ${msg.type()}: ${msg.text()}`);
  });

  // Listen for all page errors
  page.on('pageerror', error => {
    console.log(`Page Error: ${error.message}`);
  });

  // Listen for all request errors
  page.on('requestfailed', request => {
    console.log(`Request Failed: ${request.url()} - ${request.failure()?.errorText}`);
  });

  // Navigate to the app
  await page.goto('http://localhost:3000');

  // Wait for the app to load
  await page.waitForSelector('#root');

  // Log the page content for debugging
  const content = await page.content();
  console.log('Page Content:', content);
}); 