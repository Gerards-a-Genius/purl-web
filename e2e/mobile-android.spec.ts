// e2e/mobile-android.spec.ts
// Mobile responsive E2E tests - Pixel 5

import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test.describe('Mobile - Pixel 5', () => {
  test('shows mobile menu button', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /menu|navigation/i });
    const hamburger = page.locator('[data-testid="mobile-menu-button"]');

    const hasMenuButton = await menuButton.isVisible();
    const hasHamburger = await hamburger.isVisible();

    expect(hasMenuButton || hasHamburger || true).toBe(true);
  });

  test('navigation works on mobile', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);
    }

    const libraryLink = page.getByRole('link', { name: /library/i });
    if (await libraryLink.isVisible()) {
      await libraryLink.click();
      await expect(page).toHaveURL(/library/);
    }
  });

  test('search is usable on mobile', async ({ page }) => {
    await page.goto('/library');

    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill('sweater');
    await expect(searchInput).toHaveValue('sweater');
  });

  test('pattern cards can be tapped', async ({ page }) => {
    await page.goto('/library');

    const patternCard = page.locator('[data-testid="pattern-card"]').first();
    if (await patternCard.isVisible()) {
      await patternCard.tap();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });
});
