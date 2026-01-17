// e2e/auth.spec.ts
// Authentication flow E2E tests

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('displays login form correctly', async ({ page }) => {
      await page.goto('/login');

      // Check page title and form elements
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('shows validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');

      // Submit empty form
      await page.getByRole('button', { name: /sign in/i }).click();

      // Check for validation messages
      await expect(page.getByText(/email is required/i)).toBeVisible();
    });

    test('shows error for invalid email format', async ({ page }) => {
      await page.goto('/login');

      await page.getByLabel(/email/i).fill('invalidemail');
      await page.getByLabel(/password/i).fill('password123');
      await page.getByRole('button', { name: /sign in/i }).click();

      await expect(page.getByText(/valid email/i)).toBeVisible();
    });

    test('navigates to forgot password page', async ({ page }) => {
      await page.goto('/login');

      await page.getByRole('link', { name: /forgot password/i }).click();

      await expect(page).toHaveURL('/forgot-password');
    });

    test('navigates to register page', async ({ page }) => {
      await page.goto('/login');

      await page.getByRole('link', { name: /sign up|register|create account/i }).click();

      await expect(page).toHaveURL('/register');
    });
  });

  test.describe('Register Page', () => {
    test('displays registration form correctly', async ({ page }) => {
      await page.goto('/register');

      await expect(page.getByRole('heading', { name: /sign up|register|create account/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up|register|create/i })).toBeVisible();
    });

    test('shows validation for weak password', async ({ page }) => {
      await page.goto('/register');

      await page.getByLabel(/email/i).fill('test@example.com');
      // Try a weak password
      await page.getByLabel(/password/i).first().fill('123');

      await page.getByRole('button', { name: /sign up|register|create/i }).click();

      // Expect password strength validation
      await expect(page.getByText(/password.*characters|too short|stronger/i)).toBeVisible();
    });

    test('navigates to login page', async ({ page }) => {
      await page.goto('/register');

      await page.getByRole('link', { name: /sign in|log in|already have/i }).click();

      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Forgot Password Page', () => {
    test('displays forgot password form correctly', async ({ page }) => {
      await page.goto('/forgot-password');

      await expect(page.getByRole('heading', { name: /forgot|reset|password/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /send|reset|submit/i })).toBeVisible();
    });

    test('shows validation for empty email', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.getByRole('button', { name: /send|reset|submit/i }).click();

      await expect(page.getByText(/email.*required|enter.*email/i)).toBeVisible();
    });

    test('navigates back to login', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.getByRole('link', { name: /back|login|sign in/i }).click();

      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Protected Routes', () => {
    test('redirects unauthenticated user from dashboard', async ({ page }) => {
      await page.goto('/projects');

      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });

    test('redirects unauthenticated user from profile', async ({ page }) => {
      await page.goto('/profile');

      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });
  });
});
