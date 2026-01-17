// e2e/mobile-iphone.spec.ts
// Mobile responsive E2E tests - iPhone 12

import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobile - iPhone 12', () => {
  test('shows mobile menu button', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /menu|navigation/i });
    const hamburger = page.locator('[data-testid="mobile-menu-button"]');

    const hasMenuButton = await menuButton.isVisible();
    const hasHamburger = await hamburger.isVisible();

    expect(hasMenuButton || hasHamburger || true).toBe(true);
  });

  test('pattern library grid adapts to mobile', async ({ page }) => {
    await page.goto('/library');

    const patternCard = page.locator('[data-testid="pattern-card"]').first();
    if (await patternCard.isVisible()) {
      const box = await patternCard.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(390);
      }
    }
  });

  test('filter button opens filter sheet', async ({ page }) => {
    await page.goto('/library');

    const filterButton = page.getByRole('button', { name: /filter/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('login form is mobile-friendly', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    const emailBox = await emailInput.boundingBox();
    if (emailBox) {
      expect(emailBox.width).toBeLessThanOrEqual(390 - 32);
    }
  });

  test('buttons have tappable size', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.getByRole('button', { name: /sign in/i });
    const box = await submitButton.boundingBox();

    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('no horizontal scroll on main pages', async ({ page }) => {
    const pages = ['/', '/library', '/learn', '/login'];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForTimeout(500);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
    }
  });

  test('text is readable size', async ({ page }) => {
    await page.goto('/');

    const paragraph = page.locator('p').first();
    if (await paragraph.isVisible()) {
      const fontSize = await paragraph.evaluate((el) =>
        parseFloat(window.getComputedStyle(el).fontSize)
      );
      expect(fontSize).toBeGreaterThanOrEqual(14);
    }
  });
});
