# Test info

- Name: capture client logs
- Location: /Users/johnholland/Developers/bassproshopssimulation/server/apps/client/tests/e2e/debug.spec.ts:3:5

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

    at /Users/johnholland/Developers/bassproshopssimulation/server/apps/client/tests/e2e/debug.spec.ts:20:14
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('capture client logs', async ({ page }) => {
   4 |   // Listen for all console events
   5 |   page.on('console', msg => {
   6 |     console.log(`Browser Console ${msg.type()}: ${msg.text()}`);
   7 |   });
   8 |
   9 |   // Listen for all page errors
  10 |   page.on('pageerror', error => {
  11 |     console.log(`Page Error: ${error.message}`);
  12 |   });
  13 |
  14 |   // Listen for all request errors
  15 |   page.on('requestfailed', request => {
  16 |     console.log(`Request Failed: ${request.url()} - ${request.failure()?.errorText}`);
  17 |   });
  18 |
  19 |   // Navigate to the app
> 20 |   await page.goto('http://localhost:3000');
     |              ^ Error: page.goto: Target page, context or browser has been closed
  21 |
  22 |   // Wait for the app to load
  23 |   await page.waitForSelector('#root');
  24 |
  25 |   // Log the page content for debugging
  26 |   const content = await page.content();
  27 |   console.log('Page Content:', content);
  28 | }); 
```