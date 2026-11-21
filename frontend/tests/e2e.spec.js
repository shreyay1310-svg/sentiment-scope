import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Sentiment Scope End-to-End Suite', () => {
  const timestamp = Date.now();
  const testUser = {
    name: `Test User ${timestamp}`,
    email: `test_${timestamp}@sentimentscope.com`,
    password: 'Password123!',
    role: 'User'
  };

  test('Complete 11-Step User Journey', async ({ page }) => {
    // 1. Open Website
    await page.goto('/login');
    await expect(page).toHaveTitle(/Sentiment Scope/);

    // 2. Register a new user
    await page.click('text=Register here');
    await page.fill('input[placeholder="e.g. Maya Lin"]', testUser.name);
    await page.fill('input[placeholder="maya@company.com"]', testUser.email);
    await page.fill('input[placeholder="At least 6 characters"]', testUser.password);
    await page.click('button:has-text("Create Account")');

    // 3. Verify Login / Redirect to Dashboard
    await page.waitForURL('**/', { timeout: 10000 });
    await expect(page.locator(`text=${testUser.name.split(' ')[0]}`)).toBeVisible();

    // 4. Open Dashboard & verify metrics
    await expect(page.locator('text=Total Analyses')).toBeVisible();
    await expect(page.locator('text=Sentiment Distribution')).toBeVisible();

    // 5 & 6. Enter sample text & Analyze sentiment
    const sampleInput = 'Sentiment Scope analytics platform is extraordinarily intuitive and lightning fast!';
    await page.fill('textarea[placeholder="Type or paste your text here..."]', sampleInput);
    await page.click('button:has-text("Analyze")');

    // 7. Verify prediction result
    await expect(page.locator('text=Positive')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Confidence:')).toBeVisible();

    // 8. Upload a CSV file in Analyze Files module
    await page.click('text=Analyze Files');
    await page.waitForURL('**/analyze-files');

    const tempCsvPath = path.resolve('temp_playwright_test.csv');
    fs.writeFileSync(tempCsvPath, 'review_content\n"Outstanding speed and delightful UI!"\n"Service was delayed and support was unresponsive."\n');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('div:has-text("Drag & drop your dataset file here")').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(tempCsvPath);

    await page.click('button:has-text("Start Batch Analysis")');
    await expect(page.locator('text=Batch Classification Preview')).toBeVisible({ timeout: 15000 });

    if (fs.existsSync(tempCsvPath)) {
      fs.unlinkSync(tempCsvPath);
    }

    // 9. View Analysis History
    await page.click('text=History');
    await page.waitForURL('**/history');
    await expect(page.locator('text=Analysis Records & History')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // 10. Generate a Report
    await page.click('text=Reports');
    await page.waitForURL('**/reports');
    await expect(page.locator('text=Executive Intelligence Reports')).toBeVisible();
    await expect(page.locator('text=Volume Distribution by Category')).toBeVisible();

    // 11. Logout
    await page.click('text=Settings');
    await page.waitForURL('**/settings');
    await page.click('button:has-text("Sign Out of Account")');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page.locator('text=Sign In to Dashboard')).toBeVisible();
  });
});
