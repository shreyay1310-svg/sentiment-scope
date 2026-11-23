import { test, expect } from '@playwright/test';
import path from 'path';

test.use({ baseURL: 'https://sentiment-scope-alpha.vercel.app' });

test.describe('Production Live Quick Login & RBAC Verification', () => {
  const screenshotDir = path.resolve('./test-results/production_live');

  test('All three quick login buttons authenticate against real production backend', async ({ page }) => {
    // -------------------------------------------------------------------------
    // 1. SHREYA (SUPER ADMIN)
    // -------------------------------------------------------------------------
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Sentiment Scope' })).toBeVisible();
    await expect(page.getByText('ONE-CLICK QUICK EVALUATION LOGINS')).toBeVisible();

    // Click Shreya quick login
    await page.click('button:has-text("Shreya")');
    await expect(page).toHaveURL(/.*super-admin\/dashboard/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /Super Administrator Control Center/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enterprise User Directory' })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, 'prod_1_shreya_super_admin.png'), fullPage: false });

    // Logout
    await page.click('header button:has(img)');
    await page.click('button:has-text("Log Out")');
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });

    // -------------------------------------------------------------------------
    // 2. ALEX VANCE (ADMIN)
    // -------------------------------------------------------------------------
    await page.click('button:has-text("Alex Vance")');
    await expect(page).toHaveURL(/.*admin\/dashboard/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /Team Operations & Department Oversight/ })).toBeVisible();
    await expect(page.getByText('Managed Analysts', { exact: true })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, 'prod_2_alex_admin.png'), fullPage: false });

    // Route guard test on production: Admin attempting Super Admin dashboard
    await page.goto('/super-admin/dashboard');
    await expect(page).toHaveURL(/.*unauthorized/, { timeout: 15000 });
    await expect(page.getByText('403 · Access Denied')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Restricted Enterprise Zone' })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, 'prod_2_alex_unauthorized.png'), fullPage: false });

    // Return and Logout
    await page.click('button:has-text("Return to My Authorized Dashboard")');
    await expect(page).toHaveURL(/.*admin\/dashboard/, { timeout: 15000 });
    await page.click('header button:has(img)');
    await page.click('button:has-text("Log Out")');
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });

    // -------------------------------------------------------------------------
    // 3. DEMO USER (STANDARD USER)
    // -------------------------------------------------------------------------
    await page.click('button:has-text("Demo User")');
    await expect(page).toHaveURL(/.*user\/dashboard/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /Welcome, Demo/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Analyze Sentiment' })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, 'prod_3_demo_user.png'), fullPage: false });

    // Route guard test on production: Standard User attempting Admin dashboard
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/.*unauthorized/, { timeout: 15000 });
    await expect(page.getByText('403 · Access Denied')).toBeVisible();

    // Logout
    await page.click('header button:has(img)');
    await page.click('button:has-text("Log Out")');
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });
  });
});
