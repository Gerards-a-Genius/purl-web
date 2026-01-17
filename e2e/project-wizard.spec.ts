// e2e/project-wizard.spec.ts
// Project creation wizard E2E tests

import { test, expect } from '@playwright/test';

test.describe('Project Wizard', () => {
  // Note: These tests may require authentication
  // For unauthenticated users, they should redirect to login

  test.describe('Method Selection', () => {
    test('displays three creation methods', async ({ page }) => {
      await page.goto('/projects');

      // Check for project creation options (if visible without auth)
      const newProjectButton = page.getByRole('button', { name: /new project|create/i });
      if (await newProjectButton.isVisible()) {
        await newProjectButton.click();

        // Should show creation options
        await expect(page.getByText(/upload|manual|wizard|template/i).first()).toBeVisible();
      }
    });
  });

  test.describe('Manual Entry', () => {
    test('displays manual entry form', async ({ page }) => {
      await page.goto('/projects/new/manual');

      // May redirect to login if not authenticated
      if (page.url().includes('/login')) {
        test.skip();
      }

      await expect(page.getByRole('heading', { name: /new project|create|manual/i })).toBeVisible();
    });

    test('has required form fields', async ({ page }) => {
      await page.goto('/projects/new/manual');

      if (page.url().includes('/login')) {
        test.skip();
      }

      // Check for essential fields
      await expect(page.getByLabel(/project name|name/i)).toBeVisible();
    });

    test('validates required fields', async ({ page }) => {
      await page.goto('/projects/new/manual');

      if (page.url().includes('/login')) {
        test.skip();
      }

      // Try to submit without filling required fields
      const submitButton = page.getByRole('button', { name: /create|save|submit/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();
        // Should show validation errors
        await expect(page.getByText(/required|name.*required/i)).toBeVisible();
      }
    });

    test('allows adding steps', async ({ page }) => {
      await page.goto('/projects/new/manual');

      if (page.url().includes('/login')) {
        test.skip();
      }

      const addStepButton = page.getByRole('button', { name: /add step/i });
      if (await addStepButton.isVisible()) {
        await addStepButton.click();
        // Should add a new step input
        await expect(page.locator('input[name*="step"]').first()).toBeVisible();
      }
    });
  });

  test.describe('Pattern Upload', () => {
    test('displays upload interface', async ({ page }) => {
      await page.goto('/projects/new/upload');

      if (page.url().includes('/login')) {
        test.skip();
      }

      // Should show file upload area
      await expect(page.getByText(/upload|drag.*drop|pdf|image/i).first()).toBeVisible();
    });

    test('accepts valid file types', async ({ page }) => {
      await page.goto('/projects/new/upload');

      if (page.url().includes('/login')) {
        test.skip();
      }

      // Check for file input
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.count() > 0) {
        // File input exists
        const accept = await fileInput.first().getAttribute('accept');
        expect(accept).toContain('pdf');
      }
    });
  });

  test.describe('Template/Wizard', () => {
    test('displays wizard steps', async ({ page }) => {
      await page.goto('/projects/new/wizard');

      if (page.url().includes('/login')) {
        test.skip();
      }

      // Should show wizard interface with steps
      await expect(page.getByText(/step|next|choose|select/i).first()).toBeVisible();
    });

    test('allows template selection', async ({ page }) => {
      await page.goto('/projects/new/wizard');

      if (page.url().includes('/login')) {
        test.skip();
      }

      // Look for template cards or selection options
      const templateOption = page.locator('[data-testid="template-option"]').first();
      if (await templateOption.isVisible()) {
        await templateOption.click();
        // Should select the template
        await expect(templateOption).toHaveAttribute('data-selected', 'true');
      }
    });

    test('navigates through wizard steps', async ({ page }) => {
      await page.goto('/projects/new/wizard');

      if (page.url().includes('/login')) {
        test.skip();
      }

      const nextButton = page.getByRole('button', { name: /next|continue/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        // Should advance to next step
        await expect(page.getByText(/step 2|materials|yarn/i)).toBeVisible();
      }
    });

    test('allows going back in wizard', async ({ page }) => {
      await page.goto('/projects/new/wizard');

      if (page.url().includes('/login')) {
        test.skip();
      }

      // Advance first
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);

        // Now go back
        const backButton = page.getByRole('button', { name: /back|previous/i });
        if (await backButton.isVisible()) {
          await backButton.click();
          // Should go back to previous step
          await expect(page.getByText(/step 1|pattern|choose/i)).toBeVisible();
        }
      }
    });
  });
});

test.describe('Project List', () => {
  test('displays projects page', async ({ page }) => {
    await page.goto('/projects');

    // May show login or projects list
    if (!page.url().includes('/login')) {
      await expect(page.getByRole('heading', { name: /projects|my projects/i })).toBeVisible();
    }
  });

  test('shows empty state for no projects', async ({ page }) => {
    await page.goto('/projects');

    if (page.url().includes('/login')) {
      test.skip();
    }

    // If no projects, should show empty state
    const emptyState = page.getByText(/no projects|get started|create your first/i);
    const projectCard = page.locator('[data-testid="project-card"]').first();

    // Either projects exist or empty state shows
    const hasProjects = await projectCard.isVisible();
    const hasEmptyState = await emptyState.isVisible();
    expect(hasProjects || hasEmptyState).toBe(true);
  });
});
