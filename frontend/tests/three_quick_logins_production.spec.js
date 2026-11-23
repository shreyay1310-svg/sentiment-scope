import { test, expect } from '@playwright/test';
import path from 'path';

test.use({ baseURL: 'https://sentiment-scope-alpha.vercel.app' });

test.describe('Production Verification - Three Quick Login Buttons', () => {
  const screenshotDir = path.resolve('./test-results/production_three_roles');

  test('Shreya (Super Admin), Alex Vance (Admin), and Demo User (Standard User) Quick Logins on Real Production Backend', async ({ page }) => {
    // -------------------------------------------------------------------------
    // 1. SHREYA QUICK LOGIN (SUPER ADMIN)
    // -------------------------------------------------------------------------
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Sentiment Scope' })).toBeVisible();
    await expect(page.getByText('ONE-CLICK QUICK EVALUATION LOGINS')).toBeVisible();

    // Click Shreya button
    console.log('Testing Shreya quick login on production...');
    await page.click('button:has-text("Shreya")');
    await expect(page).toHaveURL(/.*super-admin\/dashboard/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /Super Administrator Control Center/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enterprise User Directory' })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, 'prod_1_shreya_success.png'), fullPage: false });
    console.log('Shreya Super Admin dashboard verified on production.');

    // Logout
    await page.click('header button:has(img)');
    await page.click('button:has-text("Log Out")');
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });

    // -------------------------------------------------------------------------
    // 2. ALEX VANCE QUICK LOGIN (ADMIN)
    // -------------------------------------------------------------------------
    console.log('Testing Alex Vance quick login on production...');
    await page.click('button:has-text("Alex Vance")');
    await expect(page).toHaveURL(/.*admin\/dashboard/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /Team Operations & Department Oversight/ })).toBeVisible();
    await expect(page.getByText('Managed Analysts', { exact: true })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, 'prod_2_alex_success.png'), fullPage: false });
    console.log('Alex Vance Admin dashboard verified on production.');

    // Logout
    await page.click('header button:has(img)');
    await page.click('button:has-text("Log Out")');
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });

    // -------------------------------------------------------------------------
    // 3. DEMO USER QUICK LOGIN (STANDARD USER)
    // -------------------------------------------------------------------------
    console.log('Testing Demo User quick login on production...');
    await page.click('button:has-text("Demo User")');
    await expect(page).toHaveURL(/.*user\/dashboard/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /Welcome, Demo/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Analyze Sentiment' })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, 'prod_3_demo_success.png'), fullPage: false });
    console.log('Demo User Standard dashboard verified on production.');

    // Logout
    await page.click('header button:has(img)');
    await page.click('button:has-text("Log Out")');
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });
  });
});
