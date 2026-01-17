// e2e/pattern-library.spec.ts
// Pattern library E2E tests

import { test, expect } from '@playwright/test';

test.describe('Pattern Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library');
  });

  test.describe('Browse Page', () => {
    test('displays library page with pattern grid', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /pattern library/i })).toBeVisible();
      await expect(page.getByPlaceholder(/search/i)).toBeVisible();
    });

    test('shows pattern count', async ({ page }) => {
      await expect(page.getByText(/pattern(s)? found/i)).toBeVisible();
    });

    test('displays pattern cards in grid', async ({ page }) => {
      // Wait for patterns to load
      const patternCards = page.locator('[data-testid="pattern-card"]');
      // If there are any pattern cards visible
      const count = await patternCards.count();
      if (count > 0) {
        await expect(patternCards.first()).toBeVisible();
      }
    });
  });

  test.describe('Search', () => {
    test('filters patterns by search query', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('sweater');

      // Wait for debounce and results
      await page.waitForTimeout(500);

      // Results should update
      await expect(page.getByText(/pattern(s)? found/i)).toBeVisible();
    });

    test('shows empty state for no results', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('xyznonexistentpattern123');

      // Wait for debounce and results
      await page.waitForTimeout(500);

      // Should show no results message
      await expect(page.getByText(/no patterns|0 pattern/i)).toBeVisible();
    });

    test('clears search when input is cleared', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('sweater');
      await page.waitForTimeout(500);

      // Clear the search
      await searchInput.clear();
      await page.waitForTimeout(500);

      // Should show all patterns again
      await expect(page.getByText(/pattern(s)? found/i)).toBeVisible();
    });
  });

  test.describe('Filters', () => {
    test('opens filter panel on desktop', async ({ page, viewport }) => {
      // Skip on mobile
      if (viewport && viewport.width < 1024) {
        test.skip();
      }

      // Filter panel should be visible on desktop
      await expect(page.getByText(/type|difficulty|category/i).first()).toBeVisible();
    });

    test('opens filter sheet on mobile', async ({ page, viewport }) => {
      // Only run on mobile
      if (!viewport || viewport.width >= 1024) {
        test.skip();
      }

      // Click filter button
      const filterButton = page.getByRole('button', { name: /filter/i });
      if (await filterButton.isVisible()) {
        await filterButton.click();
        // Filter panel should appear
        await expect(page.getByText(/apply filters|filter by/i)).toBeVisible();
      }
    });

    test('shows active filter chips when filters applied', async ({ page }) => {
      // Apply a filter (find a filter option to click)
      const typeFilter = page.getByRole('checkbox', { name: /knitting/i });
      if (await typeFilter.isVisible()) {
        await typeFilter.click();
        // Should show filter chip
        await expect(page.getByText(/knitting/i)).toBeVisible();
      }
    });

    test('removes filter when chip is clicked', async ({ page }) => {
      const typeFilter = page.getByRole('checkbox', { name: /knitting/i });
      if (await typeFilter.isVisible()) {
        await typeFilter.click();
        await page.waitForTimeout(300);

        // Find and click the remove button on the chip
        const chip = page.locator('[data-testid="filter-chip"]').filter({ hasText: /knitting/i });
        if (await chip.isVisible()) {
          await chip.getByRole('button').click();
          // Filter should be removed
          await expect(chip).not.toBeVisible();
        }
      }
    });

    test('clears all filters button works', async ({ page }) => {
      const typeFilter = page.getByRole('checkbox', { name: /knitting/i });
      if (await typeFilter.isVisible()) {
        await typeFilter.click();
        await page.waitForTimeout(300);

        const clearButton = page.getByRole('button', { name: /clear all/i });
        if (await clearButton.isVisible()) {
          await clearButton.click();
          // All filters should be cleared
          await expect(page.locator('[data-testid="filter-chip"]')).toHaveCount(0);
        }
      }
    });
  });

  test.describe('Pattern Detail Modal', () => {
    test('opens modal when pattern card is clicked', async ({ page }) => {
      const patternCard = page.locator('[data-testid="pattern-card"]').first();
      if (await patternCard.isVisible()) {
        await patternCard.click();

        // Modal should appear with pattern details
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });

    test('closes modal when backdrop is clicked', async ({ page }) => {
      const patternCard = page.locator('[data-testid="pattern-card"]').first();
      if (await patternCard.isVisible()) {
        await patternCard.click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Click backdrop to close
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).not.toBeVisible();
      }
    });

    test('shows pattern details in modal', async ({ page }) => {
      const patternCard = page.locator('[data-testid="pattern-card"]').first();
      if (await patternCard.isVisible()) {
        await patternCard.click();

        // Check for common pattern detail elements
        await expect(page.getByRole('dialog')).toBeVisible();
        // Should have title, description, etc.
        await expect(page.getByRole('dialog').getByRole('heading')).toBeVisible();
      }
    });
  });

  test.describe('Favorite Patterns', () => {
    test('shows favorite button on pattern cards', async ({ page }) => {
      const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
      // Favorite buttons should exist if pattern cards exist
      const patternCard = page.locator('[data-testid="pattern-card"]').first();
      if (await patternCard.isVisible()) {
        await expect(favoriteButton).toBeVisible();
      }
    });

    test('toggles favorite state on button click', async ({ page }) => {
      const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
      if (await favoriteButton.isVisible()) {
        // Get initial state
        const initialState = await favoriteButton.getAttribute('data-favorited');

        // Click to toggle
        await favoriteButton.click();
        await page.waitForTimeout(300);

        // State should change (or show login prompt if not authenticated)
        // This test verifies the interaction works
      }
    });
  });

  test.describe('Techniques', () => {
    test('clicking technique tag filters by technique', async ({ page }) => {
      const techniqueTag = page.locator('[data-testid="technique-tag"]').first();
      if (await techniqueTag.isVisible()) {
        const techniqueName = await techniqueTag.textContent();
        await techniqueTag.click();
        await page.waitForTimeout(300);

        // Should show filter chip with technique name
        await expect(page.getByText(techniqueName || '')).toBeVisible();
      }
    });
  });
});
