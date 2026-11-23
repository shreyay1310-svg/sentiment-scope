import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Sentiment Scope - Enterprise Auth & Role-Based Dashboards', () => {
  const screenshotDir = path.resolve('./test-results/roles_demo');

  test('Comprehensive verification of Login, Register, 3 Role Dashboards, and Route Guards', async ({ page }) => {
    // -------------------------------------------------------------
    // PHASE 1: LOGIN PAGE VERIFICATION (Pixel Match Check)
    // -------------------------------------------------------------
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Sentiment Scope' })).toBeVisible();
    await expect(page.locator('text=AI-Powered Enterprise Sentiment Analytics')).toBeVisible();
    await expect(page.locator('text=ONE-CLICK QUICK EVALUATION LOGINS')).toBeVisible();

    // Verify Show/Hide password toggle
    const passwordInput = page.locator('input[placeholder="••••••••••••"]');
    await passwordInput.fill('SecretPass123!');
    const eyeToggle = page.locator('button:has(svg.lucide-eye)');
    await eyeToggle.click();
    await expect(page.locator('input[value="SecretPass123!"]')).toBeVisible();
    const eyeOffToggle = page.locator('button:has(svg.lucide-eye-off)');
    await eyeOffToggle.click();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    await page.screenshot({ path: path.join(screenshotDir, '0_login_page.png'), fullPage: false });

    // -------------------------------------------------------------
    // PHASE 2: REGISTRATION PAGE VERIFICATION
    // -------------------------------------------------------------
    await page.click('button:has-text("Register here")');
    await expect(page.locator('text=Full Name')).toBeVisible();
    await expect(page.locator('text=Email Address')).toBeVisible();
    await expect(page.locator('text=Phone Number')).toBeVisible();
    await expect(page.getByText('Password', { exact: true })).toBeVisible();
    await expect(page.locator('text=Confirm Password')).toBeVisible();
    await expect(page.locator('input[id="terms"]')).toBeVisible();

    // Test password strength meter
    await page.locator('input[type="password"]').first().fill('Weak');
    await expect(page.getByText('Weak', { exact: true })).toBeVisible();
    await page.locator('input[type="password"]').first().fill('StrongPass123!@#');
    await expect(page.getByText('Strong', { exact: true })).toBeVisible();

    await page.screenshot({ path: path.join(screenshotDir, '0_registration_page.png'), fullPage: false });

    // Return to login
    await page.click('button:has-text("Sign in here")');
    await expect(page.locator('text=ONE-CLICK QUICK EVALUATION LOGINS')).toBeVisible();

    // -------------------------------------------------------------
    // PHASE 3: SUPER ADMIN (Shreya)
    // -------------------------------------------------------------
    await page.click('button:has-text("Shreya")');
    await expect(page).toHaveURL(/.*super-admin\/dashboard/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Super Administrator Control Center/ })).toBeVisible();
    await expect(page.getByText('Total Users', { exact: true })).toBeVisible();
    await expect(page.getByText('System Health', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enterprise User Directory' })).toBeVisible();

    await page.screenshot({ path: path.join(screenshotDir, '1_super_admin_dashboard.png'), fullPage: false });

    // Open profile dropdown
    await page.click('header button:has(img)');
    await expect(page.locator('text=Super Admin').first()).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '1_super_admin_profile_badge.png'), fullPage: false });

    // Logout
    await page.click('button:has-text("Log Out")');
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });

    // -------------------------------------------------------------
    // PHASE 4: ADMIN (Alex Vance)
    // -------------------------------------------------------------
    await page.click('button:has-text("Alex Vance")');
    await expect(page).toHaveURL(/.*admin\/dashboard/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Team Operations & Department Oversight/ })).toBeVisible();
    await expect(page.getByText('Managed Analysts', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Department Sentiment Donut' })).toBeVisible();

    await page.screenshot({ path: path.join(screenshotDir, '2_admin_dashboard.png'), fullPage: false });

    // Verify Admin cannot access Super Admin dashboard (Route Guard test)
    await page.goto('/super-admin/dashboard');
    await expect(page).toHaveURL(/.*unauthorized/, { timeout: 10000 });
    await expect(page.getByText('403 · Access Denied')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Restricted Enterprise Zone' })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '2_admin_unauthorized_attempt.png'), fullPage: false });

    // Return to authorized dashboard
    await page.click('button:has-text("Return to My Authorized Dashboard")');
    await expect(page).toHaveURL(/.*admin\/dashboard/, { timeout: 10000 });

    // Logout
    await page.click('header button:has(img)');
    await page.click('button:has-text("Log Out")');
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });

    // -------------------------------------------------------------
    // PHASE 5: STANDARD USER (Demo User)
    // -------------------------------------------------------------
    await page.click('button:has-text("Demo User")');
    await expect(page).toHaveURL(/.*user\/dashboard/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Welcome, Demo/ })).toBeVisible();
    await expect(page.getByText('Positive', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Negative', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Analyze Sentiment' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Key Insights' })).toBeVisible();

    // Execute quick text analysis
    const textarea = page.locator('textarea[placeholder="Type or paste your text here..."]');
    await textarea.fill('Sentiment Scope provides unparalleled speed and exceptional accuracy for customer reviews!');
    await page.click('button:has-text("Analyze")');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(screenshotDir, '3_user_dashboard.png'), fullPage: false });

    // Verify Standard User cannot access Admin or Super Admin
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/.*unauthorized/, { timeout: 10000 });
    await expect(page.getByText('403 · Access Denied')).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '3_user_unauthorized_attempt.png'), fullPage: false });

    // Return to authorized dashboard
    await page.click('button:has-text("Return to My Authorized Dashboard")');
    await expect(page).toHaveURL(/.*user\/dashboard/, { timeout: 10000 });

    // Logout
    await page.click('header button:has(img)');
    await page.click('button:has-text("Log Out")');
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });
});
